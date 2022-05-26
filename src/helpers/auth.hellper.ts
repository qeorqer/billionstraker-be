import { Types } from "mongoose";
import jwt from 'jsonwebtoken';

const accessSecret:string = process.env.jwtAccessSecret!;
const refreshSecret:string = process.env.jwtRefreshSecret!;

export const generateTokenPair = (userId: Types.ObjectId): { accessToken: string, refreshToken: string } => {
  return {
    accessToken: jwt.sign(
      { id: userId },
      accessSecret,
      { expiresIn: '30m' }
    ),
    refreshToken: jwt.sign(
      { id: userId },
      refreshSecret,
      { expiresIn: '30d', algorithm: 'HS512' }
    ),
  }
}

export const validateAccessToken = (token:string) => {
    try{
      return jwt.verify(token, accessSecret)
    } catch (e) {
      return null
    }
}

export const validateRefreshToken = (token:string) => {
    try{
      return jwt.verify(token, refreshSecret)
    } catch (e) {
      return null
    }
}
