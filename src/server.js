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



//original 
/*
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
*/

//fixed version: 

const bcrypt = require("bcrypt") //crypting libratry
const jwt = require("jsonwebtoken") // this gives a way to auth users without storing
// sessions to server
const SALT_ROUNDAS = 10 //define how slow the hasing process is.the more slow-> the more secure
const JWT_SECRET = process.env.JWT_secreta || "put here " //A JWT secret is a private key,
const rateLimit = require('express-rate-limit') 
//  used by your server to sign and verify JSON Web Tokens (JWTs).

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // timewindow 15 minutes
  max: 5, // Limit each IP to 5 login attempts per timewindow
  message: { 
    success: false, 
    message: "Too many login attempts. Please try again after 15 minutes." 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
})

const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    })
  }
}


//original
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

//improved save-user route:
app.post('/save-user', async (req, res) => {
    // ADD: Input validation (A03/A08 fix)
    const { username, email, password } = req.body
    
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" })
    }
    
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" })
    }
    
    if (username.includes(',') || username.includes('\n')) {
        return res.status(400).json({ message: "Username cannot contain commas or newlines" })
    }
    
   
    console.log('Registration attempt for user:', username)
    
    try {
        
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDAS)
        
        
        const escapeCSV = (str) => {
            if (str == null) return ''
            const escaped = String(str).replace(/"/g, '""')
            if (escaped.search(/[,\n"]/) >= 0) {
                return `"${escaped}"`
            }
            return escaped
        }
        
        const csvLine = `${escapeCSV(username)},${escapeCSV(email || '')},${hashedPassword}\n`
        
        fs.appendFile("users.csv", csvLine, (err) => { 
            if (err) {
                console.error("Error saving user:", err)
                return res.status(500).json({ message: "Error saving user" })
            }
            res.json({ message: "User saved successfully!" })
        })
    } catch(error) {
        console.error("Error hashing password:", error)
        return res.status(500).json({ message: "Registration failed" })
    }
})


//original:
/*
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
                
               

                //original
                //we also have a plain text password comparison, which is quite poor.
                //comment from here out to the next stop to get the working version -->
                /*
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
                }  //put the end comment here <--
                  
                
                

                
                 
                    
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
}) */

//fixed login:
app.post('/login', loginLimiter, async (req, res) => {
    // No more logging passwords
    const { username, password } = req.body
    console.log('Login attempt for user:', username)
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Username and password are required" 
        })
    }
    
    fs.readFile("users.csv", 'utf8', async (err, data) => {
        if (err) {
            console.log("No users file yet")
            return res.status(404).json({ success: false, message: "No users found" })
        }
        
        const lines = data.split('\n')
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (!line.trim()) continue
            
            // Parse CSV with proper escaping
            const parts = []
            let inQuotes = false
            let currentPart = ''
            
            for (let char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes
                } else if (char === ',' && !inQuotes) {
                    parts.push(currentPart)
                    currentPart = ''
                } else {
                    currentPart += char
                }
            }
            parts.push(currentPart)
            
            if (parts.length >= 3) {
                const fileUsername = parts[0].replace(/"/g, '').trim()
                const hashedPassword = parts[2].replace(/"/g, '').trim()
                
                if (fileUsername === username) {
                    try {
                        const passwordMatch = await bcrypt.compare(password, hashedPassword)
                        if (passwordMatch) {
                            // FIX: Use JWT instead of credentials in cookie (A07 fix)
                            const token = jwt.sign(
                                {
                                    username: username,
                                    userID: i,
                                },
                                JWT_SECRET,
                                { expiresIn: "24h" }
                            )
                            
                            // Set secure cookies
                            res.cookie("auth_token", token, {
                                httpOnly: true,  // Prevent XSS access
                                secure: false,   // Set to true in production with HTTPS
                                sameSite: 'Strict',
                                maxAge: 24 * 60 * 60 * 1000,
                            })
                            
                            res.cookie("username", username, {
                                httpOnly: false, // Safe for display
                                secure: false,
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
                    } catch (compareError) {
                        console.error("Error comparing passwords:", compareError)
                    }
                }
            }
        }
        
        res.status(401).json({ 
            success: false, 
            message: "Wrong username or password"
        })
    })
})



//original
/*
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
}) */


//fixed save-blog-post.
app.post("/save-blog-post", authenticate, (req, res) => {
    // Get username from JWT, not from request body
    const username = req.user.username
    const { title, text, secret } = req.body
    
    
    if (!title || !text) {
        return res.status(400).json({ message: "Title and text are required" })
    }
    
    if (title.length > 200 || text.length > 5000) {
        return res.status(400).json({ message: "Title or text too long" })
    }
    
    console.log("Blog post from user:", username)
    
   
    const escapeCSV = (str) => {
        if (str == null) return ''
        const escaped = String(str).replace(/"/g, '""')
        if (escaped.search(/[,\n"]/) >= 0) {
            return `"${escaped}"`
        }
        return escaped
    }
    
    const secretValue = secret !== undefined ? secret : false
    const csvLine = `${escapeCSV(username)},${escapeCSV(title)},${escapeCSV(text)},${secretValue}\n`
    
    fs.appendFile("blogs.csv", csvLine, (err) => {
        if (err) {
            console.error("Error saving blog:", err)
            return res.status(500).json({ message: "Error saving blog" })
        }
        res.json({ message: "Blog saved!" })
    })
})



//original
/*
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
*/

//fixed get-blogs
app.get("/get-blogs", authenticate, (req, res) => {
    const requestedUsername = req.query.username
    const loggedInUser = req.user.username
    
    console.log("Blog request from:", loggedInUser, "requesting:", requestedUsername)
    
   
    if (requestedUsername && requestedUsername !== loggedInUser) {
        return res.status(403).json({ 
            success: false, 
            message: "Cannot access other users' private blogs"
        })
    }
    
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
            
           
            const parts = []
            let inQuotes = false
            let currentPart = ''
            
            for (let char of line) {
                if (char === '"') {
                    inQuotes = !inQuotes
                } else if (char === ',' && !inQuotes) {
                    parts.push(currentPart)
                    currentPart = ''
                } else {
                    currentPart += char
                }
            }
            parts.push(currentPart)
            
            if (parts.length >= 4) {
                const blogUsername = parts[0].replace(/"/g, '').trim()
                const title = parts[1].replace(/"/g, '').trim()
                const text = parts[2].replace(/"/g, '').trim()
                const secret = parts[3].replace(/"/g, '').trim()
                
                
                if (secret === "false" || blogUsername === loggedInUser) {
                    blogs.push({
                        username: blogUsername,
                        title: title,
                        text: text,
                        id: i,
                        secret: secret
                    })
                }
            }
        }
  
        res.json({ 
            blogs: blogs,
            totalBlogs: blogs.length,
            user: loggedInUser
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




