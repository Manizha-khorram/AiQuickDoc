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

    if (!file) {
      console.error("No file uploaded");
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${file.name}`,
      Body: buffer,
      ContentType: file.type,
    };

    const uploadResult = await s3.upload(s3Params).promise();
    console.log(`File uploaded to S3: ${uploadResult.Location}`);
    // Send data to Flask
    const response = await fetch("http://localhost:5000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        file_url: uploadResult.Location,
      }),
    });

    if (!response.ok) {
      throw new Error("Summarization failed");
    }

    const summarizeData = await response.json();
    console.log("Response from Flask:", summarizeData);

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded and summarized successfully",
        summaries: summarizeData.summaries,
        fileName: file.name,
      },
      { status: response.status }
    );
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during the process" },
      { status: 500 }
    );
  }
}
