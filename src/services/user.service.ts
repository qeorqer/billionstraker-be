import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

import User from '@models/User.model';
import Token from '@models/Token.model';
import ApiError from '@exceptions/api-errors';
import { UserType } from '@type/user.type';
import { userDto } from '@dto/user.dto';
import { updateTokens, verifyRefresh } from '@services/token.service';

export const signUp = async (
  login: string,
  password: string,
): Promise<UserType | void> => {
  const isRegistered = await User.findOne({ login });

  if (isRegistered) {
    throw ApiError.BadRequest('User already exists');
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
  accessExpiration: number;
};

export const logIn = async (
  login: string,
  password: string,
): Promise<logInReturnType> => {
  const user = await User.findOne({ login });

  if (!user) {
    throw ApiError.BadRequest('There is no such user');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw ApiError.BadRequest('Incorrect login data');
  }

  const tokens = await updateTokens(user._id);

  const userForReturn: Partial<UserType> = userDto(user.toObject());

  return {
    user: userForReturn,
    ...tokens,
  };
};

type refreshReturnType = {
  refreshToken: string;
  accessToken: string;
  accessExpiration: number;
  user: Partial<UserType>;
};

export const refresh = async (
  refreshToken: string,
): Promise<refreshReturnType> => {
  if (!refreshToken) {
    throw ApiError.UnauthorizedError();
  }

  const verifiedToken = verifyRefresh(refreshToken);
  if (typeof verifiedToken === 'string' || verifiedToken.type !== 'refresh') {
    throw ApiError.UnauthorizedError();
  }

  const token = await Token.findOne({ tokenId: verifiedToken.id });
  if (!token) {
    throw ApiError.BadRequest('Token is invalid');
  }

  const user = await User.findById(token.userId);
  if (!user) {
    throw ApiError.BadRequest('User does not exist');
  }

  const updatedTokens = await updateTokens(token.userId, token.tokenId, true);

  const userForReturn: Partial<UserType> = userDto(user.toObject());

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

  await Token.findOneAndRemove({ tokenId: verifiedToken.id });
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
    throw ApiError.BadRequest('There is no such user');
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
    throw ApiError.BadRequest('There is no such user');
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
    throw ApiError.BadRequest('There is no such user');
  }

  const userWithoutExtraFields = userDto(user);

  return userWithoutExtraFields;
};
