import { BitrixActivityTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BitrixService } from '@/modules/bitrix/bitrix.service';
import { GetDealBidItemsUseCase } from '@/modules/on-deal-init/use-cases/get-deal-bid-items.use-case';
import { BitrixOwnerTypeId } from '@/modules/bitrix/domain/enums/bitrix-constants.enum';
import { BXActivityCommunication, IBXActivity } from '@/modules/bitrix/domain/activity/interfaces/bx-activity.interface';
import { EmployeeEdoService, IEmployeeEdoInfo } from '@/common/employee-edo/employee-edo.service';
import { randomUUID } from 'crypto';
import {
    renderBidHtml,
    renderDocumentLetterInnerHtml,
    renderEdoEmployeeHtml,
    wrapDocumentEmailHtml,
} from './html-components';

//документы в email
// юр лицо:
// Договор doc
//счет doc и pdf
// приложение 1  doc
// акт об оказании услуг doc

// физ лицо:
// Договор doc
// счет с QR doc и pdf
// приложение 1  doc
// акт об оказании услуг doc
const baseUrl = process.env.BASE_URL || 'https://alfacentr.bitrix24.ru/';

export class EmailServiceInitDto {
    filesForSend: [string, string][] = [];
    email: string;
    name: string;
    phone: string;
    subject: string;
    body: string;
    bid: string;
    userEmail: string;
}
export class EmailService {
    private bidService: GetDealBidItemsUseCase;

    private readonly employeeEdoInfo: IEmployeeEdoInfo;
    constructor(
        private readonly bitrix: BitrixService,
        private readonly filesForSend: [string, string][] = [],
        private readonly email: string,
        private readonly name: string,
        private readonly phone: string,
        private readonly documentPrefixNumber: string,
        private readonly dealId: number,
        private readonly companyName: string,
        private readonly userName: string = '',
        private readonly userId: string,
        private readonly contactId: number,
        private readonly edoComment: string,
    ) {
        this.bidService = new GetDealBidItemsUseCase(this.bitrix);
        const employeeEdoService = new EmployeeEdoService();

        this.employeeEdoInfo = employeeEdoService.getEmployeeEdoInfo();


    }

    async send() {

        const sendData = await this.getDataForSend(false);
        console.log('send for client sendData', sendData);
        await this.bitrix.activity.createActivity(sendData);

    }

    async sendForEdoEmployee() {
        const sendData = await this.getDataForSend(true);
        console.log('sendForEdoEmployee sendData', sendData);
        await this.bitrix.activity.createActivity(sendData);

    }

    private async getDataForSend(
        isForEdo: boolean = false,
    ): Promise<IBXActivity> {
        const uuid = randomUUID();
        console.log('uuid', uuid);
        const ownerType = isForEdo ? BitrixOwnerTypeId.CONTACT : BitrixOwnerTypeId.DEAL;
        const ownerId = isForEdo ? this.employeeEdoInfo.contactId : this.dealId;
        const contactId = isForEdo ? this.employeeEdoInfo.contactId : this.contactId;
        const subject = isForEdo
            ? `Документы на согласование Договор №${this.documentPrefixNumber} для сотрудника ЭДО "${this.employeeEdoInfo.name}" от ООО "Альфацентр"`
            : `Документы на согласование Договор №${this.documentPrefixNumber} от ООО "Альфацентр"`;

        const communication = {
            ENTITY_ID: contactId,
            ENTITY_TYPE_ID: 3, //CONTACT
            // TYPE_ID: 1,

            VALUE: isForEdo ? this.employeeEdoInfo.email : this.email,
        } as BXActivityCommunication;

        const employeeEdoName = isForEdo ? this.userName || this.employeeEdoInfo.name : this.employeeEdoInfo.name;
        const settings = {
            MESSAGE_FROM: `Альфацентр ${employeeEdoName} <no-reply@alfacentr.bitrix24.ru>`,


        };

        try {

            const body = isForEdo
                ? await this.getEmailHtmlBody(isForEdo)
                : await this.getClientEmailHtmlBody();

            const sendData = {

                OWNER_TYPE_ID: ownerType,
                OWNER_ID: ownerId,
                TYPE_ID: BitrixActivityTypeId.EMAIL,
                DIRECTION: 2, // 1 - incoming, 2 - outgoing
                RESPONSIBLE_ID: this.userId.toString(),

                SETTINGS: {
                    MESSAGE_FROM: settings.MESSAGE_FROM,
                },
                SUBJECT: subject,
                DESCRIPTION: body,
                COMPLETED: 'Y',
                DESCRIPTION_TYPE: 3, // HTML
                START_TIME: new Date().toISOString(),
                END_TIME: new Date(Date.now() + 3600).toISOString(),
                COMMUNICATIONS: [
                    communication
                ],
                FILES: this.filesForSend.map((file) => ({
                    fileData: file,
                })),
            } as IBXActivity;


            return sendData;
        } catch (error) {
            console.error('error', error);
            throw error;
        }
    }
    async getClientEmailHtmlBody(): Promise<string> {
        const bid = await this.getBidHtml();
        const inner = renderDocumentLetterInnerHtml({
            bidHtml: bid,
            edoBlock: '',
            name: this.name,
            phone: this.phone,
        });
        return wrapDocumentEmailHtml({
            innerHtml: inner,
            bodyId: `email-body-${randomUUID()}`,
        });
    }

    async getEmailHtmlBody(
        includeEdoEmployee: boolean = false,
    ): Promise<string> {
        const bid = await this.getBidHtml();
        const edoEmployeeHtml = includeEdoEmployee
            ? await this.getEdoEmployeeHtmlComponent()
            : '';
        const inner = renderDocumentLetterInnerHtml({
            bidHtml: bid,
            edoBlock: edoEmployeeHtml,
            name: this.name,
            phone: this.phone,
        });
        return wrapDocumentEmailHtml({
            innerHtml: inner,
            bodyId: `email-body-${randomUUID()}`,
        });
    }

    private async getEdoEmployeeHtmlComponent(): Promise<string> {
        const dealUrl = await this.getDealUrl();
        return renderEdoEmployeeHtml({
            edoComment: this.edoComment,
            userName: this.userName,
            dealUrl,
            dealId: this.dealId,
            companyName: this.companyName,
        });
    }

    private async getDealUrl(): Promise<string> {
        return `${baseUrl}crm/deal/details/${this.dealId}/`;
    }
    private async getBidHtml(): Promise<string> {
        const bidData = await this.bidService.getItemsByParticipants(this.dealId);
        const bid = renderBidHtml(bidData);

        return bid;
    }
}
