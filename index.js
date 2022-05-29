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

async function run() {

  try {
    await client.connect();
    const graphicsCardCollection = client.db('graph_shift').collection('graphicsCard');
    const reviewCollection = client.db('graph_shift').collection('review');
    const orderCollection = client.db('graph_shift').collection('order');

    app.get('/item', async (req, res) => {
      const query = {};
      const result = await graphicsCardCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/item/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await graphicsCardCollection.findOne(query);
      res.send(result);
    })
    /////////////////GET REVIEW///////////////////
    app.get('/review', async (req, res) => {
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

    //////////////////ADD ORDER///////////////////

    app.post('/order', async (req, res) => {
      const newItem = req.body;
      // console.log(newItem);
      const result = await orderCollection.insertOne(newItem);
      res.send(result);
    })
    //////////////////ADD ORDER///////////////////

    /////////////////GET BUYER ORDERS////////////////

    ///////////
    // app.get('/order', async (req, res) => {
    //   const query = {};
    //   const result = await orderCollection.find(query).toArray();
    //   res.send(result);
    // })
    ///////////
    app.get('/order', async (req, res) => {
      const buyer = req.query.buyer;
      // console.log(buyer)

      const query = { buyer: buyer };
      // console.log(query)
      const result = await orderCollection.find(query).toArray();
      // console.log(result)
      return res.send(result);

    })
    /////////////////GET BUYER ORDERS////////////////

    ///////////////DELETE AN ORDER////////////////
    app.delete('/order/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })
    ///////////////DELETE AN ORDER////////////////

  }
  finally {

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