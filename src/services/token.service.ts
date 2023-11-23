import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import TokenModel from '@models/Token.model';
import ApiError from '@exceptions/api-errors';

const ACCESS_TOKEN_TTL = 15;

export const verifyAccess = (accessToken: string): JwtPayload | string => {
  try {
    return jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
  } catch (error) {
    let message = 'Verification of access token failed';

    if (error instanceof Error) {
      message = error.message;
    }

    throw ApiError.BadRequest(message);
  }
};

export const verifyRefresh = (refreshToken: string): JwtPayload | string => {
  try {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch (error) {
    let message = 'Verification of refresh token failed';

    if (error instanceof Error) {
      message = error.message;
    }

    throw ApiError.BadRequest(message);
  }
};

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'access' }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: `${ACCESS_TOKEN_TTL}m`,
  });
};

type generateRefreshTokenType = {
  token: string;
  id: string;
};

const generateRefreshToken = (): generateRefreshTokenType => {
  const uuid = uuidv4();
  return {
    token: jwt.sign(
      { id: uuid, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' },
    ),
    id: uuid,
  };
};

const replaceDbRefreshToken = async ({
  newTokenId,
  oldTokenId,
  userId,
  update,
}: {
  newTokenId: string;
  oldTokenId: string;
  userId: string;
  update: boolean;
}) => {
  if (update) {
    await TokenModel.findOneAndRemove({ tokenId: oldTokenId });
  }

  return TokenModel.create({ tokenId: newTokenId, userId });
};

export type updateTokensReturnType = {
  accessToken: string;
  refreshToken: string;
  accessExpiration: number;
};

export const updateTokens = async (
  userId: string,
  tokenId: string = '',
  update = false,
): Promise<updateTokensReturnType> => {
  const accessToken: string = generateAccessToken(userId);
  const refreshToken: generateRefreshTokenType = generateRefreshToken();
  const accessExpiration: number = new Date(
    new Date().getTime() + ACCESS_TOKEN_TTL * 60000,
  ).valueOf();

  await replaceDbRefreshToken({
    newTokenId: refreshToken.id,
    oldTokenId: tokenId,
    userId,
    update,
  });

  return { accessToken, refreshToken: refreshToken.token, accessExpiration };
};
