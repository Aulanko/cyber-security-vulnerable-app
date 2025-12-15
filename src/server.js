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
        message: "Backend server is running! ✅",
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
    
    const csvLine = `${username},${user.email || ''},${password}\n`
    
    fs.appendFile("users.csv", csvLine, (err) => { 
        if (err) {
            console.error("Error saving user:", err)
            return res.status(500).json({ message: "Error saving user" })
        }
        res.json({ message: "Saved!" })
    })
})

app.post('/login', (req, res) => {
    console.log('Login attempt:', req.body)
    
    const { username, password } = req.body
    
    fs.readFile("users.csv", 'utf8', (err, data) => {
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
                
                if (fileUsername === username && filePassword === password) {
                    const sessionData = {
                        username: username,
                        password: password,
                        loggedIn: true,
                        timestamp: new Date().toISOString()
                    }
                    loginSuccess = true
                    
                 
                    res.cookie("user-credentials", JSON.stringify(sessionData), {
                        httpOnly: false,
                        domain: 'localhost',
                        path: '/',
                        sameSite: 'Lax',
                        maxAge: 24 * 60 * 60 * 1000, 
                        
                    })
                    
                    console.log('Cookie set for user:', username)
                    break
                }
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
                const text = parts[2].trim()
                const secret = parts[3]? parts[3].trim():"false"
                
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

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`)
    console.log(`✅ Test by visiting: http://localhost:${PORT}`)
    console.log(`✅ Frontend should be at: http://localhost:5173`)
})