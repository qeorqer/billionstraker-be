import { UserType, UserForReturnType } from '../interfaces/user.interface';
import { omit } from 'lodash';

export const userDto = (user: UserType): UserForReturnType => {
  return omit(user, ['password', 'refreshToken']);
};
