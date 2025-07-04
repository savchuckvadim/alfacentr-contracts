import { EvsRqItem, ResolvedRQType } from "../type/evs-rq-type";
import { RQ_TYPE } from "../type/input-type";

export const getResolvedType = (type: RQ_TYPE): ResolvedRQType => {
    return type === RQ_TYPE.BUDGET ? RQ_TYPE.ORGANIZATION : type;
  };

