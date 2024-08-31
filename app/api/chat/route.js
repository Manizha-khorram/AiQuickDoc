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
        { success: false, message: "An error occurred during the upload" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Response from Flask:", data);

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        upload_session_id: data.upload_session_id,
        fileName: data.fileName,
        summaries: data.summaries,
      },
      { status: response.status }
    );
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during the fetch" },
      { status: 500 }
    );
  }
}
