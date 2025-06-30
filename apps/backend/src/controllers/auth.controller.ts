// src/controllers/AuthController.ts

import { Request, Response } from 'express';
import { UserModel, IUser } from '@db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { IAuthController } from './types';
import passport from 'passport';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const {
  JWT_SECRET,
  NODEMAILER_EMAIL,
  NODEMAILER_PASS,
  OAUTH_SUCCESS_REDIRECT,
  OAUTH_FAILURE_REDIRECT,
  RESET_PASSWORD_BASE_URL,
} = process.env;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export class AuthController implements IAuthController {
  private createToken(_id: string, email: string): string {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ _id, email, sub: _id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  private createRefreshToken(_id: string, email: string): string {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ _id, email, sub: _id, type: 'refresh' }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  private async setRefreshToken(user: IUser, res: Response) {
    const refreshToken = this.createRefreshToken(user._id, user.email);
    // Store in DB
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();
    // Set as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return refreshToken;
  }

  loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      let { email, password } = req.body;
      if (email) email = email.trim();
      if (password) password = password.trim();

      if (!email || !password) {
        return res.status(400).json({ error: 'All fields must be filled' });
      }

      const user: IUser | null = await UserModel.findOne({ email });
      const match = user
        ? await bcrypt.compare(password, user.password!)
        : false;

      if (!user || !match) {
        // FIX (Point 2): generic error to avoid user enumeration
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = this.createToken(user._id, user.email);
      await this.setRefreshToken(user, res);
      return res.status(200).json({ email, token });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  signupUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { first_name, last_name } = req.body;
      let { email, password } = req.body;
      if (email) email = email.trim();
      if (password) password = password.trim();

      if (!first_name || !email || !password) {
        return res.status(400).json({ error: 'All fields must be filled' });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Email is not valid' });
      }

      if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ error: 'Password is not strong enough' });
      }

      const exists: IUser | null = await UserModel.findOne({ email });
      if (exists) {
        // FIX (Point 2): generic response instead of revealing duplication
        return res
          .status(400)
          .json({ error: 'Unable to register with provided credentials' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const user: IUser = await UserModel.create({
        first_name,
        last_name,
        email,
        password: hash,
      });

      const token = this.createToken(user._id, user.email);
      await this.setRefreshToken(user, res);
      return res.status(201).json({ email, token }); // 201 on resource creation
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email'],
  });

  githubLogin = passport.authenticate('github', {
    scope: ['user:email'], // FIX (Point 7): correct GitHub scope
  });

  googleCallback = (req: Request, res: Response, next: any) => {
    passport.authenticate('google', async (err: any, user: IUser) => {
      if (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=oauth_error`);
      }

      if (!user) {
        console.error('No user returned from Google OAuth');
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=no_user`);
      }

      try {
        const token = this.createToken(user._id, user.email);
        await this.setRefreshToken(user, res);
        res.redirect(`${OAUTH_SUCCESS_REDIRECT}#token=${token}`);
      } catch (tokenError) {
        console.error('Token creation error:', tokenError);
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=token_error`);
      }
    })(req, res, next);
  };

  githubCallback = (req: Request, res: Response, next: any) => {
    passport.authenticate('github', async (err: any, user: IUser) => {
      if (err) {
        console.error('GitHub OAuth error:', err);
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=oauth_error`);
      }

      if (!user) {
        console.error('No user returned from GitHub OAuth');
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=no_user`);
      }

      try {
        const token = this.createToken(user._id, user.email);
        await this.setRefreshToken(user, res);
        res.redirect(`${OAUTH_SUCCESS_REDIRECT}#token=${token}`);
      } catch (tokenError) {
        console.error('Token creation error:', tokenError);
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=token_error`);
      }
    })(req, res, next);
  };

  public forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { email } = req.body;
      const user: IUser | null = await UserModel.findOne({ email });

      if (!user) {
        // FIX (Point 2): always return success to avoid enumeration
        return res.status(200).json({
          status:
            'If that email is registered you will receive reset instructions',
        });
      }

      const token = this.createToken(user._id, user.email);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: NODEMAILER_EMAIL,
          pass: NODEMAILER_PASS,
        },
      });

      const mailOptions = {
        // FIX (Point 1): set a valid From address
        from: `"Your App Name" <${NODEMAILER_EMAIL}>`,
        to: user.email,
        subject: 'Reset your Password',
        text: `${RESET_PASSWORD_BASE_URL}/${user._id}/${token}`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ status: 'Success', message: 'Email sent' });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      return res
        .status(500)
        .json({ status: 'Error', message: 'Something went wrong' });
    }
  };

  public resetPassword = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id, token } = req.params;
      const { password } = req.body;

      // FIX (Point 4): verify token and bind to user ID
      const decoded = jwt.verify(token, JWT_SECRET!);
      if (typeof decoded === 'object' && decoded.sub !== id) {
        return res
          .status(400)
          .json({ status: 'Failed', message: 'Invalid token or server error' });
      }

      // FIX (Point 3): enforce strong password on reset
      if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ error: 'Password is not strong enough' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await UserModel.findByIdAndUpdate(id, { password: hash });

      return res.status(200).json({ status: 'Success' });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return res
        .status(400)
        .json({ status: 'Failed', message: 'Invalid token or server error' });
    }
  };

  public async getUsers(req: Request, res: Response): Promise<Response> {
    // FIX (Point 5): exclude password hashes
    const users = await UserModel.find({}, '-password');
    return res.status(200).json(users);
  }

  public async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const deletedUser = await UserModel.findOneAndDelete({ email });

      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
      }
      // Verify refresh token
      let payload: any;
      try {
        payload = jwt.verify(refreshToken, JWT_SECRET!);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      // Find user and check if token is in DB
      const user = await UserModel.findById(payload.sub);
      if (!user || !user.refreshTokens?.includes(refreshToken)) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      // Issue new access token
      const token = this.createToken(user._id, user.email);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        // Remove from DB
        await UserModel.updateOne(
          { refreshTokens: refreshToken },
          { $pull: { refreshTokens: refreshToken } }
        );
      }
      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Logged out' });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  };
}
