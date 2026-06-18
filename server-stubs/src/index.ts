import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import instancesRoutes from './routes/instances';
import messagesRoutes from './routes/messages';
import campaignsRoutes from './routes/campaigns';
import contactsRoutes from './routes/contacts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'revitalize-backend-stubs' }));

app.use('/api/auth', authRoutes);
app.use('/api/v1/instances', instancesRoutes);
app.use('/api/v1/messages', messagesRoutes);
app.use('/api/v1/campaigns', campaignsRoutes);
app.use('/api/v1/contacts', contactsRoutes);

app.listen(PORT, () => {
  console.log(`Revitalize backend stubs listening on http://localhost:${PORT}`);
});
