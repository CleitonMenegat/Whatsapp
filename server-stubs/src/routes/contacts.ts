import { Router } from 'express';

const router = Router();
const CONTACTS: any[] = [];

router.get('/', (req, res) => {
  res.json(CONTACTS);
});

router.post('/', (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'name and phone are required' });
  const c = { id: Math.random().toString(36).substring(2,9), name, phone, createdAt: new Date().toISOString() };
  CONTACTS.push(c);
  res.status(201).json(c);
});

export default router;
