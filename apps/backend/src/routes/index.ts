import express from 'express';
import v1 from './v1/index';
import healthRoutes from './health.routes';
import monitoringRoutes from './monitoring.routes';

const router = express.Router();

router.get('/', (req, res) => res.send(`<pre>Backend API 🔥🚀</pre>`));
router.use('/v1', v1);

// Health check routes
router.use('/', healthRoutes);

// Monitoring routes
router.use('/monitoring', monitoringRoutes);

export default router;
