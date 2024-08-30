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

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)
model = SentenceTransformer('intfloat/multilingual-e5-large')

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

# Check if the index exists before trying to create it
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
    return text_chunks

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

    # Process the file
    try:
        chunks = extract_text_from_pdf(pdf_bytes)
        upload_session_id = str(uuid.uuid4())
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
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

    return jsonify({"message": "File processed and uploaded successfully"}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)
