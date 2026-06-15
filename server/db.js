import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const defaultData = {
  endpoints: [],
  logs: []
};

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
}

class JSONDatabase {
  constructor() {
    this.filePath = DB_FILE;
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database file, resetting to default:', error);
      this.write(defaultData);
      return defaultData;
    }
  }

  write(data) {
    try {
      // Atomic write using a temporary file
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (error) {
      console.error('Error writing to database file:', error);
    }
  }

  // --- Endpoints ---
  getEndpoints() {
    return this.read().endpoints || [];
  }

  getEndpoint(id) {
    const endpoints = this.getEndpoints();
    return endpoints.find(e => e.id === id);
  }

  createEndpoint(endpoint) {
    const data = this.read();
    const newEndpoint = {
      id: endpoint.id,
      name: endpoint.name || 'Unnamed Endpoint',
      targetUrl: endpoint.targetUrl || '',
      apiKey: endpoint.apiKey || '',
      createdAt: new Date().toISOString()
    };
    data.endpoints.push(newEndpoint);
    this.write(data);
    return newEndpoint;
  }

  updateEndpoint(id, updates) {
    const data = this.read();
    const index = data.endpoints.findIndex(e => e.id === id);
    if (index !== -1) {
      data.endpoints[index] = {
        ...data.endpoints[index],
        ...updates
      };
      this.write(data);
      return data.endpoints[index];
    }
    return null;
  }

  deleteEndpoint(id) {
    const data = this.read();
    const filteredEndpoints = data.endpoints.filter(e => e.id !== id);
    const deletedCount = data.endpoints.length - filteredEndpoints.length;
    data.endpoints = filteredEndpoints;
    // Also clean up logs for this endpoint
    data.logs = data.logs.filter(l => l.endpointId !== id);
    this.write(data);
    return deletedCount > 0;
  }

  // --- Logs ---
  getLogs(endpointId = null) {
    const logs = this.read().logs || [];
    if (endpointId) {
      return logs.filter(l => l.endpointId === endpointId);
    }
    return logs;
  }

  addLog(log) {
    const data = this.read();
    const newLog = {
      id: log.id || Math.random().toString(36).substring(2, 15),
      endpointId: log.endpointId,
      method: log.method || 'POST',
      headers: log.headers || {},
      body: log.body || null,
      receivedAt: log.receivedAt || new Date().toISOString(),
      forwardedTo: log.forwardedTo || '',
      forwardStatus: log.forwardStatus || null,
      forwardResponse: log.forwardResponse || '',
      forwardError: log.forwardError || '',
      latencyMs: log.latencyMs || 0
    };
    data.logs.unshift(newLog); // Add new logs to the beginning

    // Keep logs size under control (e.g., maximum 1000 logs)
    if (data.logs.length > 1000) {
      data.logs = data.logs.slice(0, 1000);
    }

    this.write(data);
    return newLog;
  }

  clearLogs(endpointId = null) {
    const data = this.read();
    if (endpointId) {
      data.logs = data.logs.filter(l => l.endpointId !== endpointId);
    } else {
      data.logs = [];
    }
    this.write(data);
  }
}

export const db = new JSONDatabase();
