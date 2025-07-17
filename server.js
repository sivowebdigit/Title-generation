const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { GoogleSheetsService } = require('./services/googleSheets');
const { TitleGeneratorService } = require('./services/titleGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Services
const googleSheetsService = new GoogleSheetsService();
const titleGeneratorService = new TitleGeneratorService();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get product data by SKU
app.get('/api/product/:sku', async (req, res) => {
    try {
        const { sku } = req.params;
        const productData = await googleSheetsService.getProductBySku(sku);
        
        if (!productData) {
            return res.status(404).json({ error: 'SKU not found' });
        }
        
        res.json(productData);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).json({ error: 'Failed to fetch product data' });
    }
});

// Generate titles for a SKU
app.post('/api/generate-titles', async (req, res) => {
    try {
        const { sku } = req.body;
        
        // Get product data
        const productData = await googleSheetsService.getProductBySku(sku);
        if (!productData) {
            return res.status(404).json({ error: 'SKU not found' });
        }
        
        // Generate titles
        const generatedTitles = await titleGeneratorService.generateTitles(productData);
        
        res.json(generatedTitles);
    } catch (error) {
        console.error('Error generating titles:', error);
        res.status(500).json({ error: 'Failed to generate titles' });
    }
});

// Add titles to sheet
app.post('/api/add-to-sheet', async (req, res) => {
    try {
        const { titles, imagewords } = req.body;
        
        const result = await googleSheetsService.addTitlesToSheet(titles, imagewords);
        
        res.json({ success: true, message: 'Titles added to SKU titles sheet successfully', result });
    } catch (error) {
        console.error('Error adding titles to sheet:', error);
        
        // Check if error is about existing titles
        if (error.message.includes('already has titles')) {
            res.status(409).json({ 
                error: error.message,
                code: 'TITLES_EXIST',
                suggestion: 'Use "Fetch Existing" to view current titles, "Refresh" to regenerate, or manually clear them first'
            });
        } else {
            res.status(500).json({ error: 'Failed to add titles to sheet' });
        }
    }
});

// Force update titles to sheet (overwrite existing)
app.post('/api/force-update-sheet', async (req, res) => {
    try {
        const { titles, imagewords } = req.body;
        
        const result = await googleSheetsService.forceUpdateTitlesToSheet(titles, imagewords);
        
        res.json({ success: true, message: 'Titles force updated to SKU titles sheet successfully', result });
    } catch (error) {
        console.error('Error force updating titles to sheet:', error);
        res.status(500).json({ error: 'Failed to force update titles to sheet' });
    }
});

// Regenerate titles to sheet (replace existing in B-L range)
app.post('/api/regenerate-titles', async (req, res) => {
    try {
        const { titles, imagewords } = req.body;
        
        const result = await googleSheetsService.regenerateTitlesToSheet(titles, imagewords);
        
        res.json({ success: true, message: 'Titles regenerated in SKU titles sheet successfully', result });
    } catch (error) {
        console.error('Error regenerating titles to sheet:', error);
        res.status(500).json({ error: 'Failed to regenerate titles to sheet' });
    }
});

// Fetch existing titles for a SKU from SKU titles sheet
app.get('/api/fetch-titles/:sku', async (req, res) => {
    try {
        const { sku } = req.params;
        
        const existingTitles = await googleSheetsService.fetchExistingTitles(sku);
        
        if (!existingTitles) {
            return res.status(404).json({ error: 'SKU not found or no titles exist in SKU titles sheet' });
        }
        
        res.json(existingTitles);
    } catch (error) {
        console.error('Error fetching existing titles:', error);
        res.status(500).json({ error: 'Failed to fetch existing titles from SKU titles sheet' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test Google Sheets connection
app.get('/api/test-connection', async (req, res) => {
    try {
        const result = await googleSheetsService.testConnection();
        res.json(result);
    } catch (error) {
        console.error('Connection test error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Export for Vercel
module.exports = app;
