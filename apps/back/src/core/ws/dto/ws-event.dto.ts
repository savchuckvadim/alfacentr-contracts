import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { WsEvents } from '../ws-events.enum';

export class WsEventDto {
    @IsString()
    event: WsEvents;

    @IsObject()
    data: any;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    dealId?: string;

    @IsOptional()
    @IsString()
    socketId?: string;

    @IsOptional()
    @IsString()
    room?: string;

    @IsOptional()
    @IsNumber()
    timestamp?: number;
}

export class WsEventContextDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    dealId?: string;

    @IsOptional()
    @IsString()
    socketId?: string;

    @IsOptional()
    @IsString()
    room?: string;
}

export class WsTaskResultDto {
    @IsString()
    success: boolean;

    @IsObject()
    result?: any;

    @IsOptional()
    @IsString()
    error?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsNumber()
    progress?: number;
}
