import { EBxNamespace } from '../consts/bitrix-api.enum';
import { EBXEntity } from '../consts/bitrix-entities.enum';
import {
    BxCatalogSchema,
    BxListSchema,
    BxRpaItemSchema,
    TimelineItemSchema,
    UserFieldConfigSchema,
} from '@/modules/bitrix/';
import {
    CompanySchema,
    ContactSchema,
    DealSchema,
    ProductRowSchema,
    FieldsSchema,
    FieldsEnumerationSchema,
    BxCategorySchema,
    BxStatusSchema,
    BxItemSchema,
    TimelineCommentSchema,
} from 'src/modules/bitrix/';

import { TasksSchema } from 'src/modules/bitrix/domain/tasks/bx-tasks.schema';
import { ActivitySchema } from 'src/modules/bitrix/domain/activity/bx-activity.schema';
import {
    BxDiskFileSchema,
    BxDiskFolderSchema,
    BxDiskStorageSchema,
} from 'src/modules/bitrix/domain/disk';

import { BxSmartTypeSchema } from '@/modules/bitrix/domain/crm/smart-type';
import { UserSchema } from '@/modules/bitrix/domain/user';
// import { FieldsEnumerationSchema } from "src/modules/bitrix/domain/crm";

export type BXApiSchema = {
    [EBxNamespace.CRM]: {
        [EBXEntity.DEAL]: DealSchema;
        [EBXEntity.COMPANY]: CompanySchema;
        [EBXEntity.CONTACT]: ContactSchema;
        [EBXEntity.USER_FIELD]: FieldsSchema;
        [EBXEntity.USER_FIELD_ENUMERATION]: FieldsEnumerationSchema;
        [EBXEntity.ACTIVITY]: ActivitySchema;
        [EBXEntity.CATEGORY]: BxCategorySchema;
        [EBXEntity.STATUS]: BxStatusSchema;
        [EBXEntity.ITEM]: BxItemSchema;
        [EBXEntity.TIMELINE_COMMENT]: TimelineCommentSchema;
        [EBXEntity.TIMELINE_ITEM]: TimelineItemSchema;
        [EBXEntity.TYPE]: BxSmartTypeSchema;
    };
    [EBxNamespace.RPA]: {
        [EBXEntity.ITEM]: BxRpaItemSchema;
    };
    [EBxNamespace.TASKS]: {
        [EBXEntity.TASK]: TasksSchema;
    };
    [EBxNamespace.CRM_ITEM]: {
        [EBXEntity.PRODUCT_ROW]: ProductRowSchema;
    };
    [EBxNamespace.DISK]: {
        [EBXEntity.FILE]: BxDiskFileSchema;
        [EBXEntity.FOLDER]: BxDiskFolderSchema;
        [EBXEntity.STORAGE]: BxDiskStorageSchema;
    };

    [EBxNamespace.WITHOUT_NAMESPACE]: {
        [EBXEntity.LISTS]: BxListSchema;
        [EBXEntity.USER_FIELD_CONFIG]: UserFieldConfigSchema;
        [EBXEntity.USER]: UserSchema;
    };
    [EBxNamespace.CATALOG]: {
        [EBXEntity.PRODUCT]: BxCatalogSchema;
    };
};
