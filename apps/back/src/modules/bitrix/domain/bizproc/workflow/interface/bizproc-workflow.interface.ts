type LeadDocumentId = ['crm', 'CCrmDocumentLead', `LEAD_${number}`];
type CompanyDocumentId = ['crm', 'CCrmDocumentCompany', `COMPANY_${number}`];
type ContactDocumentId = ['crm', 'CCrmDocumentContact', `CONTACT_${number}`];
type DealDocumentId = ['crm', 'CCrmDocumentDeal', `DEAL_${number}`];
type DiskFileDocumentId = ['disk', 'Bitrix\\Disk\\BizProcDocument', `${number}`];
type FeedDocumentId = ['lists', 'BizprocDocument', `${number}`];
type ListsDocumentId = [
    'lists',
    'Bitrix\\Lists\\BizprocDocumentLists',
    `${number}`,
];
type DynamicDocumentId = [
    'crm',
    'Bitrix\\Crm\\Integration\\BizProc\\Document\\Dynamic',
    `DYNAMIC_${number}_${number}`,
];
type SmartInvoiceDocumentId = [
    'crm',
    'Bitrix\\Crm\\Integration\\BizProc\\Document\\SmartInvoice',
    `SMART_INVOICE_${number}`,
];

export type BxWorkflowDocumentId =
    | LeadDocumentId
    | CompanyDocumentId
    | ContactDocumentId
    | DealDocumentId
    | DiskFileDocumentId
    | FeedDocumentId
    | ListsDocumentId
    | DynamicDocumentId
    | SmartInvoiceDocumentId;

export interface IBXBizprocWorkflow {
    TEMPLATE_ID: number;
    DOCUMENT_ID: BxWorkflowDocumentId;
    PARAMETERS?: Record<string, unknown>;
}


// DOCUMENT_ID*
// array

// Идентификатор документа для запуска бизнес-процесса в формате [модуль, объект, ID_элемента].

// Примеры записей для разных вариантов документов:

// Лид — ['crm', 'CCrmDocumentLead', 'LEAD_777']
// Компания — ['crm', 'CCrmDocumentCompany', 'COMPANY_777']
// Контакт — ['crm', 'CCrmDocumentContact', 'CONTACT_777']
// Сделка — ['crm', 'CCrmDocumentDeal', 'DEAL_777']
// Файл диска — ['disk', 'Bitrix\\Disk\\BizProcDocument', '777']
// Документ процессов в ленте новостей — ['lists', 'BizprocDocument', '777']
// Документ списков — ['lists', 'Bitrix\\Lists\\BizprocDocumentLists', '777']
// Элемент смарт-процесса — ['crm', 'Bitrix\\Crm\\Integration\\BizProc\\Document\\Dynamic', 'DYNAMIC_147_1'], где 147 — это ID смарт-процесса, 1 — ID элемента смарт-процесса
// Счет — ['crm', 'Bitrix\\Crm\\Integration\\BizProc\\Document\\SmartInvoice', 'SMART_INVOICE_3']
