import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Utility to clean headers before forwarding
const cleanHeaders = (originalHeaders) => {
  const headers = { ...originalHeaders };
  const excludeHeaders = [
    'host',
    'connection',
    'content-length',
    'content-type',
    'accept-encoding',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-port',
    'x-forwarded-host',
    'cf-ray',
    'cf-connecting-ip',
    'cf-visitor',
    'cf-ipcountry',
    'cdn-loop'
  ];
  
  excludeHeaders.forEach(header => {
    delete headers[header.toLowerCase()];
    delete headers[header];
  });
  
  return headers;
};

// --- Webhook Proxy Endpoint ---
// Accepts GET, POST, PUT, DELETE, etc.
app.all('/webhook/:endpointId', async (req, res) => {
  const { endpointId } = req.params;
  const endpoint = db.getEndpoint(endpointId);

  if (!endpoint) {
    return res.status(404).json({ error: `Webhook endpoint '${endpointId}' not found.` });
  }

  // API Key Verification
  // Check: Header 'x-api-key', Header 'Authorization: Bearer <key>', or Query parameter 'apikey'
  const providedKey = req.headers['x-api-key'] || 
                       (req.headers['authorization'] && req.headers['authorization'].startsWith('Bearer ') 
                         ? req.headers['authorization'].substring(7) 
                         : null) || 
                       req.query.apikey || 
                       req.query.apiKey;

  if (endpoint.apiKey && providedKey !== endpoint.apiKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key.' });
  }

  const startTime = Date.now();
  const logId = uuidv4();
  
  let forwardStatus = null;
  let forwardResponse = '';
  let forwardError = '';
  let latencyMs = 0;

  // Attempt to forward request if target URL is set
  if (endpoint.targetUrl) {
    try {
      const headers = cleanHeaders(req.headers);
      
      // Inject target headers if needed
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
      }

      const response = await axios({
        method: req.method,
        url: endpoint.targetUrl,
        headers: headers,
        data: req.method !== 'GET' ? req.body : undefined,
        params: req.query,
        timeout: 15000, // 15s timeout
        validateStatus: () => true // Resolve promise for all status codes
      });

      latencyMs = Date.now() - startTime;
      forwardStatus = response.status;
      
      // Handle response data
      if (typeof response.data === 'object') {
        forwardResponse = JSON.stringify(response.data);
      } else {
        forwardResponse = String(response.data);
      }
    } catch (error) {
      latencyMs = Date.now() - startTime;
      forwardStatus = 502; // Bad Gateway
      forwardError = error.message;
      forwardResponse = 'Error forwarding payload.';
      console.error(`Forwarding error to target ${endpoint.targetUrl}:`, error.message);
    }
  } else {
    // No target configured, just receive it
    forwardStatus = 200;
    forwardResponse = 'Webhook received successfully (No target configured).';
  }

  // Create log entry
  const logEntry = {
    id: logId,
    endpointId,
    method: req.method,
    headers: req.headers,
    body: req.body,
    receivedAt: new Date().toISOString(),
    forwardedTo: endpoint.targetUrl,
    forwardStatus,
    forwardResponse,
    forwardError,
    latencyMs
  };

  db.addLog(logEntry);

  // Send response back to the caller
  if (endpoint.targetUrl && forwardStatus) {
    res.status(forwardStatus).send(forwardResponse);
  } else {
    res.status(200).json({ status: 'success', message: 'Webhook received.' });
  }
});

// --- Administration API Endpoints ---

// Get all endpoints
app.get('/api/endpoints', (req, res) => {
  try {
    const endpoints = db.getEndpoints();
    res.json(endpoints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new endpoint
app.post('/api/endpoints', (req, res) => {
  const { id, name, targetUrl, apiKey } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Endpoint ID is required.' });
  }

  // Sanitize ID: only alphanumeric, dashes, underscores
  const sanitizedId = id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  if (db.getEndpoint(sanitizedId)) {
    return res.status(400).json({ error: `Endpoint with ID '${sanitizedId}' already exists.` });
  }

  try {
    const endpoint = db.createEndpoint({
      id: sanitizedId,
      name: name || sanitizedId,
      targetUrl: targetUrl || '',
      apiKey: apiKey || uuidv4().substring(0, 18) // Generate short key if not provided
    });
    res.status(201).json(endpoint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update endpoint
app.put('/api/endpoints/:id', (req, res) => {
  const { id } = req.params;
  const { name, targetUrl, apiKey } = req.body;

  if (!db.getEndpoint(id)) {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }

  try {
    const updated = db.updateEndpoint(id, { name, targetUrl, apiKey });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete endpoint
app.delete('/api/endpoints/:id', (req, res) => {
  const { id } = req.params;

  try {
    const success = db.deleteEndpoint(id);
    if (success) {
      res.json({ message: 'Endpoint deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Endpoint not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logs
app.get('/api/logs', (req, res) => {
  const { endpointId } = req.query;
  try {
    const logs = db.getLogs(endpointId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear logs
app.delete('/api/logs', (req, res) => {
  const { endpointId } = req.query;
  try {
    db.clearLogs(endpointId);
    res.json({ message: 'Logs cleared successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    const endpoints = db.getEndpoints();
    const logs = db.getLogs();

    const stats = {
      totalEndpoints: endpoints.length,
      totalRequests: logs.length,
      successCount: 0,
      errorCount: 0,
      avgLatencyMs: 0,
      methodBreakdown: {},
      statusBreakdown: {},
      recentTraffic: [] // For charts
    };

    if (logs.length > 0) {
      let totalLatency = 0;
      
      logs.forEach(log => {
        // Latency
        totalLatency += log.latencyMs || 0;
        
        // Status counts
        const status = log.forwardStatus;
        if (status) {
          stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
          if (status >= 200 && status < 300) {
            stats.successCount++;
          } else {
            stats.errorCount++;
          }
        } else {
          stats.statusBreakdown['no-target'] = (stats.statusBreakdown['no-target'] || 0) + 1;
          stats.successCount++;
        }

        // Method breakdown
        stats.methodBreakdown[log.method] = (stats.methodBreakdown[log.method] || 0) + 1;
      });

      stats.avgLatencyMs = Math.round(totalLatency / logs.length);
    }

    // Group traffic by date (last 7 days or similar) for chart data
    const trafficByDay = {};
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
      trafficByDay[dateStr] = { date: dateStr, requests: 0, success: 0, error: 0 };
    }

    logs.forEach(log => {
      const dateStr = new Date(log.receivedAt).toLocaleDateString();
      if (trafficByDay[dateStr]) {
        trafficByDay[dateStr].requests++;
        const status = log.forwardStatus;
        if (!status || (status >= 200 && status < 300)) {
          trafficByDay[dateStr].success++;
        } else {
          trafficByDay[dateStr].error++;
        }
      }
    });

    stats.recentTraffic = Object.values(trafficByDay);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Webhook router backend listening on http://localhost:${PORT}`);
});
