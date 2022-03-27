import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    selectedDistrict: null
}

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setSelectedDistrict: (state, action) => {
            state.selectedDistrict = action.payload
        }
    }
})

export const { setSelectedDistrict } = dataSlice.actions

export default dataSlice.reducer