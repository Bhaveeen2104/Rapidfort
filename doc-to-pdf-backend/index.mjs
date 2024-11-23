import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import docxToPdf from "docx-pdf";
import { encrypt } from "node-qpdf2";
// const { PDFDocument } = require("pdf-lib");
import cors from 'cors';
const app = express();
app.use(cors());
const PORT = 5000;
const __dirname = path.dirname(new URL(import.meta.url).pathname);
// Middleware for file uploads
const upload = multer({ dest: "uploads/" });

// Helper function to convert .docx to .pdf
const convertDocxToPdf = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    docxToPdf(inputPath, outputPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Helper function to add password protection to a PDF
const addPasswordToPdf = async (inputPdfPath, outputPdfPath, password) => {
  try {
    // Read the existing PDF
    const pdf = {
      input:inputPdfPath,
      output: outputPdfPath,
      password: password,
    }
    await encrypt(pdf);

    console.log("Password protection applied successfully.");
  } catch (error) {
    console.error("Error adding password to PDF:", error);
    throw error;
  }
};

// POST endpoint to upload and convert the file
app.post("/upload", upload.single("file"), async (req, res) => {
  const inputPath = req.file.path;
  const tempPdfPath = `converted/temp_${req.file.originalname.split(".")[0]}.pdf`;
  const finalPdfPath = `converted/${req.file.originalname.split(".")[0]}.pdf`;
  const { password } = req.body; // Password sent in request body

  try {
    // Step 1: Convert DOCX to PDF
    await convertDocxToPdf(inputPath, tempPdfPath);

    // Step 2: If password is provided, apply password protection
    if (password) {
      await addPasswordToPdf(tempPdfPath, finalPdfPath, password);
      fs.unlinkSync(tempPdfPath); // Remove temporary unprotected file
    } else {
      // No password, just rename temp file to final output
      fs.renameSync(tempPdfPath, finalPdfPath);
    }

    // Step 3: Respond with the URL of the final PDF
    res.status(200).json({ pdfUrl: `http://localhost:${PORT}/${finalPdfPath}` });
  } catch (error) {
    console.error("Error during file processing:", error);
    res.status(500).send("Failed to process the file.");
  } finally {
    fs.unlinkSync(inputPath); // Clean up uploaded DOCX file
  }
});

// Serve converted PDFs from the 'converted' directory
app.use("/converted", express.static(path.join(__dirname, "converted")));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
