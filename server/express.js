import express, { json } from 'express';
import { get } from 'axios';
const app = express();
const port = 3000;

app.use(json()); // Middleware to parse JSON bodies

app.use('public');
// Route to handle the URL request
app.post('/fetch-url', async (req, res) => {
    const { url } = req.body; // The 'url' now contains the full URL (including the endpoint)
    try {
        const response = await get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching URL', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
