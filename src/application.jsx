import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './css/blog.css'

const getCookie = (name) => {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

function Application(){
    const [title,setTitle] = useState("")
    const [text, setText] = useState("")
    const cookieData = getCookie("user-credentials");
    let username = null;

    if(cookieData){
        try {
            const parsedData = JSON.parse(cookieData);
            username = parsedData.username;
        }catch (error) {
            console.log("Error parsing cookie:", error);
            }
        }
    

    const handleSubmit = async(e) =>{
        e.preventDefault()
        try{
            await fetch("http://localhost:3001/save-blog-post", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, text, username })
            })

        }
        catch(error){
            console.log("error during posting a form", error)
        }}

    
    return(
        <div>
            <h1>Hello world, this is application</h1>

            <div>
                <h2>Create a post</h2>
                <form onSubmit={handleSubmit} className='blog-form' action="POST">
                    <input placeholder='Title'/>
                    <input id='textboxid' type='text' placeholder='input blog text here'/>
                    <button type='submit' className='publish-btn'>Publish</button>
                </form>
            </div>

            <Link to="/">
              <button type="button" className='login-btn'>back to login</button>
            </Link>
        </div>
    )}



export default Application