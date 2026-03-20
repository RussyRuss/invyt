require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ PORT (Railway-safe)
const PORT = process.env.PORT || 5050;

// ✅ SAFE MONGO CONNECT
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

connectDB();

// ✅ MODEL
const RSVP = mongoose.model("RSVP", {
  name: String,
  guest: String,
});

// ✅ HEALTH CHECK ROUTE
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

// ✅ POST RSVP
app.post("/rsvp", async (req, res) => {
  try {
    const { name, guest } = req.body;

    console.log("Incoming:", req.body);

    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }

    // prevent duplicates
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
  } catch (err) {
    console.error("❌ RSVP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET ALL RSVPs
app.get("/rsvp", async (req, res) => {
  try {
    const guests = await RSVP.find();
    res.json({ total: guests.length, guests });
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ START SERVER (CRITICAL FIX)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});