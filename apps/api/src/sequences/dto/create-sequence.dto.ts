import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsIn,
} from 'class-validator';

class CreateSequenceStepDto {
  @IsInt()
  @Min(0)
  delayNumber!: number;

  @IsString()
  @IsIn(['DIAS', 'HORAS'])
  delayUnit!: string;

  @IsString()
  @IsIn(['APOS_PAGAMENTO', 'APOS_ENTREGA'])
  trigger!: string;

  @IsString()
  @IsIn(['WHATSAPP', 'EMAIL'])
  channel!: string;

  @IsString()
  @IsNotEmpty()
  messageTemplate!: string;
}

export class CreateSequenceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateSequenceStepDto)
  steps!: CreateSequenceStepDto[];
}
