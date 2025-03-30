const fs = require('fs');
const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

// Function to check if running in Kubernetes
function isKubernetes() {
    return fs.existsSync('/mnt/env_vars/MONGO_URI');
}

// Read MongoDB URI: Prefer file in Kubernetes, else use ENV
let MONGO_URI;
if (isKubernetes()) {
    console.log("🏗 Running inside Kubernetes - Reading MongoDB URI from secret file...");
    MONGO_URI = fs.readFileSync('/mnt/env_vars/MONGO_URI', 'utf8').trim();
} else {
    console.log("🛠 Running in Docker or Locally - Using environment variable...");
    MONGO_URI = process.env.MONGO_URI || "mongodb://appuser:apppassword@mongo:27017/solar-system-db?authSource=solar-system-db";
}

console.log(`🔍 Using MongoDB URI: ${MONGO_URI.startsWith('mongodb+srv') ? 'MongoDB Atlas (Production)' : 'Local MongoDB'}`);

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            user: process.env.MONGO_USERNAME,
            pass: process.env.MONGO_PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connection Successful");
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1); // Exit if connection fails
    }
}

// Call the database connection function
connectDB();

const Schema = mongoose.Schema;
const dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
const planetModel = mongoose.model('planets', dataSchema);

app.post('/planet', async function(req, res) {
    const planetId = req.body.id;
    console.log(`[${new Date().toISOString()}] Fetching planet with ID: ${planetId}`);
    
    try {
        const planetData = await planetModel.findOne({ id: planetId });
        if (!planetData) {
            console.log(`[${new Date().toISOString()}] Planet with ID ${planetId} not found`);
            return res.status(404).send({ error: "Planet not found" });
        }
        console.log(`[${new Date().toISOString()}] Successfully fetched planet: ${planetData.name}`);
        res.send(planetData);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Error fetching planet ${planetId}:`, err);
        res.status(500).send({ error: "Server error" });
    }
});

app.get('/live', (req, res) => res.json({ status: "live" }));
app.get('/ready', (req, res) => res.json({ status: "ready" }));
app.get('/os', (req, res) => {
    res.json({ os: process.platform });  // Returns OS details
});

app.get('/live', (req, res) => {
    res.json({ status: "live" });
});
app.get('/ready', (req, res) => {
    res.json({ status: "ready" });
});


app.listen(3000, () => {
    console.log("🚀 Server successfully running on port - 3000");
});

module.exports = app;
