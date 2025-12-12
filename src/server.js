const express = require('express')
const app = express()
const fs = require("fs")
const PORT = 3001

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*') 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS') // Add this
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
})

app.use(express.json())

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
                    loginSuccess = true
                    break
                }
            }
        }
        
        if (loginSuccess) {
            res.json({ success: true, message: "Login successful!" })
        } else {
            res.status(401).json({ success: false, message: "Wrong username or password" })
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})