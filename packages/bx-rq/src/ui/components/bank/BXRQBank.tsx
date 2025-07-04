import React, { FC, useState } from 'react';
import { BankRq } from '../../../type/evs-rq-type';
import '../address/BXRQAddress.scss'
import BXRQIcon from '../common/BXRQIcon';
import BXRQEdit from '../common/BXRQEdit';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { BXRQState } from '@/modules/bx-rq/model/bx-rq-reducer';
import { filterFieldItems, isFieldsEmpty } from '@/modules/bx-rq/lib/field-items-util';
import { saveBank } from '@/modules/bx-rq/model/bx-rq-thunk';
import { BXRQAC } from '@/modules/bx-rq/model/bx-rq-actions';


interface BXRQBank {
  bank: BankRq;
}
const BXRQBank: FC<BXRQBank> = ({
  bank
}) => {
  const setDone = (bankId: number) => dispatch(
    // BXRQAC.saveBankCreating(bankId)
    saveBank(bankId)
  )
  const setCancel = () => dispatch(
    BXRQAC.cancelBankCreating()
  )
  const dispatch = useAppDispatch()

  const bankItems = bank.items && bank.items.length ? bank.items : [bank.current]
  const creatingBank = useAppSelector(state => (state.bxrq as BXRQState).creating.bank)
  const seEditId = (bankId: number) => dispatch(
    BXRQAC.initBankCreating(bankId)
  )

  return (
    <>
      {bankItems.map(b => {
        const setProp = (code: string, value: string) => {

          dispatch(
            BXRQAC.setBankProp(b.id, code, value)
          )
        }

        const isEmpty = isFieldsEmpty(b.fields);

        return <div className='bxrq_address_item m-2 col-12 p-1'>
          <div className='address__header mb'>
            <p className={isEmpty ? 'address__type error' : 'address__type'}>

              Банковские реквизиты

            </p>
            {creatingBank && creatingBank.id == b.id && <BXRQEdit
              title={'Банковские реквизиты'}
              fields={creatingBank.fields}
              isActive={creatingBank.id == b.id}
              setProp={setProp}
              setCancel={setCancel}
              setDone={() => setDone(b.id)}
            />}

            <BXRQIcon
              isForEdit={!isEmpty}
              click={seEditId}
              data={b.id}
            />
          </div>
          <div className='bxrq_rq_content'>

            {
              !isEmpty && b.fields.map(f => {
                const value = f.value == 'null' || f.value == null ? '' : f.value
                const string = `${f.name} : ${value}`
                return <p className='address'>{string}</p>
              })
            }
          </div>
        </div>
      })
      }
    </>
  );
}

export default BXRQBank;