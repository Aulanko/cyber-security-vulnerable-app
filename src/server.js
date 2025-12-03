const express = require('express')
const app = express()
const PORT = 3001

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173') 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
})

app.use(express.json())


app.get('/', (req, res) => {
    res.send('Server is working!')
})


app.post('/save-user', (req, res) => {
    console.log('Received user:', req.body)
    res.json({ message: 'User received!', data: req.body })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})