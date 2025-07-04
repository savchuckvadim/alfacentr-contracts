import AFIcon, { AICON } from '@/components/Common/AFIcon/AFIcon';
import React, { FC } from 'react';

interface BXRQIcon {
    isForEdit: boolean;  // true: есть адрес, false: нет адреса
    click: (data: any) => void;
    data?: any;
}
const BXRQIcon: FC<BXRQIcon> = ({
    isForEdit,
    click, 
    data

}) => {
    return <>
        {isForEdit ? <AFIcon
            type={AICON.EDIT}
            click={click}
            width={12}
            data={data}
        />
            : <> <AFIcon
                type={AICON.CREATE}
                click={click}
                width={12}
                data={data}
            />
            </>
        }
    </>
}

export default BXRQIcon;