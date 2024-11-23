import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Card, TextField, Typography, CircularProgress, Snackbar } from "@mui/material";
import { Alert } from "@mui/lab";

function App() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file) {
      setSnackbar({ open: true, message: "Please upload a file first.", severity: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (password) formData.append("password", password);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPdfUrl(response.data.pdfUrl);
      setSnackbar({ open: true, message: "File converted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error during conversion:", error);
      setSnackbar({ open: true, message: "Failed to convert the file.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Word to PDF Converter with Password Protection
      </Typography>

      <Card
        sx={{
          p: 3,
          mx: "auto",
          my: 4,
          width: { xs: "100%", sm: "75%", md: "50%" },
          boxShadow: 4,
        }}
      >
        <input
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          style={{ display: "block", margin: "10px auto" }}
        />
        <TextField
          label="Password (Optional)"
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={handleConvert}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Convert to PDF"}
        </Button>

        {pdfUrl && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              color="success"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </Button>
          </Box>
        )}
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
