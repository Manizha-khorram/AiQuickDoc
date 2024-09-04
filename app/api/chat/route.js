import AWS from "aws-sdk";
import { NextRequest, NextResponse } from "next/server";

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
    const text = formData.get("text"); // Get the text input

    // If text input is provided, send it to the backend for embedding and storing in Pinecone
    if (text) {
      const response = await fetch("http://localhost:5000/embed_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP Error:", errorText);
        return NextResponse.json(
          {
            success: false,
            message: "An error occurred during the text processing",
          },
          { status: 500 }
        );
      }

      const data = await response.json();
      return NextResponse.json(
        {
          success: true,
          message: "Text processed successfully",
          upload_session_id: data.upload_session_id,
          summaries: data.summaries,
        },
        { status: response.status }
      );
    }

    // Handle file upload if a file is provided
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${file.name}`,
        Body: buffer,
        ContentType: file.type,
      };

      const uploadResult = await s3.upload(s3Params).promise();
      console.log(`File uploaded to S3: ${uploadResult.Location}`);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          file_url: uploadResult.Location,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP Error:", errorText);
        return NextResponse.json(
          {
            success: false,
            message: "An error occurred during the file processing",
          },
          { status: 500 }
        );
      }

      const data = await response.json();
      return NextResponse.json(
        {
          success: true,
          message: "File processed successfully",
          upload_session_id: data.upload_session_id,
          fileName: data.fileName,
          summaries: data.summaries,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: false, message: "No text or file provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during the fetch" },
      { status: 500 }
    );
  }
}
