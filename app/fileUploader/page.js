import React, { useState, useEffect } from "react";
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
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CardActionArea from "@mui/material/CardActionArea";

export default function FileUploadSummarize() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [uploadSessionId, setUploadSessionId] = useState("");
  const [flipped, setFlipped] = useState([]);

  useEffect(() => {
    console.log("Flashcards state updated:", flashcards);
  }, [flashcards]);

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

  const generateFlashcards = async () => {
    if (!file && !text) {
      setUploadStatus("Please enter text or select a file first.");
      return;
    }

    setIsGeneratingFlashcards(true);
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      console.log("Sending request to generate flashcards...");
      const response = await fetch("/api/flashcard", {
        method: "POST",
        body: formData,
      });

      console.log("Received response from server");
      const data = await response.json();
      console.log("Parsed response data:", data);

      if (data.flashcards && Array.isArray(data.flashcards)) {
        console.log("Setting flashcards state:", data.flashcards);
        setFlashcards(data.flashcards);
        setUploadStatus("Flashcards generated successfully!");
      } else {
        console.error("Invalid flashcards data:", data);
        setUploadStatus("Flashcard generation failed: Invalid data format");
      }
    } catch (error) {
      console.error("Flashcard generation error:", error);
      setUploadStatus("An error occurred during flashcard generation.");
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleCardClick = (index) => {
    setFlipped((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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
            <Grid item xs={4}>
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
                Upload
              </Button>
            </Grid>
            <Grid item xs={4}>
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
            <Grid item xs={4}>
              <Button
                variant="contained"
                color="success"
                startIcon={
                  isGeneratingFlashcards ? (
                    <CircularProgress size={24} />
                  ) : (
                    <NoteAddIcon />
                  )
                }
                onClick={generateFlashcards}
                disabled={isGeneratingFlashcards || (!file && !text)}
                fullWidth
              >
                Generate Flashcards
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

          {flashcards.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Generated Flashcards
              </Typography>
              <Grid container spacing={2}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                        bgcolor: "#f9f9f9",
                        color: "#333",
                      }}
                    >
                      <CardActionArea onClick={() => handleCardClick(index)}>
                        <CardContent>
                          <Box
                            sx={{
                              perspective: "1000px",
                              position: "relative",
                              width: "100%",
                              height: "200px",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Box
                              sx={{
                                transformStyle: "preserve-3d",
                                transition: "transform 0.6s",
                                transform: flipped.includes(index)
                                  ? "rotateY(180deg)"
                                  : "rotateY(0deg)",
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "absolute",
                                  width: "100%",
                                  height: "100%",
                                  backfaceVisibility: "hidden",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: 2,
                                  boxSizing: "border-box",
                                  border: "1px solid #00bcd4",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "normal",
                                  overflowY: "auto",
                                  textAlign: "center",
                                  wordWrap: "break-word",
                                  bgcolor: "#ffffff",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  align="center"
                                  sx={{
                                    overflow: "auto",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  {flashcard.front}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  position: "absolute",
                                  width: "100%",
                                  height: "100%",
                                  backfaceVisibility: "hidden",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: 2,
                                  boxSizing: "border-box",
                                  border: "1px solid #00bcd4",
                                  transform: "rotateY(180deg)",
                                  bgcolor: "#e1f5fe",
                                  whiteSpace: "normal",
                                  overflowY: "auto",
                                  textAlign: "center",
                                  wordWrap: "break-word",
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  align="center"
                                  sx={{
                                    lineHeight: 2,
                                    color: "#00796b",
                                  }}
                                >
                                  {flashcard.back}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {uploadSessionId && (
            <Card sx={{ mt: 2 }}>
              <CardHeader title="Chat with your document" />
              <CardContent>
                {/* Implement chat interface here */}
                <p>Chat</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
