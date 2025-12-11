import { Link, useNavigate } from 'react-router-dom'

function Application(){

    return(
        <div>
            <h1>Hello world, this is application</h1>

            

            <Link to="/">
              <button type="button" className='login-btn'>back to login</button>
            </Link>
        </div>
    )
}


export default Application