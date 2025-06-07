import { Request, Response } from 'express';
import { IHomeController } from './types';

import { User } from '@db';

export default class HomeController implements IHomeController {
  getHome = async (req: Request, res: Response) => {
    try {
      const response = { message: 'Welcome to the Home Controller!' };
      await User.findOne();
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
}
