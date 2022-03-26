import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import Styles
import './App.css'

// Import Components
import MapContainer from './components/MapContainer';

class App extends React.PureComponent {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MapContainer />} />
          <Route path='*' element={ <Navigate to='/' /> } />
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App
