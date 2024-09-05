from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import boto3
import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import io
import uuid
from flask_cors import CORS
from urllib.parse import urlparse, unquote
from transformers import BartTokenizer, BartForConditionalGeneration
from typing import List

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)
model = SentenceTransformer('intfloat/multilingual-e5-large')

# Initialize summarization model
tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
bart_model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')

def old_summarization_pipeline(text: List[str]) -> List[str]:
    input_ids = tokenizer.batch_encode_plus(
        text, 
        truncation=True, 
        padding=True, 
        return_tensors='pt', 
        max_length=1024
    )['input_ids']
    
    summary_ids = bart_model.generate(input_ids)
    
    summaries = [
        tokenizer.decode(s, skip_special_tokens=True, clean_up_tokenization_spaces=True) 
        for s in summary_ids
    ]
    
    return summaries

# Configure AWS S3
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

# Initialize Pinecone
api_key = os.getenv('PINECONE_API_KEY')
pc = Pinecone(api_key=api_key)
index_name = "summeryai"
dimension = 1024
metric = 'cosine'

# Check if the index exists before creating it
existing_indexes = pc.list_indexes()
if index_name not in existing_indexes:
    try:
        pc.create_index(
            name=index_name, dimension=dimension, metric=metric,
            spec=ServerlessSpec(cloud='aws', region='us-east-1')
        )
        print(f"Index '{index_name}' created successfully.")
    except Exception as e:
        print(f"An error occurred while creating the index: {e}")
else:
    print(f"Index '{index_name}' already exists.")

# Initialize the index
try:
    index = pc.Index(index_name)
    print(f"Index '{index_name}' initialized successfully.")
except Exception as e:
    print(f"An error occurred while initializing the index: {e}")
    raise

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
    


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file_url' not in request.form:
        return jsonify({"error": "No file URL provided"}), 400
    
    file_url = request.form.get('file_url')
    
    if not file_url:
        return jsonify({"error": "Empty file URL provided"}), 400

    try:
        # Parse and decode the URL
        parsed_url = urlparse(file_url)
        bucket_name = parsed_url.netloc.split('.')[0]  # Extract bucket name from the URL
        object_key = unquote(parsed_url.path.lstrip('/'))  # Decode URL and remove leading '/' from the path
        
        # Fetch the file from S3
        response = s3.get_object(Bucket=bucket_name, Key=object_key)
        pdf_bytes = response['Body'].read()
    except Exception as e:
        return jsonify({"error": f"Failed to fetch file from S3: {str(e)}"}), 500

    try:
        chunks = extract_text_from_pdf(pdf_bytes)
        upload_session_id = str(uuid.uuid4())
        
        # Upload original text chunks to Pinecone
        for i, chunk in enumerate(chunks):
            embedding = model.encode(chunk).tolist()
            processed_data = [{
                "values": embedding,
                "id": f"{upload_session_id}_{os.path.basename(object_key)}_chunk_{i}",
                "metadata": {
                    "file_name": os.path.basename(object_key),
                    "chunk_number": i,
                    "upload_session_id": upload_session_id
                }
            }]
            index.upsert(vectors=processed_data, namespace="ns1")
        
        return jsonify({
            "message": "File processed and uploaded successfully",
            "file_name": os.path.basename(object_key),
            "upload_session_id": upload_session_id,
            "file_url": file_url
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@app.route('/summarize', methods=['POST'])
def summarize_file():
    text_content = request.form.get('text_content')
    file_url = request.form.get('file_url')
    
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
        else:
            # Handle text summarization
            text_chunks = [text_content]
        
        summaries = old_summarization_pipeline(text_chunks)
        return jsonify({"summaries": summaries}), 200

    except Exception as e:
        return jsonify({"error": f"Error processing input: {str(e)}"}), 500
    
    

if __name__ == '__main__':
    app.run(port=5000, debug=True)
