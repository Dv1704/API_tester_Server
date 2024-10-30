// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// Middleware to measure response time
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`Request to ${req.originalUrl} took ${duration}ms`);
  });
  next();
});

app.post('/make-request', async (req, res) => {
  try {
    const { baseUrl, queryParams, method, headers, body } = req.body;

    // Construct URL with query parameters
    const parsedUrl = new URL(baseUrl);
    Object.entries(queryParams || {}).forEach(([key, value]) => {
      if (value) parsedUrl.searchParams.append(key, value);
    });

    // Make the HTTP request
    const response = await axios({
      method: method || 'GET',
      url: parsedUrl.toString(),
      headers: headers || {},
      data: body,
    });

    // Measure response time
    const responseTime = Date.now() - req.startTime;

    res.json({
      status: response.status,
      headers: response.headers,
      data: response.data,
      responseTime: `${responseTime}ms`,
      requestUrl: parsedUrl.toString(),
    });
  } catch (error) {
    const statusCode = error.response ? error.response.status : 500;
    res.status(statusCode).json({
      error: error.message,
      responseTime: `${Date.now() - req.startTime}ms`,
      response: error.response
        ? {
            status: error.response.status,
            data: error.response.data,
          }
        : null,
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
