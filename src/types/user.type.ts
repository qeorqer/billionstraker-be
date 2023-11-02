export type User = {
  login: string;
  password: string;
  isFirstEnter: boolean;
  created: Date;
  preferredCurrency: string | null;
};

export type UserForResponce = {
  login: string;
  isFirstEnter: boolean;
  created: Date;
  preferredCurrency: string | null;
};
