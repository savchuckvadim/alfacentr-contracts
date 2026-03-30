import { Module } from '@nestjs/common';
import { BitrixActivityDomainModule } from './activity/activity.module';
import { BitrixDepartmentDomainModule } from './department/department.module';
import { BxCrmDomainModule } from './crm/bx-crm-domain.module';
import { BxCatalogDomainModule } from './catalog/bx-catalog.module';
import { UserFieldConfigModule } from './userfieldconfig';
import { BxRpaItemDomainModule } from './rpa/item/bx-rpa-item-domain.module';
import { BxFileDomainModule } from './file/bx-file.module';
import {
    BxDiskFileModule,
    BxDiskFolderModule,
    BxDiskStorageModule,
} from './disk';
import { BxUserDomainModule } from './user/bx-user.module';
@Module({
    imports: [
        BitrixActivityDomainModule,
        BitrixDepartmentDomainModule,
        BxCrmDomainModule,
        BxCatalogDomainModule,
        UserFieldConfigModule,
        BxRpaItemDomainModule,
        BxFileDomainModule,
        BxUserDomainModule,
        BxDiskFileModule,
        BxDiskFolderModule,
        BxDiskStorageModule,
    ],
    exports: [
        BitrixActivityDomainModule,
        BitrixDepartmentDomainModule,
        BxCrmDomainModule,
        BxCatalogDomainModule,
        UserFieldConfigModule,
        BxRpaItemDomainModule,
        BxFileDomainModule,
        BxUserDomainModule,
        BxDiskFileModule,
        BxDiskFolderModule,
        BxDiskStorageModule,
    ],
})
export class BitrixDomainModule {}
