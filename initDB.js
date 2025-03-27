const mongoose = require('mongoose');

const planetData = [
    {
        name: "Sun",
        id: 0,
        description: "The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma.",
        image: "/images/sun.png",
        velocity: "0 km/s",
        distance: "0 km"
    },
    {
        name: "Mercury",
        id: 1,
        description: "Mercury is the smallest and innermost planet in the Solar System.",
        image: "/images/mercury.png",
        velocity: "47.87 km/s",
        distance: "57.9 million km"
    },
    {
        name: "Venus",
        id: 2,
        description: "Venus is the second planet from the Sun and the hottest planet in our solar system.",
        image: "/images/venus.png",
        velocity: "35.02 km/s",
        distance: "108.2 million km"
    },
    {
        name: "Earth",
        id: 3,
        description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life.",
        image: "/images/earth.png",
        velocity: "29.78 km/s",
        distance: "149.6 million km"
    },
    {
        name: "Mars",
        id: 4,
        description: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System.",
        image: "/images/mars.png",
        velocity: "24.077 km/s",
        distance: "227.9 million km"
    },
    {
        name: "Jupiter",
        id: 5,
        description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System.",
        image: "/images/jupiter.png",
        velocity: "13.07 km/s",
        distance: "778.5 million km"
    },
    {
        name: "Saturn",
        id: 6,
        description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System.",
        image: "/images/saturn.png",
        velocity: "9.68 km/s",
        distance: "1.434 billion km"
    },
    {
        name: "Uranus",
        id: 7,
        description: "Uranus is the seventh planet from the Sun and the third-largest in the Solar System.",
        image: "/images/uranus.png",
        velocity: "6.80 km/s",
        distance: "2.871 billion km"
    },
    {
        name: "Neptune",
        id: 8,
        description: "Neptune is the eighth and farthest-known planet from the Sun in the Solar System.",
        image: "/images/neptune.png",
        velocity: "5.43 km/s",
        distance: "4.495 billion km"
    }
];
console.log("MONGO_URI from env:", process.env.MONGO_URI);

async function initDb() {
    try {
        await mongoose.connect('mongodb://mongo:27017/testdb');
        console.log('Connected to MongoDB');

        // Define the schema
        const planetSchema = new mongoose.Schema({
            name: String,
            id: Number,
            description: String,
            image: String,
            velocity: String,
            distance: String
        });

        // Create model
        const Planet = mongoose.model('planets', planetSchema);

        // Clear existing data
        await Planet.deleteMany({});
        console.log('Cleared existing data');

        // Insert new data
        await Planet.insertMany(planetData);
        console.log('Sample data inserted successfully');

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

initDb();