import express from 'express';
import homeRoute from './home';
import userRoutes from './auth.routes';

const router = express.Router();

router.use('/home', homeRoute);

router.use('/auth', userRoutes);

export default router;
