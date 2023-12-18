const qs = require('qs')
const axios =require('axios')
const dotenv = require('dotenv')
dotenv.config()


var username = process.env.CB_USER
var password = process.env.CB_PASS
var auth = `Basic ${Buffer.from(username + ':' + password).toString('base64')}`

const restCreateBucket = async() => {
  const data = { name: process.env.CB_BUCKET, ramQuotaMB: 150 }
  await axios({
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'Authorization': auth },
    data: qs.stringify(data),
    url: 'http://127.0.0.1:8091/pools/default/buckets',
  })
  .catch((error) => {
    if (error.response === undefined) {
      console.error("Error Creating Bucket:", error.code);
      if (error.code === 'ECONNREFUSED') {
        console.info("\tIf you are using a Capella cluster, you'll have to create a \`user_profile`\ bucket manually. See README for details.\n")
      }
    } else if (error.response.data.errors && error.response.data.errors.name) {
      console.error("Error Creating Bucket:", error.response.data.errors.name, "\n");
    } else if (error.response.data.errors && error.response.data.errors.ramQuota) {
      console.error("Error Creating Bucket:", error.response.data.errors.ramQuota);
      console.log("Try deleting other buckets or increasing cluster size. \n");
    } else if (error.response.data.errors) {
      console.error("Error Creating Bucket: ");
      console.error(error.response.data.errors, "\n");
    } else {
      console.error("Error Creating Bucket:", error.message);
    }
  })
}

const restCreateCollection = async(name) => {
  const data = { name }
  await axios({
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'Authorization': auth },
    data: qs.stringify(data),
    url: `http://127.0.0.1:8091/pools/default/buckets/${process.env.CB_BUCKET}/scopes/_default/collections`
  })
  .catch((error) => {
    if (error.response === undefined) {
      console.error("Error Creating Collection:", error.code);
      if (error.code === 'ECONNREFUSED') {
        console.info("\tIf you are using a Capella cluster, you'll have to create a \`profile`\ scope on the \`user_profile\` bucket manually. See README for details.\n")
      }
    } else if (error.response.status === 404) {
      console.error(`Error Creating Collection: bucket \'${COUCHBASE_BUCKET}\' not found. \n`)
    } else {
      console.log(`Collection may already exist: ${error.message} \n`)
    }
  })
}

const initializeBucketAndCollection = async() => {
  await restCreateBucket()
  await restCreateCollection('users')
  await restCreateCollection('media')
  console.log("## initiaize db script end ##")
}

initializeBucketAndCollection()