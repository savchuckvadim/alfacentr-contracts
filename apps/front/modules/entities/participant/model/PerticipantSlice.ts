import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IParticipant } from "@alfa/entities";
import { fetchParticipants } from "./ParticipantThunk";
import { handleSliceError } from "@/modules/app/lib/thunk-error-handler";

export type IParticipantState = {
    items: IParticipant[]
    editable: IParticipant | null
    loading: boolean
    error: null | string
}
const initialState = {
    items: [] as IParticipant[],
    editable: null as IParticipant | null,
    loading: false,
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
        updateParticipant: (state, action: PayloadAction<IParticipant>) => {
            const index = state.items.findIndex(item => item.id === action.payload.id)
            if (index !== -1) {
                state.items[index] = action.payload
            }
        },
        removeParticipant: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload)
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
    }
})

export const {
    setParticipants,
    setEditable,
    updateParticipant,
    removeParticipant,
    clearError
} = participantSlice.actions
export const participantReducer = participantSlice.reducer