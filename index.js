const express = require('express')
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

///////////////////////MONGODB//////////////////////////


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vbucp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send({ message: 'Unauthorized Access' })
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'Forbidden Access' })
      }
      req.decoded = decoded;
      next();
  });
}
async function run() {

  try {
    await client.connect();
    const graphicsCardCollection = client.db('graph_shift').collection('graphicsCard');
    const reviewCollection = client.db('graph_shift').collection('review');
    const orderCollection = client.db('graph_shift').collection('order');
    const userCollection = client.db('graph_shift').collection('user');
    const newUserCollection = client.db('graph_shift').collection('newUser');

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
      // const authorization = req.headers.authorization;
      // console.log(authorization);
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

    //////////////MY PROFILE//////////////////////
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
            // console.log(req.params.email);
            const updatedUser = req.body;
            // console.log(updatedUser2);
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    education:updatedUser.education,
                    location:updatedUser.location,
                    number:updatedUser.number,
                    linkedIn:updatedUser.linkedIn,
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
           
            res.send(result);
    })
    //////////////MY PROFILE//////////////////////

    ///////////////TOKEN AND ADMIN/////////////////////
    app.put('/newUser/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
          $set: user,
      }
      const result = await newUserCollection.updateOne(filter, updatedDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
  })

    app.get('/newUser',async(req,res)=>{
      const users = await newUserCollection.find().toArray()
      res.send(users)
    })



    app.put('/newUser/admin/:email',verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      requesterAccount = await newUserCollection.findOne({ email: requester })
      if (requesterAccount.role === 'admin'){
        const filter = { email: email };
          const updatedDoc = {
              $set: { role: 'admin' },
          }
          const result = await newUserCollection.updateOne(filter, updatedDoc);
          res.send(result);
      }
          
  

      app.get('admin/:email',async(req,res)=>{
        const email = req.params.email;
        const user = await newUserCollection.findOne({email:email});
        const isAdmin = user.role === 'admin';
        res.send({admin:isAdmin})
    })

  })
    ///////////////TOKEN AND ADMIN/////////////////////


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