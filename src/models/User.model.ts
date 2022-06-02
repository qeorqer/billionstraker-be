import { Document, model, Schema, Types } from 'mongoose';
import { UserType } from '../types/user.type';

const schema: Schema = new Schema({
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created: { type: Date, required: true },
  refreshToken: { type: String, required: false },
  card: { type: Number, required: false, default: 0 },
  cash: { type: Number, required: false, default: 0 },
  isFirstEnter: { type: Boolean, required: false, default: true },
  fullName: { type: String, required: false },
});

type MongooseUser = Document & UserType;
export default model<MongooseUser>('User', schema);
