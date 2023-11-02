import { omit } from 'lodash';

import { User, UserForResponce } from '@type/user.type';

export const userDto = (user: User): UserForResponce => {
  return omit(user, ['password']);
};
