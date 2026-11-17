
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ELINA AI Backend is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL;

    if (!apiKey || !baseUrl || !model) {
      return res.status(503).json({
        error: "AI service is not configured yet"
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are ELINA, a friendly AI assistant. " +
          "Talk naturally in simple Hindi or English. " +
          "Be helpful, respectful and concise."
      },
      ...history.slice(-10),
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "AI service request failed"
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content ||
        "Please try again."
    });

  } catch (error) {
    res.status(500).json({
      error: "Something went wrong"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ELINA server running on ${PORT}`);
});
