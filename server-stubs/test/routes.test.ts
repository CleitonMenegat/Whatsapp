import request from 'supertest';
import app from '../src/index';

describe('Server stubs API', () => {
  it('GET / should return status ok', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('POST /api/auth/login should return token for valid body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/v1/instances should create instance and GET list should include it', async () => {
    const create = await request(app)
      .post('/api/v1/instances')
      .send({ name: 'Teste' });
    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty('id');

    const list = await request(app).get('/api/v1/instances');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.find((i: any) => i.id === create.body.id)).toBeTruthy();
  });

  it('POST /api/v1/messages/send should enqueue message', async () => {
    const res = await request(app)
      .post('/api/v1/messages/send')
      .send({ instanceId: '1', to: '5511999999999', message: 'Olá' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
