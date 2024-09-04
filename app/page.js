"use client";
import React, { useState } from "react";
import Head from "next/head";
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Typography,
  Grid,
  Zoom,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import { ClerkProvider, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import getStripe from "@/utils/get-stripe";
import FileUploader from "./fileUploader/page";

const PricingOption = ({ title, price, description, features, submitFunc }) => (
  <Zoom in={true} style={{ transitionDelay: "500ms" }}>
    <Card
      raised
      sx={{ height: "100%", p: 1, background: "rgba(255, 255, 255, 0.05)" }}
    >
      <CardContent>
        <Box
          sx={{
            p: 3,
            border: "1px solid #00bcd4",
            borderRadius: 2,
            boxShadow: 2,
            textAlign: "left",
            backgroundColor: "transparent",
            transition: "0.3s",
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            {title}
          </Typography>
          <Typography variant="h6" component="p" sx={{ mb: 2 }}>
            ${price}
          </Typography>
          <Typography variant="body1" component="p" sx={{ mb: 4 }}>
            {description}
          </Typography>
          <Box sx={{ mb: 4 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Typography variant="body2">{feature}</Typography>
              </Box>
            ))}
          </Box>
          <Button variant="outlined" color="primary" onClick={submitFunc}>
            Get Started
          </Button>
        </Box>
      </CardContent>
    </Card>
  </Zoom>
);

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    const checkoutSession = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
      },
    });

    const checkoutSessionJson = await checkoutSession.json();

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  return (
    <Box>
      <AppBar
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
      </AppBar>

      <Head>
        <title>Centered Input</title>
      </Head>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <SignedIn>
          <FileUploader />
        </SignedIn>
        <SignedOut>
          <Typography variant="h6">Welcome to our app</Typography>
        </SignedOut>
      </Box>

      {/* Pricing Section */}
      <Box
        sx={{
          my: 8,
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          sx={{
            mb: 6,
            background: "linear-gradient(45deg, #00bcd4, #ff4081)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Pricing
        </Typography>
        <Grid container spacing={10} justifyContent="center">
          <Grid item xs={12} md={4}>
            <PricingOption
              title="Basic"
              price="0"
              description="For individuals just getting started."
              features={[
                "Unlimited flashcards",
                "Basic AI flashcard creation",
                "Limited support and features",
              ]}
              submitFunc={() => (window.location.href = "/generate")}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PricingOption
              title="Pro"
              price="10 /month"
              description="For power users who need more."
              features={[
                "All Basic features",
                "Access on any device",
                "Priority support and updates",
              ]}
              submitFunc={handleSubmit}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
