const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()

// Link to database
require("dotenv").config({ path: "./config/.env" })
const connectionString = process.env.DB_STRING
const PORT = process.env.PORT

MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('connected to database')
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')
        const cursor = db.collection('quotes').find()

        // Middlewares
        app.set('view engine', 'ejs')
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())
        app.use(express.static('public'))

        // ========================
        // Routes
        // ========================

        // Create
        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        // Read
        app.get('/', (req, res) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results })
                })
                .catch(error => console.error(error))
        })

        // Update
        app.put('/quotes', (req, res) => {
            quotesCollection.findOneAndUpdate(
                { name: 'Yoda' },
                { $set: { name: req.body.name,
                        quote: req.body.quote } },
                { upsert: true }
            )
                .then(result => {
                    res.json('Success')
                })
                .catch(error => console.error(error))
        })

        // Delete
        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
                { name: req.body.name }
            )
                .then(result => {
                    if (result.deletedCount === 0){
                        return res.json('No quote to delete.')
                    }
                    res.json("Deleted Darth Vader's quote.")
                })
                .catch(error => console.error(error))
        })

        // Listen
        app.listen(process.env.PORT, () => {
            console.log(`listening on port ${PORT}`)
        })
    })
    .catch(console.error)