'use client';
import { Select, Tooltip } from "@/modules/shared";
import { useOwnBank } from "../lib/hooks/own-bank.hook";
import { MicroPreloader } from "@/modules/shared/Preloader/MicroPreloader";


export const OwnBankSelect = () => {
    const { ownBank, setCurrent } = useOwnBank();
    const options = ownBank.field.list.map(bank => ({
        bitrixId: bank.bitrixId,
        value: bank.code,
        label: bank.name,
        code: bank.code,
    }));
    const { isLoading, isFetched } = ownBank;
    if (isLoading || !isFetched) {
        return <MicroPreloader />;
    }
    return (
        <Tooltip content="Текущий банк">
            <Select
                className="w-[200px]"
                options={options}
                currentValue={ownBank.current?.code || ''}
                onValueChange={value => setCurrent(value)}
            />
        </Tooltip>
    );
};
