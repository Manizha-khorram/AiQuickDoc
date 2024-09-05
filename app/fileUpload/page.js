'use client';
import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SummarizeIcon from "@mui/icons-material/Summarize";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBot from "../chatBot/page";

function FileUploadSummarize() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [uploadSessionId, setUploadSessionId] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const chatWithFile = async () => {
    if (!file) {
      setUploadStatus("Please select a file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus("File uploaded, start chatting with your PDF.");
        setUploadSessionId(data.upload_session_id);
      } else {
        setUploadStatus("Upload failed: " + data.message);
      }
    } catch (error) {
      setUploadStatus("An error occurred during upload.");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };


  const summarizeFile = async () => {
    if (!file) {
      setSummary("Please select a file first.");
      return;
    }

    setIsSummarizing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log("data", data);
      if (data.success) {
        setSummary(data.summaries);
      } else {
        setSummary("Summarization failed: " + data.message);
      }
    } catch (error) {
      setSummary("An error occurred during summarization.");
      console.error("Summarization error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", p: 2 }}>
      <Card>
        <CardHeader title="File Upload and Summarization" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                type="file"
                fullWidth
                onChange={handleFileChange}
                inputProps={{ accept: ".pdf" }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  isUploading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <ChatIcon />
                  )
                }
                onClick={chatWithFile}
                disabled={isUploading || !file}
                fullWidth
              >
                Chat with your PDF
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={
                  isSummarizing ? (
                    <CircularProgress size={24} />
                  ) : (
                    <SummarizeIcon />
                  )
                }
                onClick={summarizeFile}
                disabled={isSummarizing || !file}
                fullWidth
              >
                Summarize
              </Button>
            </Grid>
          </Grid>

          {uploadStatus && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body1">{uploadStatus}</Typography>
            </Alert>
          )}

          {summary && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="h6">Summary</Typography>
              <Typography variant="body1">{summary}</Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {uploadSessionId && (
        <Card sx={{ mt: 2 }}>
          <CardHeader title="Chat with your document" />
          <CardContent>
            <ChatBot uploadSessionId={uploadSessionId} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default FileUploadSummarize;

