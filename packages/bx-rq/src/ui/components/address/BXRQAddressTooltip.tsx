import React, { FC, useState } from 'react';
import { Tooltip } from 'reactstrap';
import './BXRQAddress.scss';
import { useAppSelector } from '@/hooks/redux';

interface BXRQAddressTooltip {
    tooltipId: string; // ID тега, к которому привязан tooltip
    text: string; // Текст, который будет отображаться в тултипе
}
const BXRQAddressTooltip: FC<BXRQAddressTooltip> = ({
    tooltipId,
    text
}) => {

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const toggleTooltip = () => setTooltipOpen(!tooltipOpen);
    const colorClassName = useAppSelector(state => state.currentComplect?.className)

    return (
        <Tooltip
            innerClassName={'bxrq_tooltip'}
            color={'primary'}
            isOpen={tooltipOpen}
            target={tooltipId}
            toggle={toggleTooltip}
            placement="top" // Расположение тултипа (top, bottom, left, right)
        >
            {
                text
            }
        </Tooltip>
    );
}

export default BXRQAddressTooltip;