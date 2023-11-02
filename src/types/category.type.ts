import { Types } from 'mongoose';

enum CategoryTypes {
  'expense' = 'expense',
  'profit' = 'profit',
}

export type Category = {
  name: string;
  categoryType: CategoryTypes;
  ownerId: Types.ObjectId;
};
