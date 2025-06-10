import { Request, Response } from 'express';
import { UserModel, IUser } from '@db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { IAuthController } from './types';
import passport from 'passport';
const nodemailer = require('nodemailer');

const {
  JWT_SECRET,
  NODEMAILER_EMAIL,
  NODEMAILER_PASS,
  GOOGLE_SUCCESS_REDIRECT,
  GOOGLE_FAILURE_REDIRECT,
  GITHUB_SUCCESS_REDIRECT,
  GITHUB_FAILURE_REDIRECT,
  RESET_PASSWORD_BASE_URL,
} = process.env;

export class AuthController implements IAuthController {
  private createToken(_id: string, email: string): string {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ _id, email, sub: _id }, JWT_SECRET, {
      expiresIn: '1d',
    });
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

      if (!user) {
        return res.status(400).json({ error: 'Email not valid' });
      }

      const match = await bcrypt.compare(password, user.password!);
      if (!match) {
        return res.status(400).json({ error: 'Incorrect Password' });
      }

      const token = this.createToken(user._id, user.email);
      return res.status(200).json({ email, token });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      if (!first_name || !last_name || !email || !password) {
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
        return res.status(400).json({ error: 'Email already in database' });
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
      return res.status(200).json({ email, token });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  googleLogin = passport.authenticate('google', {
    scope: ['profile', 'email'],
  });

  googleCallback = passport.authenticate('google', {
    successRedirect: GOOGLE_SUCCESS_REDIRECT, //currently hardcoded for my setup,need to change when connecting with our frontend
    failureRedirect: GOOGLE_FAILURE_REDIRECT,
  });

  githubLogin = passport.authenticate('github', {
    scope: ['profile', 'email'],
  });

  githubCallback = passport.authenticate('github', {
    successRedirect: GITHUB_SUCCESS_REDIRECT, //currently hardcoded for my setup,need to change when connecting with our frontend
    failureRedirect: GITHUB_FAILURE_REDIRECT,
  });

  public forgotPassword = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { email } = req.body;
      const user: IUser | null = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({ status: 'User not present' });
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
        from: '',
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

      const decoded = jwt.verify(token, JWT_SECRET!);

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
    const users = await UserModel.find({});
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
}
