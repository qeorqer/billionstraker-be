import { Document, model, Schema, Types } from 'mongoose';
import { categoryType } from '../types/category.type';

const categoriesType = ['expense', 'profit'];

const schema: Schema = new Schema({
  name: { type: String, required: true },
  categoryType: { type: String, enum: categoriesType, required: true },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
});

type MongooseCategory = Document & categoryType;
export default model<MongooseCategory>('Category', schema);
