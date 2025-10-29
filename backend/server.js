// backend/server.js (TEST CODE - TEMPORARY)
const express = require('express');
const app = express();

// A simple test route
app.post('/api/auth/register', (req, res) => {
    res.status(200).json({ message: "TEST SUCCESS: Backend function is running!" });
});

module.exports = app;