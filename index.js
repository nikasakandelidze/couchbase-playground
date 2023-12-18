require('./storage/initBucket')
require('./storage/createIndex')

const express = require('express');
const bodyParser = require('body-parser')
const { connectToDatabase } = require('./storage');
const {v4} = require('uuid')
const dotenv = require('dotenv')

dotenv.config()


const app = express()
const port = 3000

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
    bodyParser.urlencoded({
        // to support URL-encoded bodies
        extended: true,
    })
);

app.post('/api/user', async (req, res) => {
    const { firstName, lastName, email } = req.body;

    if(!firstName || !lastName || !email){
        res.status(400).send({message: 'Missing required fields'});
        return;
    }

    const dbConnection = await connectToDatabase();

    const result = await dbConnection.userCollection.upsert(v4(), {firstName, lastName, email})

    res.send(result);
});

app.get('/api/user', async (req, res) => {
    const {cluster} = await connectToDatabase();
    try{
        const options = {
            parameters: {
                SKIP: Number(req.query.skip || 0),
                LIMIT: Number(req.query.limit || 5),
                SEARCH: `%${(req.query.search||"").toLowerCase()}%`
            }
        }

        const query = `
            SELECT u.*
            from ${process.env.CB_BUCKET}._default.users u
            where lower(u.firstName) LIKE $SEARCH OR lower(u.lastName) LIKE $SEARCH OR lower(u.email) LIKE $SEARCH
            LIMIT $LIMIT OFFSET $SKIP`
        
        const result = await cluster.query(query, options)

        res.send(result.rows);
    }catch(err){
        console.log(err);
        res.status(500).send({message: err.message});
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
