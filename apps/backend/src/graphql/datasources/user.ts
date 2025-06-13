import { IUserDataSource } from './types';
import { UserModel } from '@db'; // Assuming UserModel is in @db
import { User, CreateUserInput, UpdateUserInput } from '../../types/generated'; // Generated types from codegen

export default class UserDataSource implements IUserDataSource {
  // Create a new user
  async createUser(input: CreateUserInput): Promise<User> {
    const newUser = new UserModel({
      ...input,
      connections_count: 0, // Initialize with 0 connections
    });

    await newUser.save();
    return newUser;
  }

  // Update an existing user
  async updateUser(input: UpdateUserInput, userId: string): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, input, { new: true });
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  }

  // Delete a user by their ID
  async deleteUser(userId: string): Promise<boolean> {
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    return deletedUser ? true : false;
  }

  // Change the user's password
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user || user.password !== oldPassword) throw new Error('Invalid password');
    
    user.password = newPassword;
    await user.save();
    return true;
  }

  // Fetch a user by their ID
  async loadUserById(userId: string): Promise<User | null> {
    return UserModel.findById(userId); // Assuming user ID is the primary key
  }
}
