import express from "express";
import KSUID from "ksuid";
import cors from "cors"; // Import the cors package
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static frontend in production
if (process.env.NODE_ENV === "production") {
    const clientDistPath = path.join(__dirname, "../client/dist");
    app.use(express.static(clientDistPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`API Server running at http://localhost:${PORT}`);
});