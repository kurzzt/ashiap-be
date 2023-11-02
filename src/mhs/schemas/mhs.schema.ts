import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, Types } from "mongoose";
import { SEX, StatMhs, AR } from "../../../utils/global.enum";

@Schema({
  timestamps: true
})
export class MHS {
  @Prop({
    required: [true, 'NIM required'],
    unique: [true, 'NIM already used']
  })
  nim: string;

  @Prop({
    required: [true, 'Name required'],
  })
  name: string;

  @Prop({
    required: [true, 'Gender Information required'],
    enum: Object.values(SEX)
  })
  gender: string
  
  @Prop({
    default: ""
  })
  address: string;

  @Prop({
    required: [true, "Provinsi Information required"]
  })
  province: string;

  @Prop({
    required: [true, "Angkatan Information required"]
  })
  YoE: number;

  @Prop({
    required: [true, "Jalur Masuk Information required"],
    enum: Object.values(AR)
  })
  AR: string;

  @Prop({
    required: [true, "NoTelp Information required"]
  })
  noTelp: string;

  @Prop({
    required: [true, "Status Information required"],
    enum: Object.values(StatMhs)
  })
  status: string;

  @Prop({
    default: ""
  })
  desc: string;

  @Prop({
    type: Types.ObjectId, ref: "IRS",
    // required: [true, "IRS Information Required"],
  })
  irs: ObjectId[];
  
  @Prop({
    type: Types.ObjectId, ref: "PKL",
    // required: [true, "PKL Information Required"],
    default: null
  })
  pkl: ObjectId;

  @Prop({
    type: Types.ObjectId, ref: "Skripsi",
    // required: [true, "Script Information Required"],
    default: null
  })
  skripsi: ObjectId;

  @Prop({
    type: Types.ObjectId, ref: "DSN",
    // required: [true, "Need to be bind with Academic Advisor"],
  })
  dosWal: ObjectId;
}

export const MHSSchema = SchemaFactory.createForClass(MHS)