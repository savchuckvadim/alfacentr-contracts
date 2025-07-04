import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { FC, useEffect, useState } from "react"
import { EvsRqItem } from "../../type/evs-rq-type"

const BXRQSelect: FC<{
    name: string,
    code: string,
    values: EvsRqItem[],
    current: EvsRqItem,
    size?: 'small' | 'medium' | 'large',
    selectCallback: (code: string, value: EvsRqItem) => void,
    isError: boolean,
    cleanError: () => void,
}> = ({ name, code, values, current, size, selectCallback, isError, cleanError }) => {



    const [currentValue, setCurrentValue] = useState(current)

    const handleChange = (element: EvsRqItem) => {
        selectCallback(code, element)
    }


    useEffect(() => {

        setCurrentValue(current)
    }, [current])


    return (
        <FormControl fullWidth size={'small'} error={isError}>
            <InputLabel
                id="select-label"
            // htmlFor={`select`}
            >
                {name ? name.slice(0, 25) + "..." : name}
            </InputLabel>
            <Select
                labelId="select-label"
                id="select-rq"

                // value={values && values[0] && values[0].fields[0].code}
                value={current.bx_id}
                label={'реквизиты'}
            // onChange={handleChange}
            >
                {values.map((v, i) => {
                    const value = v.fields[0].code
                    const showName = v.fields[0].value.toString().slice(0, 25) + "..."

                    return <MenuItem
                        key={`common-select-item-${i}`}
                        value={v.bx_id}
                        onClick={() => {
                            handleChange(v)
                        }}
                    >{showName}</MenuItem>

                })}

            </Select>
        </FormControl>
    )
}


export default BXRQSelect