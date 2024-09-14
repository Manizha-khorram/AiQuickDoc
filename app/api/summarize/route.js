import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/config";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const text = formData.get("text");

    let summaryData;

    if (file) {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error("Summarization failed");
      }

      summaryData = await response.json();
      console.log("summeryyy", summaryData);
    } else if (text) {
      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text_content: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Summarization failed");
      }

      summaryData = await response.json();
    } else {
      return NextResponse.json(
        { success: false, message: "No file or text provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "File processed successfully",
        summaries: summaryData.summary,
        audio: summaryData.audio,
        fileName: file ? file.name : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during the process" },
      { status: 500 }
    );
  }
}
