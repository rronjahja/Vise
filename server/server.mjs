import express, { json } from 'express';
import axios from 'axios';
import cors from 'cors'; // Import CORS module

const app = express();
const port = 3000;

app.use(cors()); // This will allow all domains. For production, configure it to allow specific domains.
app.use(json()); // Middleware to parse JSON bodies

// Serve static files from 'public' directory
app.use(express.static('public'));


const basicAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Missing Authorization header' });
    }

    // Allow the request to proceed
    next();
};

// Apply the middleware to the specific route
app.post('/fetch-url', basicAuthMiddleware, async (req, res) => {
    const { url } = req.body;
    const authHeader = req.headers['authorization'];

    try {
        // Configure headers for the request to the external URL
        const headers = authHeader ? { Authorization: authHeader } : {};

        // Make the request to the external URL
        const response = await axios.get(url, { headers });

        // Send the response data back to the client
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching URL', error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
