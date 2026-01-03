import './App.css'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Register from './register'
import { useState, useEffect } from 'react'
import Application from './application'

function App() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("")
      }, 5000) 
      
      
      return () => clearTimeout(timer)
    }
  }, [errorMessage])


  const handleSubmit = async(e) =>{
    e.preventDefault()
    setErrorMessage("")

    try{
       const res = await fetch("http://localhost:3001/login",{
        method: "POST",
        headers: {"Content-type":"application/json"},
        body:JSON.stringify({username, password}),
        credentials: 'include'

        

        })
        const data = await res.json()

        if(res.ok){
          navigate("/application")
        }
        else{
          setErrorMessage(data.message || "No error messge, login failed")
          console.error("Login failed:")
        }
      } 
    catch (error){
      console.log("error during login:",error)
      setErrorMessage("Network error. Please try again.")
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
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
          
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