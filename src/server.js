const express = require('express')
const app = express()
const fs = require("fs")
const PORT = 3001

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') 

    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
})

app.use(express.json())

app.post('/save-user', (req, res) => {
    console.log('Received user:', req.body)
    
    const user = req.body
    const {username, _ } = req.body

    const values = Object.values(user).join(',') + '\n'
    
 
    fs.appendFile("users.csv", user, () => {
        res.json({ message: "Saved!" })
    })
    app.route("/")
})


app.post('/login', (req, res) => {
    console.log('Login attempt:', req.body)
    
    const { username, password } = req.body
    
    fs.readFile("users.csv", 'utf8', (err, data) => {
        if (err) {
            console.log("No users file yet")
            return res.json({ success: false, message: "No users found" })
        }
        
        const lines = data.split('\n')
        
        let loginSuccess = false
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i]
            if (!line) continue
            
            const parts = line.split(',')
            if (parts.length >= 3) {
                const fileUsername = parts[0]
                const filePassword = parts[2] 
                
                if (fileUsername === username && filePassword === password) {
                    loginSuccess = true
                    break
                }
            }
        }
        
        if (loginSuccess) {
            res.json({ success: true, message: "Login successful!" })
        } else {
            res.json({ success: false, message: "Wrong username or password" })
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})