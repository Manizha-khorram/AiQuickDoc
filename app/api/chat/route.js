import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const systemPrompt = `
System Prompt: AiQuickDoc agent
Objective: Provide insights and responses based on the summary of the user's file or text.
Instructions:
- Use the provided summary to answer the user's questions in a conversational manner.
- If the user asks what the text or document is about, provide a brief overview based on the summary.
- Avoid repeating the same information multiple times in the response.
- If the user asks about specific topics, provide more detailed information if available in the summary.
- If the summary lacks details on a specific topic, inform the user and offer to explain the topic based on external knowledge.
- If the user's question seems unrelated to the summary content, indicate that the question is unrelated but offer to provide additional information if needed.
- Keep responses brief, concise, and friendly.
- DO NOT mention any technical details about how the summary was generated or stored.
`;

// Initialize GROQ API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  const { message, summary } = await req.json();

  if (!summary) {
    return NextResponse.json(
      { success: false, message: "No summary provided" },
      { status: 400 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const finalPrompt = `
          ${systemPrompt}
          
          Document Summary:
          ${summary}
          
          User Question: ${message}
          
          Please provide a response based on the above summary and question.
        `;

        // Request streaming completion from GROQ API
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: finalPrompt }],
          model: "mixtral-8x7b-32768",
          stream: true,
        });

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(content);
          }
        }
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
