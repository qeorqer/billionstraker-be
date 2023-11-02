import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

import UserModel from '@models/User.model';
import TokenModel from '@models/Token.model';
import ApiError from '@exceptions/api-errors';
import { User } from '@type/user.type';
import { userDto } from '@dto/user.dto';
import { updateTokens, verifyRefresh } from '@services/token.service';

type AuthResponse = {
  user: Partial<User>;
  refreshToken: string;
  accessToken: string;
  accessExpiration: number;
};

export const signUp = async (
  login: string,
  password: string,
): Promise<AuthResponse> => {
  const isRegistered = await UserModel.findOne({ login });

  if (isRegistered) {
    throw ApiError.BadRequest('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new UserModel({
    login,
    password: hashedPassword,
    created: new Date(),
  });

  const tokens = await updateTokens(user._id);

  await user.save();
  return {
    user,
    ...tokens
  };
};

export const logIn = async (
  login: string,
  password: string,
): Promise<AuthResponse> => {
  const user = await UserModel.findOne({ login });

  if (!user) {
    throw ApiError.BadRequest('There is no such user');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw ApiError.BadRequest('Incorrect login data');
  }

  const tokens = await updateTokens(user._id);

  const userForReturn: Partial<User> = userDto(user.toObject());

  return {
    user: userForReturn,
    ...tokens,
  };
};

type RefreshTokenResponse = {
  refreshToken: string;
  accessToken: string;
  accessExpiration: number;
  user: Partial<User>;
};

export const refresh = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  if (!refreshToken) {
    throw ApiError.UnauthorizedError();
  }

  const verifiedToken = verifyRefresh(refreshToken);
  if (typeof verifiedToken === 'string' || verifiedToken.type !== 'refresh') {
    throw ApiError.UnauthorizedError();
  }

  const token = await TokenModel.findOne({ tokenId: verifiedToken.id });
  if (!token) {
    throw ApiError.BadRequest('Token is invalid');
  }

  const user = await UserModel.findById(token.userId);
  if (!user) {
    throw ApiError.BadRequest('User does not exist');
  }

  const updatedTokens = await updateTokens(token.userId, token.tokenId, true);

  const userForReturn: Partial<User> = userDto(user.toObject());

  return {
    ...updatedTokens,
    user: userForReturn,
  };
};

export const logOut = async (refreshToken: string): Promise<void> => {
  if (!refreshToken) {
    throw ApiError.UnauthorizedError();
  }

  const verifiedToken = verifyRefresh(refreshToken);
  if (typeof verifiedToken === 'string' || verifiedToken.type !== 'refresh') {
    throw ApiError.UnauthorizedError();
  }

  await TokenModel.findOneAndRemove({ tokenId: verifiedToken.id });
};

export const setFirstEnter = async (
  userId: Types.ObjectId,
): Promise<Partial<User>> => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { isFirstEnter: false },
    { new: true },
  );

  if (!user) {
    throw ApiError.BadRequest('There is no such user');
  }

  const userWithoutExtraFields = userDto(user);

  return userWithoutExtraFields;
};
