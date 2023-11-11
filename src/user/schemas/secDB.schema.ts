import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class secDB {
  @Prop({
    type: Types.ObjectId,
    required: [true, 'User required'],
    refPath: ['MHS', 'DSN', 'ADM', 'DEPT'] //fix
  })
  _id: Types.ObjectId;
  
  @Prop({
    required: [true, 'Email Information required'],
    unique: [true, "Email Already used"]
  })
  email: string;
  
  @Prop({
    required: [true, 'Password Information required']
  })
  password: string;
}

export const secDBSchema = SchemaFactory.createForClass(secDB)