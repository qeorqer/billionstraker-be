import { Document, model, Schema } from "mongoose"
import { categoryType } from "../interfaces/category.interface";

const schema: Schema = new Schema({
  nameEn: {type: String, required: true},
  nameRu: {type: String, required: true},
  isExpense: {type: Boolean, required: true},
})

type MongooseUser = Document & categoryType
export default model<MongooseUser>('Category', schema)