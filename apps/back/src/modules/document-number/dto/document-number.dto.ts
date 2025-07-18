import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { BitrixHookDto } from "@/lib/dto";

export class DocumentNumberDto extends BitrixHookDto {
    @ApiProperty({ example: 123456 })
    @IsNumber()
    dealId: number;
}
