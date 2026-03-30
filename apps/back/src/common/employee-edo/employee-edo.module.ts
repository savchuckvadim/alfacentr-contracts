import { Module } from '@nestjs/common';
import { EmployeeEdoService } from './employee-edo.service';

@Module({
    providers: [EmployeeEdoService],
    exports: [EmployeeEdoService],
})
export class EmployeeEdoModule {}
