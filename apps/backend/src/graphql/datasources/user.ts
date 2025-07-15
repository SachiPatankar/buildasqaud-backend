import { IUserDataSource } from './types';
import { UserModel, ConnectionModel, ChatModel } from '@db'; // Assuming UserModel, ConnectionModel, and ChatModel are in @db
import { User, CreateUserInput, UpdateUserInput } from '../../types/generated'; // Generated types from codegen

export default class UserDataSource implements IUserDataSource {
  createUser = async (input: CreateUserInput): Promise<User> => {
    const newUser = new UserModel({
      ...input,
      connections_count: 0, // Initialize with 0 connections
    });

    await newUser.save();
    return newUser;
  };

  updateUser = async (input: UpdateUserInput, userId: string): Promise<User> => {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, input, {
      new: true,
    });
    if (!updatedUser) throw new Error('User not found');
    return updatedUser;
  };

  deleteUser = async (userId: string): Promise<boolean> => {
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    return deletedUser ? true : false;
  };

  changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    const user = await UserModel.findById(userId);
    if (!user || user.password !== oldPassword)
      throw new Error('Invalid password');

    user.password = newPassword;
    await user.save();
    return true;
  };

  loadUserById = async (
    userId: string,
    current_user_id?: string
  ): Promise<User | null> => {
    const user = await UserModel.findById(userId);
    if (!user) return null;
    let is_connection = null;
    let chat_id = null;
    if (current_user_id && userId !== current_user_id) {
      const connection = await ConnectionModel.findOne({
        $or: [
          { requester_user_id: current_user_id, addressee_user_id: userId },
          { requester_user_id: userId, addressee_user_id: current_user_id },
        ],
      });
      is_connection = connection ? connection.status : null;
      if (is_connection === 'accepted') {
        const chat = await ChatModel.findOne({
          participant_ids: { $all: [current_user_id, userId] },
        });
        chat_id = chat ? chat._id : null;
      }
    }
    return {
      ...user.toObject(),
      is_connection,
      chat_id,
    };
  };
}
