import React from 'react'
import PropTypes from 'prop-types'
import { Map, NavigationControl, Popup } from 'bkoi-gl'
import _isEqual from 'fast-deep-equal'
import _debounce from 'lodash.debounce'
import { bbox } from '@turf/turf'
import { MAP } from '../App.config'

import newData from '../ashulia-kaundia.json'

// Redux
import { connect } from 'react-redux';
import {setCurrentFilter} from '../store/dataReducer'



const currentFilter = [
    { name: 'area', label: 'area' },
    { name: 'sub-area', label: 'sub-area' },
  ]


class Filter extends React.PureComponent {
   constructor(props){
       super(props)
       this.state = {
         parsedGeoJsonData: {},
         nextToLoad: currentFilter[0].name, // district then=> area then => sub-area,
         currentLoadedPlace: {
             type: 'district',
             name: 'Dhaka'
         },
         currentDropdownElement: []  
       }
       this.filterPlace = this.filterPlace.bind(this)
       this.filterArea = this.filterArea.bind(this)

   } 

  componentDidMount(){
    const parsedData = JSON.parse(JSON.stringify(newData))

    const dropdownList = []

        // Loading initila dropdownlist for Dhaka District    
        const initialDataToLoad = parsedData.features.filter(element => {
            if(element.properties.area && element.properties.root === 'Dhaka'){
                dropdownList.push(element)
            }
        })
    

    this.setState({
        parsedGeoJsonData: parsedData,
        currentDropdownElement: dropdownList
    })
    


  }
    componentDidUpdate(prevProps, prevState){
        console.log(this.state)
        const parsedData = JSON.parse(JSON.stringify(newData))

       
        

    }

    filterPlace(){
        const {parsedGeoJsonData} = this.state; 
        const { dispatch } = this.props;
    
        const initialDataToLoad = parsedGeoJsonData.features.filter(element => {
            if(element.properties.area && element.properties.root === this.state.currentDropdownElement.name){ 
                return element
            }
        })
        // reformatted the geojson data 
        const initialFullDataToLoad = {
            type: "FeatureCollection",
            features: [
                initialDataToLoad[0]
            ]
        }
        this.setState({
            initialDataToLoad: initialFullDataToLoad
        })
        dispatch(setCurrentFilter(initialFullDataToLoad))
    }
    


    filterArea(event){
        // const {parsedGeoJsonData} = this.state; 
        const parsedData = JSON.parse(JSON.stringify(newData))
        const { dispatch } = this.props;
        const selectedArea = event.target.value;
        


        const dataToLoad = parsedData.features.filter(element => {
            if(element.properties.area && element.properties.root === this.state.currentLoadedPlace.name){
                return element
            }
        })

        // reformatted the geojson data 
        const fullStructuredDataToLoad = {
            type: "FeatureCollection",
            features: [
                dataToLoad[0]
            ]
        }

        this.setState({
            parsedGeoJsonData: fullStructuredDataToLoad,
            currentLoadedPlace: {
                type: dataToLoad[0].properties.hasOwnProperty('area') ? 'area' : 'sub-area',
                name: dataToLoad[0].properties.hasOwnProperty('area') ? dataToLoad[0].properties.area : dataToLoad[0].properties.Plot
            },
            nextToLoad: dataToLoad[0].properties.hasOwnProperty('area') ? 'sub-area' : ''
        })
        dispatch(setCurrentFilter(fullStructuredDataToLoad))
    }



  
  render() {
    const { container } = this.state
    // const dropdownList = []

    // if(this.state.parsedGeoJsonData.features && this.state.currentLoadedPlace.type === 'district'){
    //     const initialDataToLoad = this.state.parsedGeoJsonData.features.filter(element => {
    //         if(element.properties.area && element.properties.root === this.state.currentLoadedPlace.name){
    //             dropdownList.push(`<option value={element.properties.area}>{element.properties.area}</option>`)
    //         }
    //     })
    // }

    return (
      <div style={{position: 'absolute', zIndex: "10", right: '0', height: '100vh',width: '300px', backgroundColor: '#323f4d', color: 'white'}}>
             {/* TEST */}
             {/* <button onClick={this.filterPlace}>Render Area</button> */}
            <br />
                {
                    this.state.nextToLoad &&
                    <label htmlFor='place'>Choose new {this.state.nextToLoad}:</label>
                }

                <select onChange={this.filterArea} name="places" id="places">
                    <option>None</option>
                    {   
                        this.state.currentDropdownElement.map(item => {
                            return  <option  key={item.properties.area} value={item.properties.area}>{item.properties.area}</option>
                        })
                    }
                    {/* <option value="volvo">Volvo</option>
                    <option value="saab">Saab</option>
                    <option value="mercedes">Mercedes</option>
                    <option value="audi">Audi</option> */}
                </select>

      </div>
    )
  }
}


// Prop Types
Filter.propTypes = {
  geojsonData: PropTypes.object,
}

Filter.defaultProps = {
  geojsonData: null,
}




// const mapStateToProps = (state) => {
//    console.log('+++++++++++++');
//    console.log(state?.mapData?.points ?? [])
//    return {}
// }


const mapStateToProps = (state) => ({
    currentFilter: state?.data?.currentFilter ?? {},
})


const mapDispatchToProps = dispatch => ({ dispatch })

export default connect(mapStateToProps, mapDispatchToProps)(Filter);