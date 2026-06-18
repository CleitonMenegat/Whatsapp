import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory store for stubs
const INSTANCES: any[] = [];

router.get('/', (req, res) => {
  res.json(INSTANCES);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const inst = { id: uuidv4(), name, status: 'disconnected', createdAt: new Date().toISOString() };
  INSTANCES.push(inst);
  res.status(201).json(inst);
});

router.get('/:id/qrcode', (req, res) => {
  const { id } = req.params;
  const inst = INSTANCES.find(i => i.id === id);
  if (!inst) return res.status(404).json({ error: 'instance not found' });
  // Return dummy base64 PNG string placeholder
  const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
  res.json({ qrcode: placeholder });
});

export default router;
