import { Router } from 'express';

const router = Router();

// POST /api/v1/messages/send
router.post('/send', (req, res) => {
  const { instanceId, to, message } = req.body;
  if (!instanceId || !to || !message) return res.status(400).json({ error: 'instanceId, to and message are required' });

  // Simulate sending (stub)
  const result = {
    id: Math.random().toString(36).substring(2, 9),
    instanceId,
    to,
    message,
    status: 'queued',
    createdAt: new Date().toISOString()
  };

  res.json({ success: true, message: 'enqueued', data: result });
});

export default router;
