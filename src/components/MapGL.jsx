import React from 'react'
import PropTypes from 'prop-types'
import { Map, NavigationControl, Popup } from 'bkoi-gl'
import _debounce from 'lodash.debounce'
import { bbox } from '@turf/turf'
import { MAP } from '../App.config'

class MapGL extends React.PureComponent {
  state = {
    container: 'map-' + Math.floor(Math.random() * 1000),
    center: [ 90.3938010872331, 23.821600277500405 ],
    zoom: 5,
    map: null,
    geojsonSourceId: 'geojson-source',
    geojsonLayerId: 'geojson-layer',
    renderedGeojson: null
  }

  componentDidMount() {
    // Create Map Instance
    this._createMap()    
  }

  componentDidUpdate(prevProps, prevState) {
    const { geojsonData, markerData } = this.props
    const { map } = this.state    

    // If map changes in state
    if(prevState.map !== map) {      
      
      // Render Geojson Layer
      this._renderGeojsonOnLoad(geojsonData)
    }

    // // If Geojson Data Changes
    // if (!_isEqual(prevProps.geojsonData, geojsonData)) {      
    //   // Render Geojson Layer
    //   this._renderGeojsonOnLoad(geojsonData, { fitBounds: !prevProps.geojsonData && geojsonData })
    // }

    // // If Marker Data Changes
    // if (!_isEqual(prevProps.markerData, markerData)) {
    //   // Render Markers
    //   this._renderMarkers(markerData, { fitBounds: !prevProps.markerData?.length && markerData.length })
    // }
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

  // Render Geojson
  _renderGeojson = (geojsonData, options={ fitBounds: true }) => {    
    const { map, geojsonSourceId, geojsonLayerId } = this.state

    // Remove Existing Geojson
    this._removeGeojson()

    if(!geojsonData) {
      return
    }

    // Add Geojson Source To Map
    map.addSource(geojsonSourceId, {
      type: 'geojson',
      data: geojsonData
    })

    // Add Geojson Layer To Map
    map.addLayer({
      'id': geojsonLayerId,
      'type': 'fill',
      'source': geojsonSourceId,
      'layout': {
        'visibility': 'visible',        
      },
      'paint': {
        'fill-color': '#00ff00',
        'fill-opacity': 0.2
      },
      'filter': [ '==', '$type', 'Polygon' ]
    })

    // Add Geojson Border Layer To Map
    map.addLayer({
      'id': geojsonLayerId + '-border',
      'type': 'line',
      'source': geojsonSourceId,
      'layout': {
        'visibility': 'visible',
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#008000',
        'line-width': 2
      },
      'filter': [ '==', '$type', 'Polygon' ]
    })

    map.addLayer({
      "id": geojsonLayerId + '-text',
      "type": "symbol",
      "source": geojsonSourceId,
      "layout": {
        "symbol-placement": "line-center",
        "text-font": ["Open Sans Regular"],
        "text-field": [
            'format',
            ['get', 'name'],
            { 'font-scale': 1.2 },
            '\n',
            {},
            ['get', 'name'],
            {
            'font-scale': 0.8,
            'text-font': [
            'literal',
            ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']
            ]
            }
        ],
        "text-size": 16,
        "text-rotate": -4,
        "symbol-spacing": 1,
      },
      "paint":{
        "text-translate":[0,-20],
      }
    });

    // Add Tooltip
    const popup = new Popup({ focusAfterOpen: false })
    map.on('mousemove', geojsonLayerId, e => {
      e.stopPropagation()
      popup.setLngLat(e.lngLat)
        .setHTML(
          `<strong style="margin-right: 4px;">District:</strong>
          ${ e.features[0].properties.name }`
        )
        .addTo(map)
    })

    map.on('mouseleave', geojsonLayerId, e => {
      e.stopPropagation()
      popup.remove()
    })

    // Fit Map Bounds
    if(options.fitBounds) {
      this._fitBounds(geojsonData, { dataType: 'geojson' })
    }

    this.setState({ renderedGeojson: geojsonData })
  }

  // Render GeoJSON without map on load
  _renderGeojsonOnLoad = (geojsonData, options={ fitBounds: true }) => {    
    const { map, geojsonSourceId, geojsonLayerId } = this.state
    
    // Remove Existing Geojson
    this._removeGeojson()

    if(!geojsonData) {
      return
    }

    map.on('load', () => {
      
      // Add Geojson Source To Map
      map.addSource(geojsonSourceId, {
        type: 'geojson',
        data: geojsonData
      })

      // Add Geojson Layer To Map
      map.addLayer({
        'id': geojsonLayerId,
        'type': 'fill',
        'source': geojsonSourceId,
        'layout': {
          'visibility': 'visible'
        },
        'paint': {
          'fill-color': [
              'match',
                ['get', 'status'],
                'Visited', 'yellow',
                'Not Visited', 'red', 'green'
          ],
          'fill-opacity': 0.2
        },
        'filter': [ '==', '$type', 'Polygon' ]
      })

      // Add Geojson Border Layer To Map
      map.addLayer({
        'id': geojsonLayerId + '-border',
        'type': 'line',
        'source': geojsonSourceId,
        'layout': {
          'visibility': 'visible',
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#362222',
          'line-width': 1.5
        },
        'filter': [ '==', '$type', 'Polygon' ]
      })

      // Add SND Name Text Layer To Map
      map.addLayer({
        'id': geojsonLayerId + '-text',
        'type': 'symbol',
        'source': geojsonSourceId,
        'layout': {
          'text-field': '{name}',
          'text-size': 14,          
        },
        'paint': {
          'text-color': '#270082',          
        },
        'filter': [ '==', '$type', 'Polygon' ]
      })

      // Add Tooltip
      const popup = new Popup({ focusAfterOpen: false })    

    map.on('mousemove', geojsonLayerId, e => {          
        popup.setLngLat(e.lngLat)
        .setHTML(
            `<div>
                <strong style="margin-right: 4px;">District:</strong> ${ e.features[0].properties.name } <br/>
                <strong style="margin-right: 4px;">Status:</strong> ${ e.features[0].properties.status } <br/>
            </div>`
        )
        .addTo(map)
    })

    map.on('mouseleave', geojsonLayerId, e => {          
        popup.remove()
    })

      // Fit Map Bounds
      if(options.fitBounds) {
        this._fitBounds(geojsonData, { dataType: 'geojson' })
      }
    })

    this.setState({ renderedGeojson: geojsonData })
  }

  // Remove Geojson
  _removeGeojson = () => {
    const { map, geojsonSourceId, geojsonLayerId, renderedGeojson } = this.state

    if(!renderedGeojson) {
      return
    }

    // Remove Geojson Layer
    if(map.getLayer(geojsonLayerId + '-border')) {
      map.removeLayer(geojsonLayerId + '-border')
    }

    if(map.getLayer(geojsonLayerId)) {
      map.removeLayer(geojsonLayerId)
    }

    // Remove Geojson Source
    if(map.getSource(geojsonSourceId)) {
      map.removeSource(geojsonSourceId)
    }

    this.setState({ renderedGeojson: null })
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