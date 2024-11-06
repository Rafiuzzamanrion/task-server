require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

mongoose
  .connect(`${MONGODB_URI}/${MONGODB_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Mongoose schema and model
const FileSchema = new mongoose.Schema({
  originalName: String,
  extension: String,
  size: Number,
});
const File = mongoose.model("File", FileSchema);

// Multer setup for file uploading
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload endpoint
app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    const filesData = req.files.map((file) => ({
      originalName: file.originalname,
      extension: file.originalname.split(".").pop(),
      size: file.size,
    }));

    // Save file data to MongoDB
    const savedFiles = await File.insertMany(filesData);

    res
      .status(200)
      .json({ message: "Files uploaded successfully", savedFiles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed" });
  }
});

// API endpoint to count total attachments
app.get("/api/attachments/count", async (req, res) => {
  try {
    const count = await File.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve count" });
  }
});
app.get("/api/attachments", async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching files" });
  }
});

app.get("/", (req, res) => {
  res.send("task server is running");
});
// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
