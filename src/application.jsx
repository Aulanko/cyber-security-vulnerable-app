import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './css/blog.css'


function Application(){
    const [title, setTitle] = useState("")
    const [text, setText] = useState("")
    const [blogs, setBlogs] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [secret, setSecret] = useState(true)
    const navigate = useNavigate()

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

    //original
     
    const fetchBlogs = async (username = null) => {
        try {
            let url = "http://localhost:3001/get-blogs"
            if (username) {
                url += `?username=${username}`
            }
            
            const response = await fetch(url)
            const data = await response.json()
            console.log("Received data:", data)
            setBlogs(data.blogs)
        } catch (error) {
            console.log("Error fetching blogs:", error)
        }
    }  
    
    //original
    
    useEffect(() => {
        
        const cookieData = getCookie("user-credentials")
        
        if (cookieData) {
            try {
                const parsedData = JSON.parse(cookieData)
                setCurrentUser(parsedData.username)
                console.log("Logged in as:", parsedData.username)
                console.log("Password in cookie:", parsedData.password) 
                
                const user = parsedData.username
                
                fetchBlogs(user)
                console.log("Received data:", data)

            } catch (error) {
                console.log("Error parsing cookie:", error)
            }
        }}, [])

    
        
    //fixed userEffect version:
    /*
    useEffect(() => {
        // username from the display uer cookie (not httpOnly)
        const username = getCookie("username")
        if (username) {
            setCurrentUser(username)
            //console.log("Logged in as:", username) // Leave password out of the logging
            
            fetchBlogs(username)
        } else {
            
            console.log("No user session found")
        }
    }, [])
    */
    
    

    //fixed blog fething.
    /*
    const fetchBlogs = async(username=null)=>{
        try{
            let url = "http://localhost:3001/get-blogs"
            if (username) {
                url += `?username=${username}`
            }
            const response = await fetch(url,{
                credentials:"include"
            })
            if(!response.ok){
                throw new Error("Error on the fetchBlogs function, response was not okay")
            }
            const data = await response.json()
            console.log("Received data:", data)

            if(data.blogs){
                setBlogs(data.blogs)

            }else if (data.message){
                console.log("message from server,", data.message)
            }

        }catch(error){
            console.log("Error fetching the blogs", error)
        }
    }
    */

    

    
    //original
    
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
                body: JSON.stringify({ title, text, username,secret })
            })
            
         
            fetchBlogs(username)
            
            
            setTitle("")
            setText("")

        }
        catch(error){
            console.log("error during posting a form", error)
        }} 

    

    //fixed handle submit:
    /*
    const handleSubmit = async(e) =>{
        e.preventDefault()
        
        
        let username = currentUser
        
        if (!username) {
            console.log("No user logged in")
            alert("Please login to post a blog") 
            return
        }

        // added basic validation
        if (!title.trim() || !text.trim()) {
            alert("Title and text are required")
            return
        }

        // prevent basic injection
        const sanitizedTitle = title.trim().replace(/[<>]/g, '') // Remove < and >
        const sanitizedText = text.trim().replace(/[<>]/g, '') // Remove < and >
        
        try {
            // Send request with credentials (includes httpOnly auth_token)
            const response = await fetch("http://localhost:3001/save-blog-post", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    
                },
                credentials: 'include', // sends cookies
                body: JSON.stringify({ 
                    title: sanitizedTitle, 
                    text: sanitizedText, 
                    username, 
                    secret 
                })
            })
            
            if (!response.ok) {
                if (response.status === 401) {
                    alert("Session expired. Please login again.")
                    
                    return
                }
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const result = await response.json()
            console.log("Blog saved:", result.message)
            
            // Refresh blogs
            fetchBlogs(username)
            
            // Clear form
            setTitle("")
            setText("")
            
        } catch(error) {
            console.log("Error during posting a form", error)
            alert("Failed to save blog. Please try again.")
        }
    }
    */
    
    const handleLogout = async(e) =>{
        try{
            await fetch("http://localhost:3001/logout",{
                method:"POST",
                credentials:"include"
            })
            setCurrentUser(null)
            setBlogs([])
            navigate("/")
        }catch(error){
            console.log("Error during logout", error)
        }
    }



    
    return(
        <div>
            <h1>Hello world, this is application</h1>
            <p>Logged in as: <strong>{currentUser || "Not logged in"}</strong></p>

            <div>
                {
                blogs.map((blog,index)=>{
                    return(
                    
                    <div className='blogDiv' key={index}>
                        <h3>title: {blog.title}</h3>
                        <h4>text: {blog.text}</h4>
                        <h5>made by: {blog.username}</h5>
                        <h6>secret? {blog.secret}</h6>
                    </div>
                )})}
            </div>

            <div>
                <h2>Create a post</h2>
                <form onSubmit={handleSubmit} className='blog-form' action="POST">
                    <h2>would this post be NOT visible for others?</h2>
                    <div className='secretdiv'>
                        <p>Yes?</p>
                        <input checked={secret} onChange={(e)=>setSecret(e.target.checked)} type='checkbox' placeholder='Is a secret'/>
                    </div>
                    
                    <input value={title} onChange={(e)=>{setTitle(e.target.value)}} placeholder='Title'/>
                    <input value={text} onChange={(e)=>{setText(e.target.value)}} id='textboxid' type='text' placeholder='input blog text here'/>
                    <button type='submit' className='publish-btn'>Publish</button>
                </form>
            </div>

           
            <button onClick={handleLogout} type="button" className='login-btn'>Logout</button>
           
        </div>
    )}




export default Application