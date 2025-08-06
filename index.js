
import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import predictRoute from './api/predict.js';
import verifyRoute from './api/verify.js';
import syncRoute from './api/sync.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Health check
app.get('/', (req, res) => {
    res.json({
        name: 'SkySniper AI Backend',
        version: '8.0.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
        endpoints: ['/predict', '/verify', '/sync']
    });
});

// API Routes
app.use('/predict', predictRoute);
app.use('/verify', verifyRoute);
app.use('/sync', syncRoute);

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'Endpoint not found'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SkySniper AI Backend running on port ${PORT}`);
    console.log(`📊 Status: http://0.0.0.0:${PORT}`);
    console.log(`🔮 Predict: http://0.0.0.0:${PORT}/predict`);
    console.log(`🔐 Verify: http://0.0.0.0:${PORT}/verify`);
    console.log(`🔄 Sync: http://0.0.0.0:${PORT}/sync`);
});
