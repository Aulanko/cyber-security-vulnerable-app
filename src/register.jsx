import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


function Register() {
    const [username,setUsername]=useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault()
        
     
        fetch("http://localhost:3001/save-user", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        }).then(()=>{
          navigate("/")
        })
        
      
      
        
        alert("Data sent")
    }

    



  return (
    <div className="login-container">
      <h1>Rekisteröidy</h1>
      <form className='formi' onSubmit={handleSubmit}>
        <div className="input-group">
          <input onChange={(e)=> setUsername(e.target.value)} type="text" placeholder="Käyttäjätunnus" />
          <input onChange={(e)=> setEmail(e.target.value)} type="email" placeholder="Sähköposti" />
          <input onChange={(e)=> setPassword(e.target.value)} type="password" placeholder="Salasana" />
          <input type="password" placeholder="Vahvista salasana" />
        </div>
        <button type="submit" className="login-btn">Rekisteröidy</button>
        <Link to="/">
          <button type="button" className='login-btn'>Already have an account? Login</button>
        </Link>
      </form>
    </div>
  )
}

export default Register