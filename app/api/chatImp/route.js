import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from "@huggingface/inference";
import Groq from "groq-sdk";

const ragInstructions = `
When asked questions, answer only from the uploaded file using the RAG approach. Give short and precise answers that are clear to understand.
Depending on the type of question given to you, answer in the format the user would like. Always reference the file. Do not answer anything beyond that.

please make sure you send an accurate JSON format, do not write anything before or after the JSON format. 
DO NOT write anything before the opening brackets.
DO NOT write anything after the closing brackets.

When you answer, make sure you return it in a JSON file format like this:
{
  "message": your_message,
  "sessionId": session_id
}

If the answer doesn't exist in the file, clearly tell the user you are not able to answer the question since the file does not cover that information, in a polite way, like this: 
{
  "message": 'Hmmm I do not know that. Please ask me anything in the file.',
  "sessionId": session_id
}
`;

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const data = await req.json();

    // Initialize Pinecone
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Initialize Hugging Face Inference API
    const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

    const index = pc.index('rag-file-qa').namespace('ns1');

    const lastMessage = data.message;

    let messages = [
      {
        role: 'system',
        content: ragInstructions,
      },
      {
        role: 'user',
        content: data.message,
      }
    ];

    // Generate embedding for the query
    const embeddingResponse = await hf.featureExtraction({
      model: "intfloat/multilingual-e5-large",
      inputs: lastMessage,
      encoding_format: "float",
    });

    const embeddingVector = embeddingResponse[0];

    if (!embeddingVector || embeddingVector.length === 0) {
      throw new Error("Invalid or empty embedding vector.");
    }

    // Query Pinecone
    const results = await index.query({
      vector: embeddingVector,
      topK: 1,
      includeMetadata: true,
    });

    let context = "";
    if (results?.matches) {
      context = results.matches.map(match => match.metadata.text).join(" ");
      messages.push({
        role: "user",
        content: `${ragInstructions}\n${lastMessage}\n${context}`
      });
    }

    // Request completion from Groq API
    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: messages,
    });
    const response = completion.choices[0]?.message.content.trim()
    console.log(response)

    // Parse the JSON message from the completion response
    let parsedMessage;
    try {

      parsedMessage = JSON.parse(completion.choices[0]?.message.content.trim());
    } catch (error) {
      console.error('Error parsing message:', error);
      parsedMessage = { message: 'Hmmm I do not know that. Please ask me anything in the file.' };
    }

    // Construct the JSON response
    const jsonResponse = {
      message: parsedMessage.message || 'Hmmm I do not know that. Please ask me anything in the file.',
      sessionId: data.sessionId,
    };

    // Return JSON response
    return new NextResponse(JSON.stringify(jsonResponse), {
      headers: { 'Content-Type': 'application/json' },
    });


  } catch (err) {
    console.error('Error in POST /api/chatImp: ', err);

    const errorResponse = {
      message: "Internal Server Error",
      sessionId: null,
    };

    return new NextResponse(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}