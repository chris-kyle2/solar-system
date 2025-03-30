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
const MONGO_URI = process.env.NODE_ENV === "development"
    ? "mongodb://appuser:apppassword@mongo:27017/solar-system-db?authSource=solar-system-db"
    : process.env.MONGO_URI; // Use Kubernetes secret
if (!MONGO_URI) {
        console.error("❌ MONGO_URI is not set. Exiting...");
        process.exit(1);
    }


async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`✅ Connected to MongoDB: ${MONGO_URI.includes("mongo:27017") ? "Local MongoDB" : "MongoDB Atlas"}`);
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1);
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

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/os', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

app.get('/live', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
});

app.get('/ready', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
});

app.listen(3000, () => {
    console.log("Server successfully running on port - 3000");
});

module.exports = app;
