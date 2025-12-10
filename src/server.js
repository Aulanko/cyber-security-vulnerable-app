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
    const values = Object.values(user).join(',') + '\n'
    
 
    fs.appendFile("users.csv", user, () => {
        res.json({ message: "Saved!" })
    })
    app.route("/")
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})