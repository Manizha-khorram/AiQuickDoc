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

export default function FileUploadSummarize() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [uploadSessionId, setUploadSessionId] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setText("");
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
    setFile(null);
  };

  const uploadFileOrText = async () => {
    if (!file && !text) {
      setUploadStatus("Please enter text or select a file first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus(
          "Uploaded successfully! You can now chat with your input."
        );
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

  const summarizeFileOrText = async () => {
    if (!file && !text) {
      setSummary("Please enter text or select a file first.");
      return;
    }

    setIsSummarizing(true);
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

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
        <CardHeader title="File Upload or Text Input and Summarization" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Enter text or choose a file"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={text}
                onChange={handleTextChange}
              />
            </Grid>
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
                    <CloudUploadIcon />
                  )
                }
                onClick={uploadFileOrText}
                disabled={isUploading || (!file && !text)}
                fullWidth
              >
                Chat with your Input
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
                onClick={summarizeFileOrText}
                disabled={isSummarizing || (!file && !text)}
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
            {/* Implement chat interface here */}
            <Typography variant="body1" sx={{ mt: 2 }}>
              Chat functionality to be implemented...
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
