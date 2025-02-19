import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Location from './components/Location'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Home from './Pages/home'
import './App.css'
import Story from './Pages/Story'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/location" element={<Location />} />
        <Route path="/story" element={<Story />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  )
}

export default App