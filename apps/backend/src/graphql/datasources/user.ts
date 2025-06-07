import bcrypt from 'bcrypt';
import { User } from '@db';
import { IUserDataSource } from './types';
import { GraphQLError } from 'graphql';
export default class UserSource implements IUserDataSource {
  getUsers = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return User.find({}).sort({ created_at: -1 }).skip(skip).limit(limit);
  };

  getUserById = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new GraphQLError(`User with ID ${userId} not found`);
    return user;
  };

  updateUserPhoto = async (userId: string, photoUrl: string) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { photo: photoUrl },
      { new: true }
    );
    if (!user) throw new GraphQLError(`User with ID ${userId} not found`);
    return user;
  };

  deletePhoto = async (userId: string) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { photo: 1 } },
      { new: true }
    );
    if (!user) throw new GraphQLError(`User with ID ${userId} not found`);
    return user;
  };

  // — New: update first_name & last_name —
  updateUser = async (
    userId: string,
    data: { first_name?: string; last_name?: string }
  ) => {
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    if (!user) throw new GraphQLError(`User with ID ${userId} not found`);
    return user;
  };

  // — New: change password —
  changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
  ) => {
    const user = await User.findById(userId);
    if (!user) throw new GraphQLError('User not found');
    if (!user.password) throw new GraphQLError('No password set on account');

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new GraphQLError('Incorrect current password');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    return true;
  };
}
