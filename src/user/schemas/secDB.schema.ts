import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({
  versionKey: false
})
export class secDB {
  @Prop({
    type: Types.ObjectId,
    required: [true, 'User required'],
  })
  _id: Types.ObjectId;
  
  @Prop({
    default: null
  })
  email: string;

  @Prop({
    default: null
  })
  identity: string;

  @Prop({
    required: [true, 'Password Information required']
  })
  password: string;
}

export const secDBSchema = SchemaFactory.createForClass(secDB)