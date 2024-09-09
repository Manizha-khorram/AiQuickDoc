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

# Configure AWS S3
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)


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


    text = request.form.get('text')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        # Create a unique ID for the embedding session
        upload_session_id = str(uuid.uuid4())
        
        # Embed the text using the SentenceTransformer model
        embedding = embeddingModel.encode(text).tolist()
        
        # Store the embedding in Pinecone
        processed_data = [{
            "values": embedding,
            "id": f"{upload_session_id}_text_chunk",
            "metadata": {
                "upload_session_id": upload_session_id,
                "original_text": text
            }
        }]
        index.upsert(vectors=processed_data, namespace="ns1")
        
        return jsonify({
            "message": "Text embedded and stored successfully",
            "upload_session_id": upload_session_id,
            "summaries": []  # Include summaries if you generate them
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error embedding text: {str(e)}"}), 500

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
    text_content = request.form.get('text_content')
    file_url = request.form.get('file_url')
    
    if not file_url and not text_content:
        return jsonify({"error": "No file URL or text provided"}), 400

    try:
        if file_url:
            # Handle PDF file extraction
            parsed_url = urlparse(file_url)
            bucket_name = parsed_url.netloc.split('.')[0]
            object_key = unquote(parsed_url.path.lstrip('/'))

            response = s3.get_object(Bucket=bucket_name, Key=object_key)
            pdf_bytes = response['Body'].read()

            text_chunks = extract_text_from_pdf(pdf_bytes)
            extracted_text = ' '.join(text_chunks)  # Combine chunks into a single string
        else:
            # Handle provided text directly
            extracted_text = text_content
        
        return jsonify({"extracted_text": extracted_text}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred during text extraction"}), 500

    data = request.get_json()
    question = data.get('question')
    session_id = data.get('session_id')


 
    if not question or not session_id:
        return jsonify({"error": "Question or session_id missing"}), 400
    
    try:
        # Generate embedding for the question
        embedding = embeddingModel.encode(question).tolist()
        
        # Query Pinecone
        results = index.query(vector=embedding,
            namespace="ns1",
            top_k=3,
            include_metadata=True,
            filter={"upload_session_id": session_id})
      
        # Format the results
         # Collect metadata from the result chunks
        response_data = []
        combined_summary = []
       
        for match in results.get('matches', []):
            # Safely access metadata fields with defaults
            chunk_number = match.get('metadata', {}).get('chunk_number', "N/A")
            file_name = match.get('metadata', {}).get('file_name', "N/A")
            score = match.get('score', "N/A")

            response_data.append({
                "chunk_number": chunk_number,
                "file_name": file_name,
                "score": score
            })

            # Append chunk contents (assuming you have access to the text for each chunk)
            # Example: You could use some function to fetch the text for each chunk
            # combined_summary.append(get_chunk_text(match['id']))  # Hypothetical function

        # Combine the chunks into one summary
        combined_text = " ".join(combined_summary)  # This is your merged text

        # Deduplicate the content (if necessary)
        final_summary = removeDuplicateContent(combined_text)  # Hypothetical deduplication function
        
        # Format the response
        return jsonify({
            "message": "Query successful",
            "results": response_data,
            "summary": final_summary
        }), 200

    except Exception as e:
        print(f"Detailed error: {e}")  # Add this line for detailed error logging
        return jsonify({"error": f"Error querying Pinecone: {str(e)}"}), 500
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
    file_url = request.form.get('file_url')
    print('text', file_url)
    print('text', text_content)
    if not file_url and not text_content:
        return jsonify({"error": "No file URL or text provided"}), 400

    try:
        if file_url:
            # Handle PDF file summarization
            parsed_url = urlparse(file_url)
            bucket_name = parsed_url.netloc.split('.')[0]
            object_key = unquote(parsed_url.path.lstrip('/'))

            response = s3.get_object(Bucket=bucket_name, Key=object_key)
            pdf_bytes = response['Body'].read()

            text_chunks = extract_text_from_pdf(pdf_bytes)
            combined_text = " ".join(text_chunks)
        else:
            # Handle text summarization
            combined_text = text_content
            print('combinedtext', combined_text)
        # Use Gemini for summarization
        prompt = f"Summarize the following text concisely:\n\n{combined_text}\n\nSummary:"
        response = model.generate_content(prompt)
        print('res', response)
        summary_text = response.text
        print("Gemini Summary:", summary_text)  # Debug print
        
        # Generate audio
        try:
            audio_fp = generate_audio(summary_text)
            audio_data = audio_fp.getvalue()
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        except Exception as audio_error:
            print(f"Audio generation error: {str(audio_error)}")
            audio_base64 = None
        
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
