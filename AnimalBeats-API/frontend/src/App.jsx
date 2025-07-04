import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './componentes/Home';
import './App.css'

function App() {
  const [User, setUser] = useState(null)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!User ? <Home /> : <Navigate to={User.rol === '1' ? '/admin' : (User.rol === '2' ? '/veterinario' : '/cliente')} />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
