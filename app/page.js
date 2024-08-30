"use client";
import React, { useState } from "react";
import Head from "next/head";
import TextField from "@mui/material/TextField";
import { Box, AppBar, Toolbar, Button, Typography } from "@mui/material";
import { ClerkProvider, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import FileUploader from "./fileUploader";

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <Box>
      {/* <AppBar
        position="fixed"
        sx={{ background: "transparent", backdropFilter: "blur(5px)" }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, mt: 1 }}>
            SummaryAI
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">
              Login
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              sx={{ ml: 1 }}
              href="/sign-up"
            >
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <Button color="inherit" href="/flashcards" sx={{ mr: 2 }}>
              Dashboard
            </Button>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar> */}

      <Head>
        <title>Centered Input</title>
      </Head>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <FileUploader />
      </Box>
    </Box>
  );
}
