import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

// export class TestClientTypeFieldDto {

//     id: "8430" as const ;
// bitrixId: "UF_CRM_1744358047" as const;
// type: "enumeration" as const;
// list: [
//     {
//         bitrixId: "18030",
//         name: "Физическое лицо",
//         sort: "10"
//     },
//     {
//         bitrixId: "18032",
//         name: "Юридическое лицо",
//         sort: "20"
//     }
// ];
// name: "Вы являетесь физическим или юридическим лицом?" as const;
// code: 'organization_type' as const;
// multiple: false as const;
// mandatory: false as const;
// group: 'organization' as const;
// value: '' as string;

// }
export enum TestClientTypeFieldEnum {
    FIZ = 18030,
    UR = 18032,
}
export class UpdateDealDto {
    @ApiProperty({ description: 'ID заявки', example: 34028 })
    @IsNumber()
    dealId: number;

    @ApiProperty({ description: 'ID поля', example: 'UF_CRM_1744358047' })
    @IsString()
    fieldId: string;

    @ApiProperty({
        description: 'Значение поля',
        enum: TestClientTypeFieldEnum,
    })
    @IsEnum(TestClientTypeFieldEnum)
    value: TestClientTypeFieldEnum;
}
