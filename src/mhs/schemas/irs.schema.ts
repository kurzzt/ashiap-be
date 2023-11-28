import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { StatAP } from "utils/global.enum";

@Schema({
  timestamps: true,
  versionKey: false
})
export class IRS {
  @Prop({
    default: StatAP.NOT_UPLOADED,
    enum: Object.values(StatAP)
  })
  status: string;

  @Prop({
    required: [true, 'Semester Information required'],
    min: 1,
    max: 14
  })
  semester: number;

  @Prop({
    default: null,
    min: 0,
    max: 24
  })
  sks: number;

  @Prop({
    default: ""
  })
  fileURL: string;

  @Prop({
    type: { ipk: Number, fileURL: String, status: String },
    _id: false
  })
  khs: { ipk: number, fileURL: string, status: string };
}

export const IRSSchema = SchemaFactory.createForClass(IRS)