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
    default: null
  })
  email: string;
  
  @Prop({
    required: [true, 'Password Information required'],
    select : false
  })
  password: string;

  @Prop({
    required: [true, "Roles must be defined"],
    enum: Object.values(ROLE)
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User)