const {connectToDatabase} = require('../storage')

const ensureIndexes = async() => {
    console.log("Initializing indexes for collections   ")
    const { cluster } = await connectToDatabase();
    
    const bucketIndex = `CREATE PRIMARY INDEX ON ${process.env.CB_BUCKET}`
    const userCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.users;`
    const mediaCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.media;`

    try {
        await cluster.query(bucketIndex)
        console.log(`Bucket Index Creation: SUCCESS`)
    } catch (err) {
        console.log(err.message)
    }
    
    try {
        await cluster.query(userCollectionIndex)
        await cluster.query(mediaCollectionIndex)
        console.log(`Collection Index Creation: SUCCESS`)
    } catch (err) {
        console.log(err.message)
    }
}

ensureIndexes()