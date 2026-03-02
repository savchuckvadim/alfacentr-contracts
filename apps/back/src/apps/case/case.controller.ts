import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CaseService } from './case.service';
import {
    CaseDeclineRequestDto,
    CaseDeclineResponseDto,
} from './dto/case-decline.dto';

@ApiTags('Склонение')
@Controller('case')
export class CaseController {
    constructor(private readonly caseService: CaseService) {}

    @Post('')
    @ApiOperation({
        summary: 'Склоняет текст по словам',
        description:
            'Принимает текст, разбивает на слова и склоняет каждое слово в родительный падеж',
    })
    async caseDecline(
        @Body() body: CaseDeclineRequestDto,
    ): Promise<CaseDeclineResponseDto> {
        const declinedText = this.caseService.declineText(body.value);
        return {
            case: declinedText,
        };
    }
}
