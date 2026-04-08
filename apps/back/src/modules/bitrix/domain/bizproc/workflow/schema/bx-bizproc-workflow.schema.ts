import { EBxMethod } from 'src/modules/bitrix/core';


export type BxBizprocWorkflowSchema = {
    [EBxMethod.START]: {
        request: {
            workflowId: string;
            parameters: Record<string, any>;
        };
        response: {
            result: boolean;
        };
    };
};
