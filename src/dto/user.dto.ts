import { omit } from 'lodash';

import { UserType, UserForReturnType } from '@type/user.type';

export const userDto = (user: UserType): UserForReturnType => {
  return omit(user, ['password']);
};
