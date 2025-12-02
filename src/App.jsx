import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './register';  

function App() {
  return (
    <Router> 
      <Routes>
        <Route path="/" element={  
          <div className="login-container">
            <h1>Kirjaudu sisään</h1>
            <form className='formi'>
              <div className="input-group">
                <input type="text" placeholder="Käyttäjätunnus" />
                <input type="password" placeholder="Salasana" />
              </div>
              <button type="submit" className="login-btn">Kirjaudu</button>
              <Link to="/register">
                <button type="button" className='login-btn'>Register account</button>
              </Link>
            </form>
          </div>
        } />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>  
  )
}

export default App;