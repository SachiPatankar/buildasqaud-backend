import express from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { requireAuth } from '../../middleware/auth';

const router = express.Router();

const authController = new AuthController();

router.post('/login', authController.loginUser);
router.post('/signup', authController.signupUser);

// Google OAuth
router.get('/google', authController.googleLogin);
router.get('/google/callback', (req, res, next) =>
  authController.googleCallback(req, res, next)
);

// Github OAuth
router.get('/github', authController.githubLogin);
router.get('/github/callback', (req, res, next) =>
  authController.githubCallback(req, res, next)
);

//forgot-password
router.post('/forgot-password', authController.forgotPassword);
//reset-password
router.post('/reset-password/:id/:token', authController.resetPassword);

router.post('/logout', authController.logout);

router.get('/me', requireAuth, authController.me);

router.post('/refresh-token', authController.getAccessTokenViaRefreshToken);

export default router;
