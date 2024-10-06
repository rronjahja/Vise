const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors({ origin: '*' })); 
app.use(express.json({ limit: '50mb' })); // Middleware to parse large JSON bodies

// Serve static files from 'public' directory
app.use(express.static('public'));

const basicAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Missing Authorization header' });
    }
    next();
};

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Apply the middleware to the specific route
app.post('/fetch-url', basicAuthMiddleware, async (req, res) => {
    const { url } = req.body;
    const authHeader = req.headers['authorization'];
    const headers = authHeader ? { Authorization: authHeader } : {};

    try {
        let allData = [];
        let batchSize = 5000;
        let totalRecords = 50000;
        let skip = 0;

        while (skip < totalRecords) {
            const requestUrl = `${url}?$select=EWMStockQuantityBaseUnit,AvailableEWMStockQty,Product&$top=${batchSize}&$skip=${skip}`;

            // Fetch a batch of records
            const response = await axios.get(requestUrl, { headers });

            // Append the fetched data to the total result
            allData = [...allData, ...response.data.value];

            // Update skip to get the next batch
            skip += batchSize;

            if (response.data.value.length < batchSize) {
                break;
            }

          }

        // Send the combined data back to the client
        res.json(allData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching URL', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
