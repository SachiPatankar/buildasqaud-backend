import express from 'express';
import v1 from './v1/index';

const router = express.Router();

router.get('/', (req, res) => res.send(`<pre>Backend API 🔥🚀</pre>`));
router.use('/v1/', v1);
router.use('/health/', (req, res) => res.status(200).send('Okay!'));

export default router;
