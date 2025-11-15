import express from "express";
import KSUID from "ksuid";
import cors from "cors"; // Import the cors package

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// API endpoint for generating KSUID
app.get("/api/ksuid", async (req, res) => {
    try {
        const id = await KSUID.random();
        res.json({ ksuid: id.string });
    } catch (error) {
        console.error("Error generating KSUID:", error);
        res.status(500).json({ error: "Failed to generate ID" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`API Server running at http://localhost:${PORT}`);
});