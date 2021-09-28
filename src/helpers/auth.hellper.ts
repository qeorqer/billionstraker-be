import { Types } from "mongoose"
import config from 'config'
import jwt from 'jsonwebtoken'

const accessSecret:string = config.get('jwtAccessSecret')
const refreshSecret:string = config.get('jwtRefreshSecret')

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