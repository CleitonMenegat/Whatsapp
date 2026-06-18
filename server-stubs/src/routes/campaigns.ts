import { Router } from 'express';

const router = Router();
const CAMPAIGNS: any[] = [];

router.get('/', (req, res) => {
  res.json(CAMPAIGNS);
});

router.post('/', (req, res) => {
  const { name, schedule } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const c = { id: Math.random().toString(36).substring(2,9), name, schedule: schedule || null, status: 'draft', createdAt: new Date().toISOString() };
  CAMPAIGNS.push(c);
  res.status(201).json(c);
});

export default router;
