import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class DistrictDetails extends React.PureComponent {
    render() {
        const { districtDetails } = this.props
        return (
            <div className="districtDetailsContainer" >
                <h1>District Details</h1>
                <p>{ `Name: ${ districtDetails?.name }` }</p>
                <p>{ `Area: ${ districtDetails?.area }` }</p>
                <p>{ `Status: ${ districtDetails?.status }` }</p>
            </div>
        )
    }
}

// PropTypes
DistrictDetails.propTypes = {
    districtDetails: PropTypes.object
}

DistrictDetails.defaultProps = {
    districtDetails: {}
}

const mapStateToProps = state => ({
    districtDetails: state.data.selectedDistrict
})

const mapDispatchToProps = dispatch => ({ dispatch })

export default connect(mapStateToProps, mapDispatchToProps)(DistrictDetails)