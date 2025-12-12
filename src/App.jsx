import './App.css'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Register from './register'
import { useState } from 'react'
import Application from './application'

function App() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()


  const handleSubmit = async(e) =>{
    e.preventDefault()
    try{
       const res = await fetch("http://localhost:3001/login",{
        method: "POST",
        headers: {"Content-type":"application/json"},
        body:JSON.stringify({username, password})

        

        })
        if(res.ok){
          navigate("/application")
        }
        else{
          console.error("Login failed:", error)
        }
      } 
    catch (error){
      console.log("error during login",error)
    }



    

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
          
            <button type="submit" className="login-btn">Kirjaudu</button>
            
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