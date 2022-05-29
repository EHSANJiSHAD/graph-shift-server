const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

///////////////////////MONGODB//////////////////////////


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vbucp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function  run(){

    try{
        await client.connect();
        const graphicsCardCollection = client.db('graph_shift').collection('graphicsCard');
        const reviewCollection = client.db('graph_shift').collection('review');

        app.get('/item',async(req,res)=>{
            const query = {};
            const result = await graphicsCardCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/item/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await graphicsCardCollection.findOne(query);
            res.send(result);
        })
        /////////////////GET REVIEW///////////////////
        app.get('/review',async(req,res)=>{
          const query = {};
          const result = await reviewCollection.find(query).toArray();
          res.send(result);
      })
        /////////////////GET REVIEW///////////////////

        ////////////ADD REVIEW/////////////////////////
        app.post('/review', async (req, res) => {
          const newItem = req.body;
          // console.log(newItem);
          const result = await reviewCollection.insertOne(newItem);
          res.send(result);
      })
      ////////////ADD REVIEW/////////////////////////

        
    }
    finally{
         
    }

}

run().catch(console.dir);


///////////////////////MONGODB//////////////////////////

app.get('/', (req, res) => {
  res.send('HELLO FROM GRAPH SHIFT!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})