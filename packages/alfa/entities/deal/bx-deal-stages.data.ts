export const DEAL_CATEGORY_ID = 26
export const DEAL_ENTITY_ID = 'DEAL_STAGE_26'

export const BX_DEAL_STAGES_DATA = {
    NEW: {
        code: 'NEW',
        name: 'Новая',
        statusId: '#C26:NEW',
    },

    IN_PROGRESS: {
        code: 'IN_PROGRESS',
        name: 'Передать сотруднику',
        statusId: 'C26:PREPARATION',
    },

    DOCUMENTS: {
        code: 'DOCUMENTS',
        name: 'Документы',
        statusId: 'C26:PREPAYMENT_INVOIC',
    },

    EMAIL_SENT: {
        code: 'EMAIL_SENT',
        name: 'Email отправлен',
        statusId: 'C26:EXECUTING',
    },


    FINAL_INVOICE: {
        code: 'FINAL_INVOICE',
        name: 'Финальный инвойс',
        statusId: 'C26:FINAL_INVOICE',
    },

    WON: {
        code: 'WON',
        name: 'Выиграна',
        statusId: 'C26:WON',
    },

    LOSE: {
        code: 'LOSE',
        name: 'Проиграна',
        statusId: 'C26:LOSE',
    },
} as const;
