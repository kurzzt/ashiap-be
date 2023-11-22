import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
  timestamps: true,
  versionKey: false
})
export class ADM {
  @Prop({
    required: [true, 'Name Information required'],
  })
  name: string;
  
  @Prop({
    required: [true, 'NoTelp Information required']
  })
  noTelp: string;

  @Prop({
    default: ""
  })
  address: string;

  @Prop({
    default: ""
  })
  desc: string;

  @Prop({
    default: true,
  })
  active: boolean;
}

export const ADMSchema = SchemaFactory.createForClass(ADM)