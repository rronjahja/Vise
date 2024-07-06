import express, { json } from 'express';
import axios from 'axios';
import cors from 'cors'; // Import CORS module

const app = express();
const port = 3000;

app.use(cors()); // This will allow all domains. For production, configure it to allow specific domains.
app.use(json()); // Middleware to parse JSON bodies

// Serve static files from 'public' directory
app.use(express.static('public'));

// Route to handle the URL request
app.post('/fetch-url', async (req, res) => {
    const { url } = req.body;
    try {
        const response = await axios.get(url); // Use axios.get here
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching URL', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
