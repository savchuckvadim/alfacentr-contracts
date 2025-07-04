import React, { FC } from 'react';
import { RqItem, SelectItem } from '@/redux/reducers/document/contract/type/document-contract-type';
import AModal from '@/components/Common/AModal/AModal';
import './BXRQEdit.scss'
import { useAppSelector } from '@/hooks/redux';
import { BXRQState } from '@/modules/bx-rq/model/bx-rq-reducer';
import AInput from '@/components/Common/Inputs/Input/AInput';

interface BXRQEdit {
  title: string;
  fields: RqItem[];
  isActive: boolean;
  setProp: (code: string, value: string) => void;
  setCase?: (code: string, value: string) => void;
  setDone: () => void;
  setCancel: (value: boolean) => void;

}
const BXRQEdit: FC<BXRQEdit> = ({
  title,
  fields,
  isActive,
  setProp,
  setCase,
  setDone,
  setCancel
}) => {



  const onChangeInput = (
    rqItem: RqItem,
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,

  ) => {
    setProp(rqItem.code, e.target.value);
  }

  const onBlurCase = (
    code: string,
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (setCase) {
      if (code === 'director' || 'position') {
        setCase(
          code, e.target.value
        )

      }
    }

  }

  const isLoading = useAppSelector(state => (state.bxrq as BXRQState).isCreatingLoading)
  const errors = useAppSelector(state => (state.bxrq as BXRQState).errors)
  
  return (
    <AModal
      title={title}
      isActive={isActive}
      isLoading={isLoading}
      setDone={setDone}
      setCancel={setCancel}
    >
      <div className="bxrq_edit_content col-12">

        {fields.map((rqItem: RqItem) => <AInput
          errors={errors}
          width={12}
          margin={2}
          rqItem={rqItem}
          onChange={onChangeInput}
          onBlur={onBlurCase}
          setSelectValue={(parentCode: "type", item: SelectItem) =>
            console.log('rq select')
          }
          key={`doc-card-cntrct-rq-${rqItem.group}-${rqItem.code}`}
        />)
        }
      </div>
    </AModal>
  );
}

export default BXRQEdit;