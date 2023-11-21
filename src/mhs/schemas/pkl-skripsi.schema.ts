import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { StatIRS } from "utils/global.enum";

@Schema({
  timestamps: true
})
export class PKL {
  @Prop({
    default: null
  })
  passed: boolean;

  @Prop({
    default: null
  })
  nilai: number;

  @Prop({
    default: ""
  })
  fileURL: string;

  @Prop({
    default: null
  })
  lulusAt: Date;

  @Prop({
    default: StatIRS.UNVERIFIED,
    enum: Object.values(StatIRS)
  })
  isVerified: boolean;
}

export const PKLSchema = SchemaFactory.createForClass(PKL)

@Schema({
  timestamps: true
})
export class Skripsi {
  @Prop({
    default: null
  })
  passed: boolean;

  @Prop({
    default: null
  })
  nilai: number;

  @Prop({
    default: ""
  })
  fileURL: string;

  @Prop({
    default: null
  })
  lulusAt: Date;

  @Prop({
    default: StatIRS.UNVERIFIED,
    enum: Object.values(StatIRS)
  })
  isVerified: string;
}

export const SkripsiSchema = SchemaFactory.createForClass(Skripsi)