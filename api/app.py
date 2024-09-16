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

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)


# Gemini API Configuration
genai.configure(api_key=os.environ["Gemini_API_Key"])
model = genai.GenerativeModel("gemini-1.5-flash")


def extract_text_from_pdf(pdf_bytes, chunk_size=1000):
    text_chunks = []
    current_chunk = ""
    pdf_stream = io.BytesIO(pdf_bytes)
    pdf = PdfReader(pdf_stream)

    for page_num in range(len(pdf.pages)):
        page = pdf.pages[page_num]
        text = page.extract_text()
        if text:
            for line in text.split('\n'):
                if len(current_chunk) + len(line) > chunk_size:
                    text_chunks.append(current_chunk)
                    current_chunk = line + '\n'
                else:
                    current_chunk += line + '\n'
            if current_chunk:
                text_chunks.append(current_chunk)
                current_chunk = ""
    print(f"Extracted {len(text_chunks)} text chunks.")
    return text_chunks


#Remove Duplicates
import re

def removeDuplicateContent(text):
    # Split the text into sentences or lines
    sentences = re.split(r'(?<=[.!?]) +', text)

    # Use a set to keep track of unique sentences
    unique_sentences = set()
    deduplicated_sentences = []

    for sentence in sentences:
        # Strip leading/trailing whitespace and check if the sentence is unique
        cleaned_sentence = sentence.strip()
        if cleaned_sentence not in unique_sentences:
            deduplicated_sentences.append(cleaned_sentence)
            unique_sentences.add(cleaned_sentence)

    # Join the deduplicated sentences back into a single string
    return " ".join(deduplicated_sentences)

@app.route('/flashcards', methods=['POST'])
def flashcards():
  
    file = request.files.get('file')

    if not file:
        return jsonify({"error": "No file or text provided"}), 400

    try:
        if file:
            pdf_bytes = file.read()
            text_chunks = extract_text_from_pdf(pdf_bytes)
            extracted_text = ' '.join(text_chunks)
        
        return jsonify({"extracted_text": extracted_text}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred during text extraction"}), 500
   
#Summarize       

def generate_audio(text):
    tts = gTTS(text=text, lang='en')
    fp = BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp



@app.route('/summarize', methods=['POST'])
def summarize_file():
    text_content = request.form.get('text_content')
    file = request.files.get('file')

    if not file and not text_content:
        return jsonify({"error": "No file or text provided"}), 400

    try:
        if file:
            # Handle PDF file summarization
            pdf_bytes = file.read()
            extracted_text = extract_text_from_pdf(pdf_bytes)
        else:
            # Handle text summarization
            extracted_text = text_content

        # Use Gemini for summarization
        prompt = f"Summarize the following text concisely:\n\n{extracted_text}\n\nSummary:"
        response = model.generate_content(prompt)
        summary_text = response.text

        # Generate audio
        audio_fp = generate_audio(summary_text)
        audio_data = audio_fp.getvalue()
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')

        return jsonify({
            "summary": summary_text,
            "audio": audio_base64
        }), 200

    except Exception as e:
        print(f"Error during summarization: {str(e)}")
        return jsonify({"error": f"Error processing input: {str(e)}"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    