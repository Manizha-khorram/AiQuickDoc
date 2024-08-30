"use client";

import { useState } from "react";
import { Button, Typography, Box, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function FileUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
        return;
      }

      const data = await response.json();
      setMessage(data.message || "File uploaded successfully");
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessage("An error occurred during the fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        border: "1px dashed #ccc",
        borderRadius: 1,
        maxWidth: 400,
        margin: "auto",
        textAlign: "center",
      }}
    >
      <CloudUploadIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Upload Your File
      </Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            variant="contained"
            component="span"
            color="primary"
            sx={{ mb: 2 }}
          >
            Choose File
          </Button>
        </label>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
        </Button>
      </form>
      {message && (
        <Typography
          variant="body2"
          color={message.startsWith("Error") ? "error" : "success"}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default FileUploader;
