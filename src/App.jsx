import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import Register from './register'
import { useState } from 'react'
import Application from './application'

function App() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")


  const handleSubmit = (e) =>{
    e.preventDefault()
    

  }

  return (
    <Routes>
      <Route path="/" element={  
        <div className="login-container">
          <h1>Kirjaudu sisään</h1>
          <form onSubmit={handleSubmit} className='formi'>
            <div className="input-group">
              <input onChange={(e)=>setUsername(e.target.value)} type="text" placeholder="Käyttäjätunnus" />
              <input onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Salasana" />
            </div>
            <Link to="/application">
              <button type="submit" className="login-btn">Kirjaudu</button>
            </Link>
            <Link to="/register">
              <button type="button" className='login-btn'>Register account</button>
            </Link>
          </form>
        </div>
      } />
      <Route path="/register" element={<Register />} />
      <Route path='/application' element={<Application />} />
    </Routes>
  )
}

export default App