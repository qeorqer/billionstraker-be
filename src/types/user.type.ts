export type UserType = {
  login: string;
  password: string;
  isFirstEnter: boolean;
  created: Date;
  card?: string;
  cash?: string;
  fullName?: string;
};

export type UserForReturnType = {
  login: string;
};
