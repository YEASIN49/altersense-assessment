import React from 'react'
import PropTypes from 'prop-types'
import { Map, NavigationControl, FullscreenControl } from 'bkoi-gl'
import _debounce from 'lodash.debounce'
import { bbox } from '@turf/turf'
import { MAP } from '../App.config'

class MapGL extends React.PureComponent {
  state = {
    container: 'map-' + Math.floor(Math.random() * 1000),
    center: [ 90.3938010872331, 23.821600277500405 ],
    zoom: 5,
    map: null,
  }

  componentDidMount() {
    // Create Map Instance
    this._createMap()    
  }

  componentWillUnmount() {    
    // Destroy Map Instance
    this._destroyMap()    
  }

  // Create Map
  _createMap = () => {
    const { container, center, zoom } = this.state

    const map = new Map({
      container,
      center,
      zoom,
      style: MAP.STYLES[0].uri,
      accessToken: MAP.ACCESS_TOKEN,
      attributionControl: false
    })

    // Add Controls
    map.addControl(new FullscreenControl(), 'top-right')
    map.addControl(new NavigationControl(), 'top-left')

    // Map Resize Event
    this._handleMapResize(map)

    // Disable Double Click Zoom
    map.doubleClickZoom.disable()

    this.setState({ map })
  }

  // Destroy Map
  _destroyMap = () => {
    const { map } = this.state

    // Remove Map Instance
    if(map) {
      map.remove()
      this.setState({ map: null, renderedMarkers: [] })
    }
  }

  // Fit Bounds
  _fitBounds = (data, options={ dataType: 'row-object' }) => {
    const { map } = this.state
    let ifFitBounds = true

    let geoJson = null
    if(options?.dataType === 'geojson') {
      geoJson = data

    } else {
      // To GeoJSON
      geoJson = {
        type: 'FeatureCollection',
        features: data.map(d => {
          if(d.recentOperation) {
            ifFitBounds = false
          }

          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [ d.longitude, d.latitude ]
            }
          }
        })
      }
    }

    // Fit Bounds
    if(ifFitBounds) {
      // Bounding Box
      const _bbox = bbox(geoJson)

      map.fitBounds(_bbox, { padding: 64, maxZoom: 18, animate: false })
    }
  }

  // Handle Map Resize
  _handleMapResize = map => {
    const { container } = this.state

    // Add Event Listeners
    const mapContainerElement = document.getElementById(container)
    if(mapContainerElement) {
      new ResizeObserver(_debounce(() => {
        if(map) {
          map.resize()
        }
      }, 10)).observe(mapContainerElement)
    }
  }

  render() {
    const { container } = this.state

    return (
      <div id={ container } style={ containerStyles } />
    )
  }
}

// JSS Styles
const containerStyles = {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100%',  
  overflow: 'hidden',
  borderRadius: '4px',
  flex: 1
}

// Prop Types
MapGL.propTypes = {
  geojsonData: PropTypes.object,
}

MapGL.defaultProps = {
  geojsonData: null,
}

export default MapGL