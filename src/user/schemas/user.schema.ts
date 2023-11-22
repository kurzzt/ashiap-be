import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, Types } from "mongoose";
import { ROLE } from "utils/global.enum";

@Schema({
  timestamps: true,
  versionKey: false
})
export class User {
  @Prop({
    type: Types.ObjectId,
    required: [true, 'User required'],
    unique: [true, 'User Already made'],
    refPath: 'role'
  })
  user: ObjectId;

  @Prop({
    // required: [true, 'Email Information required'],
    // unique: [true, 'Email Already used']]
    default: null
  })
  email: string;
  
  @Prop({
    // required: [true, 'Password Information required'],
    default: null,
    select : false
  })
  password: string;

  @Prop({
    required: [true, "Roles must be defined"],
    enum: [ROLE.ADM, ROLE.DEPT, ROLE.DSN, ROLE.MHS]
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User)