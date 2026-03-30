import { Injectable } from '@nestjs/common';

export interface IEmployeeEdoInfo {
    id: string;
    name: string;
    email: string;
    contactId: string;
}
@Injectable()
export class EmployeeEdoService {
    private readonly employeeEdoId: string;
    private readonly employeeEdoName: string;
    private readonly employeeEdoEmail: string;
    private readonly employeeContactId: string;
    constructor() {
        this.employeeEdoId = process.env.EMPLOYEE_EDO_ID || '';
        this.employeeEdoName = process.env.EMPLOYEE_EDO_NAME || '';
        this.employeeEdoEmail = process.env.EMPLOYEE_EDO_EMAIL || '';
        this.employeeContactId = process.env.EMPLOYEE_CONTACT_ID || '';
    }

    public getEmployeeEdoId(): string {
        return this.employeeEdoId;
    }

    public getEmployeeEdoName(): string {
        return this.employeeEdoName;
    }

    public getEmployeeEdoEmail(): string {
        return this.employeeEdoEmail;
    }
    public getEmployeeContactId(): string {
        return this.employeeContactId;
    }
    public getEmployeeEdoInfo(): IEmployeeEdoInfo {
        return {
            id: this.employeeEdoId,
            name: this.employeeEdoName,
            email: this.employeeEdoEmail,
            contactId: this.employeeContactId,
        } as IEmployeeEdoInfo;
    }
}
