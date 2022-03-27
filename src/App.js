import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import Styles
import './App.css'

// Import Components
import MapContainer from './components/MapContainer';
import DistrictDetails from './components/DistrictDetails';

class App extends React.PureComponent {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MapContainer />} />
          <Route path='*' element={ <Navigate to='/' /> } />
          <Route path='/district-details' element={<DistrictDetails />} />
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App
