import React from 'react'
import {Routes , Route } from "react-router-dom"
import Header from './Components/Header'
import TransactionPage from './Pages/TransactionPage'
import UploadPage from './Pages/UploadPage'
import PayeePage from './Pages/PayeePage'
import SummaryPage from './Pages/SummaryPage'

const App = () => {
  return (
    <>
    <div className='min-h-screen bg-[#090d16] text-slate-100 font-outfit'>
      <Header/>
      <main>
        <Routes>
          <Route path="/" element={<TransactionPage/>}/>
          <Route path="/upload" element={<UploadPage/>}/>
          <Route path="/summary" element={<SummaryPage/>}/>
          <Route path="/payee" element={<PayeePage/>}/>
        </Routes>
      </main>
    </div>
    </>
  )
}

export default App
