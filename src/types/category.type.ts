import { Types } from 'mongoose';

enum categoriesTypes {
  'expense' = 'expense',
  'profit' = 'profit',
}

export type categoryType = {
  name: string;
  categoryType: categoriesTypes;
  ownerId: Types.ObjectId;
};
