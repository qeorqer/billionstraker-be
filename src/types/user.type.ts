export type UserType = {
  login: string;
  password: string;
  isFirstEnter: boolean;
  created: Date;
};

export type UserForReturnType = {
  login: string;
  isFirstEnter: boolean;
  created: Date;
};
