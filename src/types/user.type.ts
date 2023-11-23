export type User = {
  login: string;
  password: string;
  isFirstEnter: boolean;
  created: Date;
  preferredCurrency: string | null;
};

export type UserForResponse = {
  login: string;
  isFirstEnter: boolean;
  created: Date;
  preferredCurrency: string | null;
};
