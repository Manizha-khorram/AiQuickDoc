import { PineconeClient } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const pc = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY,
});
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const index = pc.index("summeryai").namespace("ns1");

export async function POST(request) {
  try {
    const { vector } = await request.json(); // Receive the vector

    // Query Pinecone for similar data
    const pineconeResponse = await index.query({
      vector,
      topK: 1, // Number of similar results to retrieve
      includeMetadata: true,
    });

    if (!pineconeResponse.matches || pineconeResponse.matches.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No matching data found in Pinecone",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const pineconeMatch = pineconeResponse.matches[0];
    const summaryText =
      pineconeMatch.metadata.summary || "No summary available";

    // Process summary with Groq
    const groqQuery = `*[_type == "summary" && summary == "${summaryText}"]`;
    const groqResult = await groq.query(groqQuery);

    // Send response back to frontend
    return new Response(
      JSON.stringify({
        success: true,
        message: "Data processed and summarized successfully",
        pineconeData: pineconeMatch,
        summary: summaryText,
        groqResult,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fetch Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An error occurred during the process",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
