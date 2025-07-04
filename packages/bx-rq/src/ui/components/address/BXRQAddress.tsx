import React, { FC, useState } from 'react';
import { AddressRqItem } from '../../../type/evs-rq-type';
import './BXRQAddress.scss'
import BXRQEdit from '../common/BXRQEdit';
import BXRQIcon from '../common/BXRQIcon';
import { isFieldsEmpty } from '@/modules/bx-rq/lib/field-items-util';
import {  BXRQState } from '@/modules/bx-rq/model/bx-rq-reducer';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import AFIcon, { AICON } from '@/components/Common/AFIcon/AFIcon';
import { BX_ADDRESS_TYPE } from '@/modules/bx-rq/type/evs-address-type';
import BXRQAddressTooltip from './BXRQAddressTooltip';
import { saveAddress } from '@/modules/bx-rq/model/bx-rq-thunk';
import { RQ_TYPE } from '@/redux/reducers/document/contract/type/document-contract-type';
import { BXRQAC } from '@/modules/bx-rq/model/bx-rq-actions';

interface BXRQAddressProps {
  currentClientType: RQ_TYPE;

  addresses: AddressRqItem[];

}
const BXRQAddress: FC<BXRQAddressProps> = ({
  currentClientType,
  addresses
}) => {
  // const [editId, seEditId] = useState(-2)
  const dispatch = useAppDispatch()

  const creatingAddress = useAppSelector(state => (state.bxrq as BXRQState).creating.address)

  const onChange = () => {
    console.log('onChange')
    // dispatch(contractPropChange(rqItem, value));
  }
  const setSelectValue = () => {
    console.log('setSelectValue')
    // dispatch(contractPropChange(rqItem, value));
  }
  const setEdit = (typeId: BX_ADDRESS_TYPE) => {

    dispatch(

      BXRQAC.initAddressCreating(typeId)

    )
  }
  const setInitCopy = (typeId: BX_ADDRESS_TYPE) => {

    dispatch(
      BXRQAC.initCopyAddressCreating(typeId)

    )
  }


  const setCancel = () => {

    dispatch(
      BXRQAC.cancelAddressCreating()

    )
  }
  // const setEdit = () => console.log('setCancel');


  return (
    <>
      {addresses.map((address, index) => {

        const isEmpty = isFieldsEmpty(address.fields);
        const otherIsFull = addresses.some((otherAddress, otherIndex) =>
          otherIndex !== index && !isFieldsEmpty(otherAddress.fields)
        );
        const setProp = (code: string, value: string) => {

          dispatch(
            BXRQAC.setAddressProp(address.type_id, code, value)
          )
        }
        const setDone = () => dispatch(
          // BXRQAC.saveAddressCreating(address.type_id)
          saveAddress(currentClientType, address.type_id)

        )
        const tooltipId = `icon_tooltip_${address.anchor_id}_${address.type_id}`
        const toolTiptext = address.type_id === BX_ADDRESS_TYPE.PRIMARY
          ? "Скопировать адрес из Юридического"
          : "Скопировать адрес из Фактического"


        return <div className='bxrq_address_item m-2 col-12 p-1'>
          <div className='address__header mb'>
            <p className={isEmpty ? 'address__type error' : 'address__type'}>{
              address.name_type
            }
            </p>
            {creatingAddress && creatingAddress.type_id == address.type_id && <BXRQEdit
              title={creatingAddress.name_type}
              fields={creatingAddress.fields}
              isActive={creatingAddress && creatingAddress.type_id == address.type_id}
              setProp={setProp}
              setCancel={setCancel}
              setDone={setDone}
            />
            }
            <div className='bxrq_address_icons_block'>
              {otherIsFull && <div className='bxrq_address_icon_tooltip' id={tooltipId}>
                <AFIcon
                  id={tooltipId} // Уникальный идентификатор для тултипа
                  type={AICON.DONE}
                  click={setInitCopy}
                  width={12}
                  data={address.type_id}
                />
                {
                  otherIsFull && <BXRQAddressTooltip
                    tooltipId={tooltipId}
                    text={toolTiptext}

                  />
                }

              </div>

              }
              <BXRQIcon
                isForEdit={!isEmpty}
                click={setEdit}
                data={address.type_id}
              />
            </div>


          </div>
          <div className='bxrq_rq_content'>

            {
              !isEmpty && address.fields.map(f => {
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

export default BXRQAddress;