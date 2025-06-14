const connectionRedis = require('./queue')
const redisClient = createClient()



(
    async ()=>{
        await redisClient.connect()
  
        while(1){
            const msg = await redisClient.brPop("contractDetails" , 0)
            if(msg){
                
                const data = JSON.parse(msg.data)
                console.log("workder data "+data)
                await fetch('http://localhost:3000/contacts' , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data) 
                })
        
        
                await fetch('http://localhost:3000/send-email' , {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(
                    {
                        recipient : data.email,
                    }
                    ) 
                })
            }

        }
    }

)()

// module.exports = {worker}

// app.get('/', (req,res)=>{
//     res.json({msg:"worker"})
// })
// app.post('/r-queue', async (req,res)=>{
//     try{
//         connectionRedis()
//         await redisClient.lpush("contractDetails" , req.body)
//         res.json({msg:"message push to queue" , success:"True"})
//     }catch(e){
//         res.json({msg:e , success:"False"})
//     }

// })
// app.listen(PORT , ()=>console.log(`queue is connected at port ${PORT}`))