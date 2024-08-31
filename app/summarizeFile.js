import { useState } from "react";

export default function SummarizeButton() {
  const [vector, setVector] = useState(null);

  const handleSummarize = async () => {
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vector }), // Send the vector as JSON
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const result = await response.json();
      console.log("Summary Result:", result);
      // Handle result (e.g., update state, display summary, etc.)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleSummarize}>Summarize</button>;
}
