import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AlfaParticipantSmartItemUserFieldsEnum, BxParticipantsDataKeys, IParticipant } from "@alfa/entities";
import { handleSliceError } from "@/modules/app/lib/thunk-error-handler";
import { addParticipant, deleteParticipant, fetchParticipants, updateParticipant } from "./ParticipantThunk";

export type IParticipantState = {
    items: IParticipant[]
    editable: IParticipant | null
    loading: boolean
    editLoading: boolean
    error: null | string
}
const initialState = {
    items: [] as IParticipant[],
    editable: null as IParticipant | null,
    loading: false,
    editLoading: false,
    error: null as null | string
}

const participantSlice = createSlice({
    name: 'participant',
    initialState,
    reducers: {
        setParticipants: (state, action: PayloadAction<IParticipant[]>) => {

            state.items = action.payload
        },
        setEditable: (state, action: PayloadAction<IParticipant | null>) => {
            state.editable = action.payload
        },
        activateEditable: (state, action: PayloadAction<{ participantId: number }>) => {
            const searchedParticipant = state.items.find(p => p.id === action.payload.participantId)
            if (!searchedParticipant) return
            const spread = {
                ...searchedParticipant,
                fields: searchedParticipant.fields.map(f => ({ ...f }))
            }
            state.editable = spread
        },
        cancelEditable: (state) => {
            state.editable = null
        },
        changeEditable: (state, action: PayloadAction<{
            fieldCode: BxParticipantsDataKeys
            value: string
        }>) => {
            const pay = action.payload
            state.editable?.fields.map(fld => {
                if (fld.code === pay.fieldCode) {
                    fld.value = pay.value
                }
            })
        },
        changeParticipant: (state, action: PayloadAction<{
            participantId: number
            fieldCode: BxParticipantsDataKeys
            value: string
        }>) => {
            const pay = action.payload
            state.items.map(participant => {
                if (participant.id === pay.participantId) {

                    participant.fields.map(fld => {
                        if (fld.code === pay.fieldCode) {
                            fld.value = pay.value
                        }
                    })
                }
            })

        },

        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchParticipants.pending, (state: IParticipantState) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(fetchParticipants.fulfilled, (state: IParticipantState, action: PayloadAction<IParticipant[]>) => {
            state.items = action.payload
            state.loading = false
            state.error = null
        })
        builder.addCase(fetchParticipants.rejected, (state: IParticipantState, action) => {
            state.loading = false
            state.error = handleSliceError(action, 'Ошибка загрузки участников')
        })
        builder.addCase(updateParticipant.fulfilled, (state: IParticipantState, action: PayloadAction<IParticipant>) => {
            const items = state.items.map(item => item.id === action.payload.id ? action.payload : item)
            
            state.items = items
            state.editLoading = false
            state.editable = null
            state.error = null
        })
        builder.addCase(updateParticipant.pending, (state: IParticipantState) => {
            state.editLoading = true
            state.error = null
        })
        builder.addCase(updateParticipant.rejected, (state: IParticipantState, action) => {
            state.editLoading = false
            state.error = handleSliceError(action, 'Ошибка обновления участника')
        })
        builder.addCase(deleteParticipant.fulfilled, (state: IParticipantState, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload)
            state.editLoading = false
            state.error = null
        })
        builder.addCase(deleteParticipant.pending, (state: IParticipantState) => {
            state.editLoading = true
            state.error = null
        })
        builder.addCase(deleteParticipant.rejected, (state: IParticipantState, action) => {
            state.editLoading = false
            state.error = handleSliceError(action, 'Ошибка удаления участника')
        })
        builder.addCase(addParticipant.fulfilled, (state: IParticipantState, action: PayloadAction<IParticipant>) => {
            state.items.push(action.payload)
            state.editLoading = false
            state.error = null
        })
        builder.addCase(addParticipant.pending, (state: IParticipantState) => {
            state.editLoading = true
            state.error = null
        })
        builder.addCase(addParticipant.rejected, (state: IParticipantState, action) => {
            state.editLoading = false
            state.error = handleSliceError(action, 'Ошибка добавления участника')
        })
    }
})

export const {
    setParticipants,
    setEditable,
    // updateParticipant: updateParticipantAction,
    // removeParticipant,
    activateEditable,
    cancelEditable,
    changeEditable,


    clearError
} = participantSlice.actions
export const participantReducer = participantSlice.reducer