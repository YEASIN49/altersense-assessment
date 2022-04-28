import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    selectedDistrict: null,
    currentFilter: {
        type: "FeatureCollection",
        features: [
            {
                "type": "Feature",
                "properties": {
                    "stroke": "#555555",
                    "stroke-width": 2,
                    "stroke-opacity": 1,
                    "fill": "#555555",
                    "fill-opacity": 0.5,
                    "Area": "Rupganj"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                0,
                                0
                            ]
                        ]
                    ]
                }
            }
        ]
    }
}

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setSelectedDistrict: (state, action) => {
            state.selectedDistrict = action.payload
        },
        setCurrentFilter: (state, action) => {
            state.currentFilter = action.payload
        }
    }
})

export const { setSelectedDistrict, setCurrentFilter } = dataSlice.actions

export default dataSlice.reducer