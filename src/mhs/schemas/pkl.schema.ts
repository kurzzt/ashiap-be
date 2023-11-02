import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
  timestamps: true
})
export class PKL {
  @Prop({
    default: null
  })
  passed: boolean;

  @Prop()
  nilai: number;

  @Prop()
  fileURL: string;

  @Prop()
  lulusAt: Date;
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

  @Prop()
  nilai: number;

  @Prop()
  fileURL: string;

  @Prop()
  lulusAt: Date;
}

export const SkripsiSchema = SchemaFactory.createForClass(Skripsi)