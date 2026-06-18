import { Router } from 'express';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Stub: aceita qualquer usuário
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  // Retornar token de exemplo
  return res.json({ token: 'stub-jwt-token', user: { email } });
});

export default router;
