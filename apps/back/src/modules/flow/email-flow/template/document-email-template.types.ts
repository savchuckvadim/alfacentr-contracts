export interface EdoEmployeeProps {
    dealUrl: string;
    edoComment: string;
    userName: string;
    dealId: number;
    companyName: string;
}

export interface DocumentEmailTemplateProps {
    name: string;
    phone: string;
    bidHtml?: string;
    edoEmployee?: EdoEmployeeProps;
}
