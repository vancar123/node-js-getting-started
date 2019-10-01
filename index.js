const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const mongodb = require('mongodb').MongoClient;
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});


express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/cool', (req, res) => res.send(cool()))
    .get('/times', (req, res) => res.send(showTimes()))
    .get('/db', async (req, res) => {
        try {
            const client = await pool.connect()
            const result = await client.query('SELECT * FROM test_table');
            const results = { 'results': (result) ? result.rows : null};
            res.render('pages/db', results );
            client.release();
        } catch (err) {
            console.error(err);
            res.send("Error " + err);
        }
    })

    .get('/mongodb', function (request, response) {

    mongodb.connect(process.env.MONGODB_URI, function(err, client) {
        if(err) throw err;
        //get collection of routes
        var db = client.db("heroku_g9c8gpqf");
        var Routes = db.collection('Routes');
        //get all Routes with frequency >=1
        Routes.find({ frequency : { $gte: 0 } }).sort({ name: 1 }).toArray(function (err, docs) {
            if(err) throw err;

            response.render('pages/mongodb', {results: docs});

        });

        //close connection when your app is terminating.
        client.close(function (err) {
            if(err) throw err;
        })
    })//end of connect
})//end app.get
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

showTimes = () => {
    let result = ''
    const times = process.env.TIMES || 5
    for (i = 0; i < times; i++) {
        result += i + ' '
    }
    return result;
}


