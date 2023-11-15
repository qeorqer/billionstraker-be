import { Types } from 'mongoose';

enum CategoryTypes {
  'expense' = 'expense',
  'profit' = 'profit',
}

export type Category = {
  _id: Types.ObjectId;
  name: string;
  categoryType: CategoryTypes;
  ownerId: Types.ObjectId;
};
