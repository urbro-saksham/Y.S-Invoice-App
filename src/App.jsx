import React from 'react'
import GeneratePDF from './GeneratePdf.jsx';
import AddBillData from './Adbilldata.jsx'; 
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<GeneratePDF />} />
      <Route path="/adddata" element={<AddBillData />} />
    </Routes>
  )
}

export default App