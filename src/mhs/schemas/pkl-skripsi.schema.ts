import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

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
    default: null
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
    default: null
  })
  isVerified: boolean;
}

export const SkripsiSchema = SchemaFactory.createForClass(Skripsi)