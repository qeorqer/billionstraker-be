import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

import User from '../models/User.model';
import ApiError from '../exceptions/api-errors';
import { UserForReturnType, UserType } from '../types/user.type';
import { userDto } from '../dto/user.dto';
import { generateTokenPair, validateRefreshToken } from '../helpers/auth.hellper';
import { updateTokens, updateTokensReturnType, verifyRefresh } from './token.service';

export const signUp = async (login: string, password: string): Promise<UserType | void> => {
  const isRegistered = await User.findOne({ login });

  if (isRegistered) {
    throw ApiError.BadRequest(
      'User already exists',
      'Пользователь уже существует',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    login,
    password: hashedPassword,
    created: new Date(),
  });

  await user.save();
  return user;
};

type logInReturnType = {
  user: Partial<UserType>;
  refreshToken: string;
  accessToken: string;
};

export const logIn = async (login: string, password: string): Promise<logInReturnType> => {
  const user = await User.findOne({ login });

  if (!user) {
    throw ApiError.BadRequest(
      'There is no such user',
      'В системе нет такого пользователя',
    );
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw ApiError.BadRequest(
      'Incorrect login data',
      'Некорретные данные при входе',
    );
  }

  const tokens = await updateTokens(user._id);

  const userForReturn: Partial<UserType> = userDto(user.toObject());

  return {
    user: userForReturn,
    ...tokens,
  };
};

type logOutReturnType = {
  refreshToken: string;
};

export const logOut = async (
  refreshToken: string,
): Promise<logOutReturnType> => {
  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw ApiError.BadRequest('No such token', ' Нет такго токена');
  }

  user.refreshToken = undefined;
  await user.save();

  return {
    refreshToken,
  };
};

export const refresh = async (
  refreshToken: string,
): Promise<logInReturnType> => {
  if (!refreshToken) {
    throw ApiError.UnauthorizedError();
  }

  const userData = validateRefreshToken(refreshToken);
  const user = await User.findOne({ refreshToken });

  if (!userData || !user) {
    throw ApiError.UnauthorizedError();
  }

  const { accessToken, refreshToken: newRefresh } = generateTokenPair(user._id);

  const returnUser: UserForReturnType = userDto(user.toObject());

  user.refreshToken = newRefresh;
  await user.save();

  return {
    user: returnUser,
    refreshToken: newRefresh,
    accessToken,
  };
};

export const updateBalance = async (
  userId: Types.ObjectId,
  sum: number,
  isExpense: boolean,
  isCard: boolean,
): Promise<Partial<UserType>> => {
  const numToIncrease: number = isExpense ? sum * -1 : sum;
  const objectToUpdate = isCard
    ? { card: numToIncrease }
    : { cash: numToIncrease };

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: objectToUpdate,
    },
    { new: true },
  );

  if (!user) {
    throw ApiError.BadRequest(
      'There is no such user',
      'В базе нет такого пользователя',
    );
  }

  const userWithoutExtraFields = userDto(user);

  return userWithoutExtraFields;
};

export const setFirstEnter = async (
  userId: Types.ObjectId,
): Promise<Partial<UserType>> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isFirstEnter: false },
    { new: true },
  );

  if (!user) {
    throw ApiError.BadRequest(
      'There is no such user',
      'В базе нет такого пользователя',
    );
  }

  const userWithoutExtraFields = userDto(user);

  return userWithoutExtraFields;
};

export const setInitialValues = async (
  userId: Types.ObjectId,
  card: number,
  cash: number,
): Promise<Partial<UserType>> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { card: String(card), cash: String(cash) } },
    { new: true },
  );

  if (!user) {
    throw ApiError.BadRequest(
      'There is no such user',
      'В базе нет такого пользователя',
    );
  }

  const userWithoutExtraFields = userDto(user);

  return userWithoutExtraFields;
};
