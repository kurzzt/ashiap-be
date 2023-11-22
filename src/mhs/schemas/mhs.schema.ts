import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, Types } from "mongoose";
import { SEX, StatMhs, AR } from "../../../utils/global.enum";

@Schema({
  timestamps: true,
  versionKey: false
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
    default: null,
    enum: Object.values(SEX)
  })
  gender: string
  
  @Prop({
    default: null,
  })
  address: string;

  @Prop({
    default: null,
  })
  province: string;

  @Prop({
    required: [true, "Angkatan Information required"]
  })
  YoE: number;

  @Prop({
    default: null,
    enum: Object.values(AR)
  })
  AR: string;

  @Prop({
    default: null,
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
  })
  irs: ObjectId[];
  
  @Prop({
    type: Types.ObjectId, ref: "PKL",
    default: null
  })
  pkl: ObjectId;

  @Prop({
    type: Types.ObjectId, ref: "Skripsi",
    default: null
  })
  skripsi: ObjectId;

  @Prop({
    default: ""
  })
  photoURL: string

  @Prop({
    type: Types.ObjectId, ref: "DSN",
    required: [true, "Need to be bind with Academic Advisor"]
  })
  doswal: ObjectId;

  @Prop({
    default: false
  })
  check: boolean;
}

export const MHSSchema = SchemaFactory.createForClass(MHS)