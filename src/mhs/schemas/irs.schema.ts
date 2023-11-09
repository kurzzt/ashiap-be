import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { StatIRS } from "../../../utils/global.enum";

@Schema({
  timestamps: true
})
export class IRS {
  @Prop({
    required: [true, 'Status Information required'],
    enum: Object.values(StatIRS)
  })
  status: string;

  @Prop({
    required: [true, 'Semester Information required'],
    min: 1,
    max: 14
  })
  semester: number;

  @Prop({
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