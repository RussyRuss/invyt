require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 CONNECT TO MONGO
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB ERROR:", err));

// 🔥 MODEL
const RSVP = mongoose.model("RSVP", {
  name: String,
  guest: String,
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is working");
});

// 🔥 POST RSVP (SAVE TO DB)
app.post("/rsvp", async (req, res) => {
  const { name, guest } = req.body;

  console.log("Incoming:", req.body);

  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  const exists = await RSVP.findOne({ name });

  if (exists) {
    return res.status(400).json({ error: "Already RSVPed" });
  }

  await RSVP.create({ name, guest });

  const total = await RSVP.countDocuments();

  res.json({
    message: "Saved 🎉",
    total,
  });
});

// 🔥 GET ALL RSVPS
app.get("/rsvp", async (req, res) => {
  const guests = await RSVP.find();
  const total = guests.length;

  res.json({ total, guests });
});

app.listen(5050, () => {
  console.log("🚀 Running on http://localhost:5050");
});