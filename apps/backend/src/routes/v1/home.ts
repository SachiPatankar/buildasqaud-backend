import express from 'express';
const router = express.Router();
import HomeController from '../../controllers/home.controller';

const homeController = new HomeController();

router.get('/home', homeController.getHome);

export default router;
