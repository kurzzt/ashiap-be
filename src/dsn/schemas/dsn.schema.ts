import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { POS, SEX, eduLev, jobStat } from "utils/global.enum";

@Schema({
  timestamps: true,
  versionKey: false
})
export class DSN {
  @Prop({
    required: [true, 'NIP Information required'],
    unique: [true, 'NIP must be unique']
  })
  nip: string;

  @Prop({
    required: [true, 'Name Information required'],
  })
  name: string;

  @Prop({
    required: [true, 'Gender Information required'],
    enum: Object.values(SEX)
  })
  gender: string;

  @Prop({
    required: [true, 'Position Information required'],
    enum: Object.values(POS)
  })
  position: string;

  @Prop({
    required: [true, 'Education Level Information required'],
    enum: Object.values(eduLev)
  })
  eduLevel: string;

  @Prop({
    required: [true, 'Job Status Information required'],
    enum: Object.values(jobStat)
  })
  jobStat: string;

  @Prop({
    required: [true, 'NoTelp Information required']
  })
  noTelp: string;

  @Prop({
    default: ''
  })
  address: string;

  @Prop({
    required: [true, 'Province Information required']
  })
  province: string;

  @Prop({
    // required: [true, 'photoURL required']
  })
  photoURL: string;

  @Prop({
    default: ''
  })
  desc: string;

  @Prop({
    default: true
  })
  active: boolean;
}

export const DSNSchema = SchemaFactory.createForClass(DSN)