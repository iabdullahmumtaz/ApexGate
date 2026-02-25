import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectRedis } from './services/redis.js';
import { requestLog } from './middleware/requestLog.js';
import adminRoutes from './routes/admin.js';
import { gatewayHandler } from './gateway.js';

const app = express();
const PORT = process.env.PORT || 6016;

app.use(cors());
app.use(express.json());
app.use(requestLog);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ApexGate' }));

app.use('/admin', adminRoutes);

app.use(gatewayHandler);

app.use((_req, res) => {
  res.status(404).json({
    error: 'Route not configured',
    hint: 'Configure routes in the admin dashboard at /admin/routes',
  });
});

async function start() {
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`ApexGate API Gateway running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
