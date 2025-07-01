import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EntityTypeIdEnum, IAlfaParticipantSmartItem, SmartStageEnum } from "@alfa/entities";




export class SmartItemDto implements IAlfaParticipantSmartItem {
    @IsOptional()
    @IsNumber()
    id?: number
    @IsOptional()
    @IsString()
    xmlId?: string
    @IsOptional()
    @IsNumber()
    createdBy?: number
    updatedBy?: number
    movedBy?: number
    @IsOptional()
    @IsString()
    createdTime?: string
    @IsOptional()
    @IsString()
    updatedTime?: string
    @IsOptional()
    @IsString()
    movedTime?: string
    @IsOptional()
    @IsString()
    stageId?: SmartStageEnum






    @ApiProperty({ name: 'title', example: 'Test' })
    @IsNotEmpty()
    @IsString()
    title: string

    @ApiProperty({ name: 'ufCrm12AccountantGos', example: ['Test'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ufCrm12AccountantGos?: string[]

    @ApiProperty({ name: 'ufCrm12AccountantMedical', example: ['Test'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ufCrm12AccountantMedical?: string[]

    @ApiProperty({ name: 'ufCrm12Zakupki', example: ['Test'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ufCrm12Zakupki?: string[]

    @ApiProperty({ name: 'ufCrm12Kadry', example: ['Test'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ufCrm12Kadry?: string[]

    @ApiProperty({ name: 'ufCrm12Days', example: ['Test'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ufCrm12Days?: string[]

    @ApiProperty({ name: 'ufCrm12Format', example: ['Test'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    ufCrm12Format?: string[]

    @ApiProperty({ name: 'ufCrm12AddressForUdost', example: 'Test' })
    @IsOptional()
    @IsString()
    ufCrm12AddressForUdost?: string

    @ApiProperty({ name: 'ufCrm12Phone', example: 'Test' })
    @IsOptional()
    @IsString()
    ufCrm12Phone?: string

    @ApiProperty({ name: 'ufCrm12Email', example: 'Test' })
    @IsOptional()
    @IsString()
    ufCrm12Email?: string

    @ApiProperty({ name: 'ufCrm12Comment', example: 'Test' })
    @IsOptional()
    @IsString()
    ufCrm12Comment?: string

    @ApiProperty({ name: 'ufCrm12IsPpk', example: 'Test' })
    @IsOptional()
    @IsString()
    ufCrm12IsPpk?: string

    @ApiProperty({ name: 'ufCrm12Name', example: 'Test', description: 'ФИО' })
    @IsOptional()
    @IsString()
    ufCrm12Name: string

    @ApiProperty({ name: 'parentId2', example: 33962, description: 'dealId' })
    @IsOptional()
    @IsNumber()
    parentId2?: number

    @ApiProperty({ name: 'contactId', example: 44448, description: 'contactId' })
    @IsOptional()
    @IsNumber()
    contactId?: number


    @ApiProperty({ name: 'companyId', example: 350088, description: 'companyId' })
    @IsOptional()
    @IsNumber()
    companyId?: number

    @ApiProperty({ name: 'opportunity', example: 100000 })
    @IsOptional()
    @IsNumber()
    opportunity: number

    @ApiProperty({ name: 'isManualOpportunity', example: 'Y' })
    @IsOptional()
    @IsString()
    isManualOpportunity: string

    @ApiProperty({ name: 'taxValue', example: 100000 })
    @IsOptional()
    @IsNumber()
    taxValue: number

    @ApiProperty({ name: 'currencyId', example: 'RUB' })
    @IsOptional()
    @IsString()
    currencyId: string

    @ApiProperty({ name: 'mycompanyId', example: 1 })
    @IsOptional()
    @IsNumber()
    mycompanyId: number

    @ApiProperty({ name: 'assignedById', example: 1 })
    @IsOptional()
    @IsNumber()
    assignedById: number

    @ApiProperty({ name: 'lastActivityBy', example: 1 })
    @IsOptional()
    @IsNumber()
    lastActivityBy: number

    @ApiProperty({ name: 'lastActivityTime', example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsString()
    lastActivityTime: string

    @ApiProperty({ name: 'lastCommunicationTime', example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsString()
    lastCommunicationTime: string

    @ApiProperty({ name: 'lastCommunicationCallTime', example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsString()
    lastCommunicationCallTime: string

    @ApiProperty({ name: 'lastCommunicationEmailTime', example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsString()
    lastCommunicationEmailTime: string

    @ApiProperty({ name: 'lastCommunicationImolTime', example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsString()
    lastCommunicationImolTime: string

    @ApiProperty({ name: 'lastCommunicationWebformTime', example: '2024-01-01T00:00:00Z' })
    @IsOptional()
    @IsString()
    lastCommunicationWebformTime: string

    @ApiProperty({ name: 'utmSource', example: 'google' })
    @IsOptional()
    @IsString()
    utmSource: string

    @ApiProperty({ name: 'utmMedium', example: 'cpc' })
    @IsOptional()
    @IsString()
    utmMedium: string

    @ApiProperty({ name: 'utmCampaign', example: 'campaign' })
    @IsOptional()
    @IsString()
    utmCampaign: string

    @ApiProperty({ name: 'utmContent', example: 'content' })
    @IsOptional()
    @IsString()
    utmContent: string

    @ApiProperty({ name: 'utmTerm', example: 'term' })
    @IsOptional()
    @IsString()
    utmTerm: string

    @ApiProperty({ name: 'observers', example: [1, 2, 3] })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    observers: number[]

    @ApiProperty({ name: 'contactIds', example: [1, 2, 3] })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    contactIds: number[]

    @ApiProperty({ name: 'entityTypeId', example: 1036 })
    @IsOptional()
    @IsNumber()
    entityTypeId: number

}
export class AddSmartItemDto {
    @ApiProperty({ name: 'entityTypeId', enum: EntityTypeIdEnum })
    @IsEnum(EntityTypeIdEnum)
    entityTypeId: EntityTypeIdEnum

    @ApiProperty({ name: 'item', type: SmartItemDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => SmartItemDto)
    item: SmartItemDto


    // @ApiProperty({ name: 'categoryId', enum: CategoryId })
    // @IsEnum(CategoryId)
    // categoryId: CategoryId

    // @ApiProperty({ name: 'stageId', enum: StageId })
    // @IsEnum(StageId)
    // stageId: StageId
}