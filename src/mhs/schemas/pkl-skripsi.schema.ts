import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
  timestamps: true,
  versionKey: false
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
  lamastudi: number;

  @Prop({
    default: StatAP.UNVERIFIED,
    enum: Object.values(StatAP)
  })
  isVerified: string;
}

export const PKLSchema = SchemaFactory.createForClass(PKL)

@Schema({
  timestamps: true,
  versionKey: false
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
  isVerified: boolean;
}

export const SkripsiSchema = SchemaFactory.createForClass(Skripsi)