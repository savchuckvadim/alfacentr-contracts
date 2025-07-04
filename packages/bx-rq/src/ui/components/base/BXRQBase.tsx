import React, { FC, useState } from 'react';
import { EvsRqItem } from '../../../type/evs-rq-type';
import '../address/BXRQAddress.scss'
import { RQ_TYPE, RqItem } from '@/redux/reducers/document/contract/type/document-contract-type';
import BXRQIcon from '../common/BXRQIcon';
import BXRQEdit from '../common/BXRQEdit';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {  BXRQState } from '@/modules/bx-rq/model/bx-rq-reducer';
import { CONTRACT_LTYPE } from '@/types/contract-type';
import { SupplyTypesType } from '@/types/supply-type';
import { filterFieldItems } from '@/modules/bx-rq/lib/field-items-util';
import { blurCase, saveBXRQ, setBaseProp } from '@/modules/bx-rq/model/bx-rq-thunk';
import { BXRQAC } from '@/modules/bx-rq/model/bx-rq-actions';


interface BXRQBase {

    rq: EvsRqItem;
    fields: RqItem[];
    isEmpty: boolean;
    creatingRq?: EvsRqItem | null;
    currentClientType: RQ_TYPE;
    contractType: CONTRACT_LTYPE;
    supplyType: SupplyTypesType;



}
const BXRQBase: FC<BXRQBase> = ({
    rq,
    fields,
    isEmpty,
    currentClientType,
    contractType,
    supplyType,

}) => {
    const [editId, seEditId] = useState(-2)
    const creatingRq = useAppSelector(state => (state.bxrq as BXRQState).creating.base)
    const dispatch = useAppDispatch()
    const setProp = (code: string, value: string) => dispatch(
        setBaseProp(code, value)
    )
    const setDone = () => dispatch(
        // BXRQAC.saveBaseCreating()
        saveBXRQ(currentClientType,
            contractType,
            supplyType)
    )

    const setCancel = () => dispatch(
        BXRQAC.cancelBaseCreating()
    )
    const initCreating = () => dispatch(
        BXRQAC.initBaseCreating(
            currentClientType,
            contractType,
            supplyType
        )
    )

    const onBlurCase = (
        code: string, value: string
    ) => {
        if (code === 'director' || 'position') {
            dispatch(
                blurCase(
                    code, value
                )
            )
        }
    }
    return (
        <>
            <div className='bxrq_address_item m-2 col-12 p-1'>
                <div className='address__header mb'>
                    <p className='address__type '>{
                        'Реквизиты'
                    }
                    </p>
                    {creatingRq && creatingRq.bx_id == rq.bx_id && <BXRQEdit
                        title={'Основная информация'}
                        fields={
                            filterFieldItems(creatingRq.fields,
                                currentClientType,
                                contractType,
                                supplyType,
                            )}
                        isActive={creatingRq && creatingRq.bx_id == rq.bx_id}
                        setCancel={setCancel}
                        setDone={setDone}
                        setProp={setProp}
                        setCase={onBlurCase}


                    />}
                    <BXRQIcon
                        isForEdit={!isEmpty}
                        click={initCreating}
                    />
                </div>
                <div className='bxrq_rq_content'>
                    {
                        !isEmpty ? fields.map(f => {
                            const value = f.value == 'null' || f.value == null ? '' : f.value
                            const string = `${f.name} : ${value}`
                            return <p className='address'>{string}</p>
                        })
                            : <p className='address'>{
                                'Реквизиты отсутствуют'
                            }</p>
                    }
                </div>


            </div>

        </>
    );
}

export default BXRQBase;