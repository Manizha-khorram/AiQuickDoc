from flask import Flask, request, jsonify
import boto3
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import io
import uuid
from flask_cors import CORS
from urllib.parse import urlparse, unquote
from typing import List
from gtts import gTTS
from io import BytesIO
import base64
import google.generativeai as genai
import tiktoken
import re

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Gemini API Configuration
genai.configure(api_key=os.environ["Gemini_API_Key"])
model = genai.GenerativeModel("gemini-1.5-flash")

def extract_text_from_pdf(pdf_bytes):
    pdf_stream = io.BytesIO(pdf_bytes)
    pdf = PdfReader(pdf_stream)
    full_text = ""

    for page in pdf.pages:
        full_text += page.extract_text() + "\n"

    return full_text

def removeDuplicateContent(text):
    sentences = re.split(r'(?<=[.!?]) +', text)
    unique_sentences = set()
    deduplicated_sentences = []

    for sentence in sentences:
        cleaned_sentence = sentence.strip()
        if cleaned_sentence not in unique_sentences:
            deduplicated_sentences.append(cleaned_sentence)
            unique_sentences.add(cleaned_sentence)

    return " ".join(deduplicated_sentences)

def generate_audio(text):
    tts = gTTS(text=text, lang='en')
    fp = BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp

def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

@app.route('/flashcards', methods=['POST'])
def flashcards():
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "No file provided"}), 400

    try:
        pdf_bytes = file.read()
        extracted_text = extract_text_from_pdf(pdf_bytes)
        
        # Optional: Remove duplicate content
        extracted_text = removeDuplicateContent(extracted_text)
        
        return jsonify({"extracted_text": extracted_text}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred during text extraction"}), 500

@app.route('/summarize', methods=['POST'])
def summarize_file():
    text_content = request.form.get('text_content')
    file = request.files.get('file')
    generate_audio_flag = request.form.get('generate_audio', 'false').lower() == 'true'

    if not file and not text_content:
        return jsonify({"error": "No file or text provided"}), 400

    try:
        if file:
            pdf_bytes = file.read()
            extracted_text = extract_text_from_pdf(pdf_bytes)
        else:
            extracted_text = text_content

        # Check token count
        token_count = num_tokens_from_string(extracted_text)
        max_tokens = 1048576  # Gemini Flash input token limit

        if token_count > max_tokens:
            return jsonify({"error": f"Input exceeds maximum token limit. Current: {token_count}, Max: {max_tokens}"}), 400

        prompt = f"Summarize the following text concisely:\n\n{extracted_text}\n\nSummary:"
        response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(
            max_output_tokens=8192  # Gemini Flash output token limit
        ))
        summary_text = response.text

        result = {"summary": summary_text}

        if generate_audio_flag:
            audio_fp = generate_audio(summary_text)
            audio_data = audio_fp.getvalue()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            result["audio"] = audio_base64

        return jsonify(result), 200

    except genai.GenerateContentError as e:
        print(f"Gemini API error: {str(e)}")
        return jsonify({"error": "Error generating summary"}), 500
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
   