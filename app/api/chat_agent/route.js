import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const systemPrompt = `
System Prompt: AiQuickDoc agent
Objective: Provide insights and responses based on the data retrieved from the user's file or text.
Instructions:
- If the user asks what the text or document is about, give a summary of the written text or uploaded file.
- Avoid repeating the same information multiple times in the response.
- Use the data results to answer the user's question in a conversational manner.
- Provide a summary of the document when the user asks general questions like 'What is this file about?'
- If the user asks about specific topics, provide more detailed information on that subject.
- If the document lacks details on a specific topic, inform the user and offer to explain the topic based on external knowledge.
- If the user's question seems unrelated to the document content, indicate that the question is unrelated but offer to provide additional information if needed.
- Avoid giving the user technical info about how the file is stored in Pinecone or info about chunks. 
- DO NOT mention any of the above to the to user except for relevant information!
- Keep it brief, concise and friendly.
`;

// Function to remove duplicate content
function removeDuplicateContent(text) {
  const lines = text.split("\n");
  const uniqueLines = Array.from(new Set(lines));
  return uniqueLines.join("\n");
}

// Initialize GROQ API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  const { message, session_id } = await req.json();


  if (!session_id) {
    return NextResponse.json(
      { success: false, message: "No session ID provided" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send the user's question to the backend for Pinecone querying
        const backendResponse = await fetch(`http://localhost:5000/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, question: message }),
        });

        const backendData = await backendResponse.json();

        let finalPrompt;

        if (
          !backendData?.results ||
          backendData.results.length === 0 ||
          backendData.results[0].score < 0.5
        ) {
          // If no relevant results or low similarity, assume question is unrelated to document
          finalPrompt = `
          The user's question appears to be unrelated to the document. Please answer the following question based on your general knowledge:
          
          User Question: ${message}

          If you don't have enough information to answer the question, please let the user know and offer to provide general information on the topic or related subjects.`;
        } else {
          // Format Pinecone results and create prompt as before
          const pineconeResults = backendData.results
            .map((result) => {
              const chunkNumber =
                result.metadata?.chunk_number !== undefined
                  ? result.metadata.chunk_number
                  : "N/A";
              const fileName = result.metadata?.file_name || "N/A";
              const score = result.score || "N/A";
              return `Chunk ${chunkNumber}: ${fileName} with score ${score}`;
            })
            .join("\n");

          finalPrompt = `${systemPrompt}\nUser Question: ${message}\nData Results:\n${pineconeResults}`;
        }

        // Request streaming completion from GROQ API
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: finalPrompt }],
          model: "mixtral-8x7b-32768",
          stream: true,
        });

        let responseMessage = "";

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            responseMessage += content;
          }
        }

        // Remove duplicate content before sending response
        const uniqueContent = removeDuplicateContent(responseMessage);
        controller.enqueue(uniqueContent);
      } catch (error) {
        console.error("Error in chat route:", error);
        controller.enqueue("Error: " + error.message);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
