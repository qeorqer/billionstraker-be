import { Document, model, Schema } from 'mongoose';

import { UserType } from '@type/user.type';

const schema: Schema = new Schema({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created: { type: Date, required: true },
  isFirstEnter: { type: Boolean, required: false, default: true },
});

type MongooseUser = Document & UserType;
export default model<MongooseUser>('User', schema);
