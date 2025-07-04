import { Controller, Get, Query } from "@nestjs/common";
import { AlfaFieldUseCase } from "../use-case/alfa-field.use-case";
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TDealData } from "@alfa/entities/entities/deal/bx-data";


export class AlfaFieldsResponseDto {
    @ApiProperty()
    fieldData: TDealData;
    @ApiProperty({
        type: [String]
    })
    bxFieldsIds: string[];
}


@ApiTags('Alfa Deal Fields')
@Controller('alfa-fields')
export class AlfaFieldsController {
    constructor(
        private readonly alfaFieldUseCase: AlfaFieldUseCase
    ) { }


    @ApiOperation({ summary: 'Get fields' })
    @ApiResponse({
        status: 200,
        description: 'Fields',
        type: AlfaFieldsResponseDto
    })


    @Get('')
    async getFields(@Query('domain') domain: string): Promise<{
        fieldData: TDealData,
        bxFieldsIds: string[]
    }> {
        return this.alfaFieldUseCase.getFields(domain);
    }
}