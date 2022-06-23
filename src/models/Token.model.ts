import { model, Schema, Document } from 'mongoose';

import { tokenType } from '@type/token.type';

const Token = new Schema({
  tokenId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expireAt: {
    type: Date,
    default: new Date(),
    expires: 60 * 60 * 24 * 30,
  },
});

type mongooseUser = Document & tokenType;
export default model<mongooseUser>('Token', Token);
