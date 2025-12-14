import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './css/blog.css'


function Application(){
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [blogs, setBlogs] = useState([])
    const [currentUser, setCurrentUser] = useState(null)

    const getCookie = (name) => {
        const cookies = document.cookie.split('; ')
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=')
            if (cookieName === name) {
                return decodeURIComponent(cookieValue)
            }
        }
        return null
    }

    useEffect(() => {
        const cookieData = getCookie("user-credentials")
        if (cookieData) {
            try {
                const parsedData = JSON.parse(cookieData)
                setCurrentUser(parsedData.username)
                console.log("Logged in as:", parsedData.username)
                console.log("Password in cookie:", parsedData.password) 
                
                
                fetchBlogs(parsedData.username)
            } catch (error) {
                console.log("Error parsing cookie:", error)
            }
        }}, [])

    const fetchBlogs = async (username = null) => {
        try {
            let url = "http://localhost:3001/get-blogs"
            if (username) {
                url += `?username=${username}`
            }
            
            const response = await fetch(url)
            const data = await response.json()
            setBlogs(data.blogs)
        } catch (error) {
            console.log("Error fetching blogs:", error)
        }
    }

    
    

    const handleSubmit = async(e) =>{
        e.preventDefault()
        const cookieData = getCookie("user-credentials")
        let username = currentUser
        
        if (cookieData) {
            try {
                const parsedData = JSON.parse(cookieData)
                username = parsedData.username
            } catch (error) {
                console.log("Error parsing cookie for username")
            }
        }

        try{
            await fetch("http://localhost:3001/save-blog-post", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, text, username })
            })
            
         
            fetchBlogs(username)
            
            
            setTitle("")
            setText("")

        }
        catch(error){
            console.log("error during posting a form", error)
        }}

    
    return(
        <div>
            <h1>Hello world, this is application</h1>
            <p>Logged in as: <strong>{currentUser || "Not logged in"}</strong></p>

            <div>
                <h2>Create a post</h2>
                <form onSubmit={handleSubmit} className='blog-form' action="POST">
                    <input onChange={(e)=>{setTitle(e.target.value)}} placeholder='Title'/>
                    <input onChange={(e)=>{setText(e.target.value)}} id='textboxid' type='text' placeholder='input blog text here'/>
                    <button type='submit' className='publish-btn'>Publish</button>
                </form>
            </div>

            <Link to="/">
              <button type="button" className='login-btn'>back to login</button>
            </Link>
        </div>
    )}




export default Application