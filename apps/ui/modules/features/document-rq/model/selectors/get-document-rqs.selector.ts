import { createSelector } from "@reduxjs/toolkit"
import { DocumentRqAgent } from "../slice/DocumentRqSlice"
import { getForDocumentItems } from "../../utils/document-rq.util"
import { RQ_TYPE } from "@workspace/bx-rq"
import { RootState } from "@/modules/app/model/store"

export const getDocumentRqs = createSelector(
    (state: RootState) => state.documentRq,
    (documentRq) => getForDocumentItems(documentRq.client as DocumentRqAgent<RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION>, documentRq.client?.type as RQ_TYPE.FIZ | RQ_TYPE.ORGANIZATION, documentRq.provider as DocumentRqAgent<RQ_TYPE.ORGANIZATION>)
)

export const getDocumentHeader = createSelector(
    (state: RootState) => state.documentRq,
    (documentRq) => documentRq.general.header
)