import express from 'express';
import { IUser } from '@db';
import { Request, Response, RequestHandler, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    user?: Partial<IUser>; // Optional user object
  }
}

export interface IHomeController {
  getHome: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => Promise<void>;
}

export interface IAuthController {
  loginUser: (req: Request, res: Response) => Promise<Response>;

  signupUser: (req: Request, res: Response) => Promise<Response>;

  googleLogin: RequestHandler;
  googleCallback: (req: Request, res: Response, next: NextFunction) => void;

  githubLogin: RequestHandler;
  githubCallback: (req: Request, res: Response, next: NextFunction) => void;

  forgotPassword: (req: Request, res: Response) => Promise<Response>;

  resetPassword: (req: Request, res: Response) => Promise<Response>;

  // getUsers: (req: Request, res: Response) => Promise<Response>;

  // deleteUser: (req: Request, res: Response) => Promise<Response>;

  logout: (req: Request, res: Response) => Promise<Response>;

  me: (req: Request, res: Response) => Promise<Response>;
}
