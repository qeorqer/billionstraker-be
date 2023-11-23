import { omit } from 'lodash';

import { User, UserForResponse } from '@type/user.type';

export const userDto = (user: User): UserForResponse => {
  return omit(user, ['password']);
};
