import { omit } from 'lodash';

import { UserType, UserForReturnType } from '../interfaces/user.interface';

export const userDto = (user: UserType): UserForReturnType => {
  return omit(user, ['password', 'refreshToken']);
};
