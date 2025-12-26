const express = require('express')
const app = express()
const fs = require("fs")
const cookieParser = require("cookie-parser")
const PORT = 3001


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    
   
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    
    next()
})

app.use(express.json())
app.use(cookieParser())


app.get('/', (req, res) => {
    res.json({ 
        message: "Backend server is running!",
        timestamp: new Date().toISOString(),
        endpoints: [
            "POST /save-user - Register new user",
            "POST /login - Login user",
            "POST /save-blog-post - Save blog post",
            "GET /get-blogs - Get blogs (add ?username=USER to filter)"
        ]
    })
})


app.get('/test-cookies', (req, res) => {
    res.json({
        cookiesReceived: req.cookies,
        headers: req.headers,
        message: "Cookie test endpoint"
    })
})



app.post('/save-user', (req, res) => {
    console.log('Received user:', req.body)
    
    const user = req.body
    const { username, password } = req.body 
    
    //This is a great vulnerability. passwords are stored in plain text in a csv file,
    
    const csvLine = `${username},${user.email || ''},${password}\n`
    
    fs.appendFile("users.csv", csvLine, (err) => { 
        if (err) {
            console.error("Error saving user:", err)
            return res.status(500).json({ message: "Error saving user" })
        }
        res.json({ message: "Saved!" })
    })
})


//fixed version: 
/*
const bcrypt = require("bcrypt") //crypting libratry
const jswt = require("jsonwebtoken") // this gives a way to auth users without storing
// sessions to server
const SALT_ROUNDAS = 10 //define how slow the hasing process is.the more slow-> the more secure
const JWT_secreta = process.env.JWT_secreta || "put here " //A JWT secret is a private key,
//  used by your server to sign and verify JSON Web Tokens (JWTs).


app.post(('/save-user'), async(req, res) =>{
    const {username,email,password} = req.body
    try{
        const hashed_Passwrd = await bcrypt.hash(password, SALT_ROUNDAS)
        const csvLine = `${username},${email || ''},${hashed_Passwrd}\n`
        fs.appendFile("users.csv", csvLine, (err) => { 
        if (err) {
            console.error("Error saving user:", err)
            return res.status(500).json({ message: "Error saving user" })
        }
        res.json({ message: "User Saved!" })
    })
    }catch(error){
        console.log("Error hashing password;", error)
        return res.status(500).json({message:"Registration failed"})
    }
})
*/

app.post('/login', (req, res) => {
    console.log('Login attempt:', req.body) //passord should not be logged
    
    const { username, password } = req.body
    
    fs.readFile("users.csv", 'utf8', async(err, data) => {
        if (err) {
            console.log("No users file yet")
            return res.status(404).json({ success: false, message: "No users found" })
        }
        
        const lines = data.split('\n')
        let loginSuccess = false
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (!line.trim()) continue
            
            const parts = line.split(',')
            if (parts.length >= 3) {
                const fileUsername = parts[0].trim()
                const filePassword = parts[2].trim()
                
               

                
                //we also have a plain text password comparison, which is quite poor.
                if (fileUsername === username && filePassword === password) {
                    //storing password into session data -> huge no go. 
                    const sessionData = {
                        username: username,
                        password: password, //you can find a password in a cookie
                        loggedIn: true,
                        timestamp: new Date().toISOString()
                    }
                    loginSuccess = true
                    
                 
                    res.cookie("user-credentials", JSON.stringify(sessionData), {
                        httpOnly: false,
                        domain: 'localhost',
                        path: '/',
                        sameSite: 'Lax',
                        maxAge: 24*60*60*1000,  
                        
                    })
                    
                    console.log('Cookie set for user:', username)
                    break
                }
                
                

                //fixed login to check hashed passwords.
                /*
                hashedPassword = parts[2].trim()
                if(fileUsername ==username){
                    //using the bcrypt library for comparison
                    const passwordsMathc = await bcrypt.compare(password,hashedPassword)
                    if (passwordsMathc){
                        const token = jswt.sign(
                            {
                                username:username,
                                userID: i,

                            },
                            JWT_secreta,
                            {expiresIn:"24h"}
                        )
                        res.cookie("auth_token", token, {
                            httpOnly: true,  //lets add this to prevent XSS access
                            sameSite: 'Strict', //protects cookie being sent with cross site-requests
                            maxAge: 24*60*60*1000,
                        })

                        res.cookie("username", username, {
                            httpOnly: false, // Safe since it's just display data
                            sameSite: 'Strict',
                            maxAge: 24 * 60 * 60 * 1000,
                        })

                        console.log('Login successful for:', username)
                        return res.json({ 
                            success: true, 
                            message: "Login successful!",
                            user: username
                        })

                    }
                }
                    */
            }
        }
        
        if (loginSuccess) {
            res.json({ 
                success: true, 
                message: "Login successful!",
                cookiesSet: true,
                user: username
            })
        } else {
            res.status(401).json({ 
                success: false, 
                message: "Wrong username or password"
            })
        }
    })
})

app.post("/save-blog-post", (req, res) => {
    console.log("Received a blog:", req.body)
    
    const { title, text, username, secret } = req.body

    const secretValue = secret !== undefined ? secret : false
    
    const csvLine = `${username || 'anonymous'},${title},${text},${secretValue}\n`
    
    fs.appendFile("blogs.csv", csvLine, (err) => {
        if (err) {
            console.error("Error saving blog:", err)
            return res.status(500).json({ message: "Error saving blog" })
        }
        res.json({ message: "Blog saved!" })
    })
})

app.get("/get-blogs", (req, res) => {
    const requestedUsername = req.query.username
    console.log("requested, username:",requestedUsername)
    
    fs.readFile("blogs.csv", 'utf8', (err, data) => {
        if (err) {
            
            return res.json({ 
                blogs: [],
                message: "No blogs file yet"
            })
        }
        
        const lines = data.split('\n')
        const blogs = []
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (!line.trim()) continue
            
            const parts = line.split(',')
            if (parts.length >= 3) {
                const blogUsername = parts[0].trim()
                const title = parts[1].trim()
                const text = parts.slice(2, parts.length - 1).join(',').trim()
                const secret = parts[parts.length - 1].trim()
                
                if (secret=="false"||requestedUsername==blogUsername) {
                    blogs.push({
                        username: blogUsername,
                        title: title,
                        text: text,
                        id: i ,
                        secret:secret
                    })
                }
            }
        }
  
        res.json({ 
            blogs: blogs,
            totalBlogs: blogs.length,
            requestedUser: requestedUsername || 'all users',
            haavoittuvaisuus: "Change 'username' parameter to see other users blogs"
        })
    })
})

app.post("/logout", (req, res)=>{
    res.clearCookie("auth_token",{
        httpOnly:true,
        sameSite:"strict"
    })
    res.clearCookie("username",{
        httpOnly:true,
        sameSite:"strict"
    })
    res.json({
        success:true,
        message:"Logged out succesfully"
    })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Frontend should be at: http://localhost:5173`)
})


// Fix for: A02:2021 - Cryptographic Failures
