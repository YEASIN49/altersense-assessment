import React from 'react'

// Import Components
import MapGL from './MapGL'

// Import GeoJSON
import Data from '../data.json'

// Parse and stringify data
const DataGeoJson = JSON.parse(JSON.stringify(Data))

class MapContainer extends React.PureComponent {
    render() {     
        console.log({ DataGeoJson })
        return (
            <div className='mapContainer'>
                <MapGL geojsonData={ DataGeoJson }  />
            </div>
        )
    }
}

export default MapContainer