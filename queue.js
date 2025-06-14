const {createClient } = require('redis')
const redisClient = createClient()

async function connectionRedis(){
    await redisClient.connect()
}
async function pushToRedis(data){

    await connectionRedis()
    console.log("queue msg "+data)
    await redisClient.lPush("contractDetails" , data)

}

module.exports = {
    pushToRedis,
    connectionRedis
}