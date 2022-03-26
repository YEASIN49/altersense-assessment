import React from 'react'

// Import Components
import MapGL from './MapGL'

class MapContainer extends React.PureComponent {
    render() {      
        return (
            <div className='mapContainer'>
                <MapGL />
            </div>
        )
    }
}

export default MapContainer