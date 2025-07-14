import { RQ_TYPE } from "@workspace/bx-rq"
import { DocumentRqAgent } from "../model/slice/DocumentRqSlice"

export const PROVIDER_RQ_CONST = {
    companyName: 'ООО Альфацентр',
    fullname: 'Общество с ограниченной ответственностью "Альфацентр"',
    inn: 'providerRq.inn',
    kpp: 'providerRq.kpp',
    address: 'providerRq.address',
    phone: 'providerRq.phone',
    email: 'providerRq.email',
    bank: 'providerRq.bank',
    bik: 'providerRq.bik',
    rs: 'providerRq.rs',
    ks: 'providerRq.ks',
    providerCompanyDirectorPosition: 'providerRq.providerCompanyDirectorPosition',
    providerCompanyDirectorName: 'providerRq.providerCompanyDirectorName',
    based: 'устава'
}

export const Provider: DocumentRqAgent= {
    id: 0,
    name: PROVIDER_RQ_CONST.companyName,
    fullname: PROVIDER_RQ_CONST.fullname,
    inn: PROVIDER_RQ_CONST.inn,
    address: PROVIDER_RQ_CONST.address,
    phone: PROVIDER_RQ_CONST.phone,
    email: PROVIDER_RQ_CONST.email,
    bank: PROVIDER_RQ_CONST.bank,
    bik: PROVIDER_RQ_CONST.bik,
    rs: PROVIDER_RQ_CONST.rs,
    ks: PROVIDER_RQ_CONST.ks,
    based: PROVIDER_RQ_CONST.based,
    kpp: PROVIDER_RQ_CONST.kpp,
    type: RQ_TYPE.ORGANIZATION,
    providerCompanyDirectorPosition: PROVIDER_RQ_CONST.providerCompanyDirectorPosition,
    providerCompanyDirectorName: PROVIDER_RQ_CONST.providerCompanyDirectorName,
}

