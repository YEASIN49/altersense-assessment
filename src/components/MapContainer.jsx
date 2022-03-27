import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'

// Import Components
import MapGL from './MapGL'

// Import Actions
import { setSelectedDistrict } from '../store/dataReducer'

// Import GeoJSON
import Data from '../data.json'

// Parse and stringify data
const ParsedData = JSON.parse(JSON.stringify(Data))

class MapContainer extends React.PureComponent {
    state = {
        dataGeoJson: ParsedData,
        actions: [
            { name: 'All', value: 'all' },
            { name: 'Visited', value: 'Visited' },
            { name: 'Will Visit', value: 'Wish to visit' },
            { name: 'Currently Living In', value: 'Currently living in' }
        ],
        selectedAction: 'all',
        redirect: false
    }

    // Handle Status Change
    _handleStatusChange = (action) => {
        // Set Selected Action
        this.setState({ selectedAction: action.value })

        // If action value is not all, filter data
        if(action.value !== 'all') {
            // Filter data
            const selectedData = ParsedData.features.filter(item => item.properties.status === action.value)

            // Transform selected data to geojson
            const newData = {
                type: 'FeatureCollection',
                features: selectedData
            }

            // Update state
            this.setState({ dataGeoJson: newData })
        } else {
            // Update state with all data
            this.setState({ dataGeoJson: ParsedData })
        }
    }

    // Handle Map Click
    _handleMapClick = (e) => {
        const { dispatch } = this.props
        // Get clicked feature
        const clickedFeature = e.features[0].properties

        // Set Selected District in Redux
        dispatch( setSelectedDistrict(clickedFeature) )

        // Redirect to district details
        this.setState({ redirect: true })
    }
    render() {     
        const { dataGeoJson, actions, selectedAction, redirect } = this.state
        return (
            <div className='mapContainer'>
                <MapGL geojsonData={ dataGeoJson } handleMapClick={ this._handleMapClick } />
                <div className='actionContainer'>
                    <div className='actionBG'>
                        {
                            actions.map(action => (
                                <button
                                    key={ action.value }
                                    style={{
                                        backgroundColor: `${ selectedAction === action.value ? '#4D96FF' : '#eee' }`,
                                        color: `${ selectedAction === action.value ? '#fff' : '#000' }`,
                                        padding: '6px',
                                        borderRadius: '4px',
                                        border: `1px solid ${ selectedAction === action.value ? '#4D96FF' : '#eee' }`,
                                        margin: '0 5px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={ () => this._handleStatusChange(action) }
                                >
                                    { action.name }
                                </button>
                            ))
                        }
                    </div>                  
                </div>
                {
                    redirect && <Navigate to='/district-details' />
                }
            </div>
        )
    }
}

// PropTypes
MapContainer.propTypes = {
    dispatch: PropTypes.func,
}

MapContainer.defaultProps = {
    dispatch: () => null
}

const mapDispatchToProps = dispatch => ({ dispatch })

export default connect(null, mapDispatchToProps)(MapContainer)