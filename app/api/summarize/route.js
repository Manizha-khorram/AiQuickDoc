import AWS from "aws-sdk";
import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/config";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const text = formData.get("text");

    let fileUrl = "";
    let summaryData;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${file.name}`,
        Body: buffer,
        ContentType: file.type,
      };

      const uploadResult = await s3.upload(s3Params).promise();
      fileUrl = uploadResult.Location;
      console.log(`File uploaded to S3, here is the url: ${fileUrl}`);

      console.log("Sending request to Flask backend");
      // Send PDF file URL to Flask for summarization
      const response = await fetch(`${BACKEND_URL}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          file_url: fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Summarization failed");
      }

      summaryData = await response.json();
    } else if (text) {
      // Send text directly to Flask for summarization
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
      console.log("summaryDataBackend", summaryData);
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
