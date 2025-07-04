import React, { FC, useEffect, useState } from 'react';
import AModal from '@/components/Common/AModal/AModal';
import './BXRQEdit.scss'
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { BXRQState } from '@/modules/bx-rq/model/bx-rq-reducer';
import { BXRQAC } from '@/modules/bx-rq/model/bx-rq-actions';

const BXRQErrors: FC<{ isActive: boolean }> = ({
  isActive

}) => {

  const errors = useAppSelector(state => (state.bxrq as BXRQState).push.reqired)
  // const [isCurrentActive, setIsActive] = useState(isActive)
  const dispatch = useAppDispatch()
  const setIsActive = () => dispatch(
    BXRQAC.setReqired([])
  )
  return (
    <AModal
      title={'В реквизитах не заполнены обязательные поля'}
      isActive={isActive}
      isLoading={false}
      setDone={() => setIsActive()}
      setCancel={() => setIsActive()}
      buttonCancelName='Понятно'
      withoutDone={true}

    >
      <div className="bxrq_edit_content col-12">
        <div className="bxrq_require_errors col-12 p-2">
          {errors.map(err => <p className='error mb-1'>{err}</p>)}

        </div>
      </div>
    </AModal>
  );
}

export default BXRQErrors;