import { IsBxHookUserId } from '@/core/decorators/dto/bx-hook-user-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class BxWebHookAuthDto {
    @ApiProperty({ description: 'Domain of the Bitrix24 portal' })
    @IsString()
    domain: string;
    // client_endpoint: 'https://dfgdfdfgdf.bitrix24.ru/rest/',
    // server_endpoint: 'https://oauth.bitrix24.tech/rest/',
    // member_id: 'd1dfgdfgdg3b26755ff2'
}

export class BxWebHookDto {
    @ApiProperty({ description: 'Authentication information' })
    @ValidateNested()
    @Type(() => BxWebHookAuthDto)
    auth: BxWebHookAuthDto;
}

export class BxQueryResponsibleIdDto {
    @ApiProperty({ description: 'Responsible ID' })
    @IsBxHookUserId()
    responsibleId: string;
}
