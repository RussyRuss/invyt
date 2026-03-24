require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;

// MONGO CONNECT
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
}

connectDB();

// EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendNotification(name, guest) {
  const guestLine = guest ? ` + ${guest}` : "";
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "russelsouffrant12@gmail.com, kaylimcgurn@gmail.com",
    subject: "New RSVP!",
    text: `${name}${guestLine} just RSVP'd to the baby shower!`,
  });
}

// MODEL
const RSVP = mongoose.model("RSVP", {
  name: String,
  guest: String,
});

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Server is working");
});

// POST RSVP
app.post("/rsvp", async (req, res) => {
  try {
    const { name, guest } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }

    const exists = await RSVP.findOne({ name });
    if (exists) {
      return res.status(400).json({ error: "Already RSVPed" });
    }

    await RSVP.create({ name, guest });

    const total = await RSVP.countDocuments();

    // send email notification (don't await — don't block the response)
    sendNotification(name, guest).catch((err) =>
      console.error("Email error:", err.message)
    );

    res.json({ message: "Saved", total });
  } catch (err) {
    console.error("RSVP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET ALL RSVPs
app.get("/rsvp", async (req, res) => {
  try {
    const guests = await RSVP.find();
    res.json({ total: guests.length, guests });
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
