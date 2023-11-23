import { Document, model, Schema } from 'mongoose';

import { User } from '@type/user.type';

const schema: Schema = new Schema({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created: { type: Date, required: true },
  isFirstEnter: { type: Boolean, required: false, default: true },
  preferredCurrency: {type: String, required: false, default: null}
});

type MongooseUser = Document & User;
export default model<MongooseUser>('User', schema);
