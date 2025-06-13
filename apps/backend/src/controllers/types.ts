import express from 'express';
import { IUser } from '@db';
import { Request, Response, RequestHandler } from 'express';

declare module 'express' {
  interface Request {
    user?: IUser;
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
  loginUser: (
    req: Request,
    res: Response
  ) => Promise<Response>;

  signupUser: (
    req: Request,
    res: Response
  ) => Promise<Response>;

  googleLogin: RequestHandler;
  googleCallback: RequestHandler;

  githubLogin: RequestHandler;
  githubCallback: RequestHandler;

  forgotPassword: (
    req: Request,
    res: Response
  ) => Promise<Response>;

  resetPassword: (
    req: Request,
    res: Response
  ) => Promise<Response>;

  getUsers: (
    req: Request,
    res: Response
  ) => Promise<Response>;

  deleteUser: (
    req: Request,
    res: Response
  ) => Promise<Response>;
}

