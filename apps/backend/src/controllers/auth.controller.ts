// src/controllers/AuthController.ts

import { Request, Response } from 'express';
import { UserModel, IUser } from '@db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import crypto from 'crypto';
import { IAuthController } from './types';
import passport from 'passport';
import nodemailer from 'nodemailer';


const {
  NODEMAILER_EMAIL,
  NODEMAILER_PASS,
  OAUTH_SUCCESS_REDIRECT,
  OAUTH_FAILURE_REDIRECT,
  RESET_PASSWORD_BASE_URL,
} = process.env;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export class AuthController implements IAuthController {
  
  private createAccessToken(_id: string, email: string): string {
    if (!ACCESS_TOKEN_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
    }
    return jwt.sign({ _id, email, sub: _id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
  }

  private createRefreshToken(_id: string): string {
    if (!REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
    }
    return jwt.sign({ _id, type: 'refresh' }, REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });
  }

  getAccessTokenViaRefreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
      }

      let payload;
      try {
        payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }

      const user = await UserModel.findById(payload._id);
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ error: 'Refresh token does not match' });
      }

      const accessToken = this.createAccessToken(user._id, user.email);

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 15, // 15 minutes
      });

      return res.status(200).json({ accessToken });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };

  loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      let { email, password } = req.body;
      if (email) email = email.trim();
      if (password) password = password.trim();

      if (!email || !password) {
        return res.status(400).json({ error: 'All fields must be filled' });
      }
      // Find user by email
      const user: IUser | null = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      // Check password
      const match = await bcrypt.compare(password, user.password!);
      if (!match) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      // Generate tokens
      const accessToken = this.createAccessToken(user._id, user.email);
      const refreshToken = this.createRefreshToken(user._id);

      // Save refreshToken to user document for session management
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      // Exclude sensitive fields from user object in response
      const safeUser = await UserModel.findById(user._id).select(
        "-password -refreshToken -googleId -githubId"
      );

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          user: safeUser,
          accessToken,
          refreshToken,
          message: "User logged in successfully"
        });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  signupUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { first_name, last_name } = req.body;
      let { email, password } = req.body;
      email = email?.trim();
      password = password?.trim();

      if (!first_name || !email || !password) {
        return res.status(400).json({ error: 'All fields must be filled' });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Email is not valid' });
      }

      // Optionally enforce strong passwords
      // if (!validator.isStrongPassword(password)) {
      //   return res.status(400).json({ error: 'Password is not strong enough' });
      // }

      const exists = await UserModel.findOne({ email });
      if (exists) {
        return res
          .status(400)
          .json({ error: 'Unable to register with provided credentials' });
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        first_name,
        last_name,
        email,
        password: hash,
      });

      const accessToken = this.createAccessToken(user._id, user.email);
      const refreshToken = this.createRefreshToken(user._id);

      // Save refreshToken to user document for session management
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      // Exclude sensitive fields from user object in response
      const safeUser = await UserModel.findById(user._id).select(
        "-password -refreshToken -googleId -githubId"
      );

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          user: safeUser,
          accessToken,
          refreshToken,
          message: "User logged in successfully"
        });
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
    passport.authenticate('google', { session: false }, async (err: any, user: IUser) => {
      if (err || !user) {
        console.error('Google OAuth error:', err || 'No user returned');
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=oauth_failed`);
      }
  
      try {
        const accessToken = this.createAccessToken(user._id, user.email);
        const refreshToken = this.createRefreshToken(user._id);
  
        // Save refreshToken to user document for session management
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        };

        res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        return res.redirect(OAUTH_SUCCESS_REDIRECT);
      } catch (tokenError) {
        console.error('Google token creation error:', tokenError);
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=token_error`);
      }
    })(req, res, next);
  };

  githubCallback = (req: Request, res: Response, next: any) => {
    passport.authenticate('github', { session: false }, async (err: any, user: IUser) => {
      if (err || !user) {
        console.error('GitHub OAuth error:', err || 'No user returned');
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=oauth_failed`);
      }
  
      try {
        const accessToken = this.createAccessToken(user._id, user.email);
        const refreshToken = this.createRefreshToken(user._id);
  
        // Save refreshToken to user document for session management
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        };

        res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        return res.redirect(OAUTH_SUCCESS_REDIRECT);
      } catch (tokenError) {
        console.error('Google token creation error:', tokenError);
        return res.redirect(`${OAUTH_FAILURE_REDIRECT}?error=token_error`);
      }
    })(req, res, next);
  };
  

  public forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;
  
      if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid email format' });
      }
  
      const user = await UserModel.findOne({ email });
  
      // Prevent email enumeration
      if (!user) {
        return res.status(200).json({
          status: 'Success',
          message: 'If that email is registered you will receive reset instructions',
        });
      }
  
      // Create a time-limited reset token
      const token = jwt.sign(
        { _id: user._id, sub: user._id },
        ACCESS_TOKEN_SECRET!,
        { expiresIn: '15m' }
      );
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: NODEMAILER_EMAIL,
          pass: NODEMAILER_PASS,
        },
      });
  
      const resetUrl = `${RESET_PASSWORD_BASE_URL}/${user._id}/${token}`;
  
      const mailOptions = {
        from: `"Your App Name" <${NODEMAILER_EMAIL}>`,
        to: user.email,
        subject: 'Reset your Password',
        text: `Click the link to reset your password: ${resetUrl}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      return res.status(200).json({
        status: 'Success',
        message: 'If that email is registered you will receive reset instructions',
      });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      return res.status(500).json({
        status: 'Error',
        message: 'Something went wrong. Please try again later.',
      });
    }
  };
  

  public resetPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id, token } = req.params;
      const { password } = req.body;
  
      if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ error: 'Password is not strong enough' });
      }
  
      let decoded: any;
      try {
        decoded = jwt.verify(token, ACCESS_TOKEN_SECRET!);
      } catch (err) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid or expired token' });
      }
  
      // Ensure token belongs to intended user
      if (typeof decoded !== 'object' || decoded.sub !== id) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid token or user mismatch' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      await UserModel.findByIdAndUpdate(id, { password: hashedPassword });
  
      return res.status(200).json({ status: 'Success', message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return res.status(500).json({ status: 'Failed', message: 'Server error' });
    }
  };
  
  // public async getUsers(req: Request, res: Response): Promise<Response> {
  //   // FIX (Point 5): exclude password hashes
  //   const users = await UserModel.find({}, '-password');
  //   return res.status(200).json(users);
  // }

  // public async deleteUser(req: Request, res: Response): Promise<Response> {
  //   try {
  //     const { email } = req.body;
  //     const deletedUser = await UserModel.findOneAndDelete({ email });

  //     if (!deletedUser) {
  //       return res.status(404).json({ message: 'User not found' });
  //     }

  //     return res.status(200).json({ message: 'User deleted successfully' });
  //   } catch (error) {
  //     return res.status(500).json({ message: 'Server error', error });
  //   }
  // }

  logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { refreshToken } = req.cookies;
  
      if (refreshToken) {
        await UserModel.updateOne(
          { refreshTokens: refreshToken },
          { $set: { refreshTokens: '' } }
        );
      }
     
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  };
  
  me = async (req: Request, res: Response): Promise<Response> => {
    try {
      // req.user is usually set by authentication middleware (e.g., passport or custom JWT middleware)
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const user = await UserModel.findById(userId).select('-password -refreshToken -googleId -githubId');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  };
}
