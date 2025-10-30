const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.port || 3001;

// All middleware here
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@cluster0.to58y.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const db = client.db("smart_db");
    const productCollection = db.collection("products");
    const bidsCollection = db.collection("bids");
    const usersCollection = db.collection("users");

    // Get Data
    app.get("/products", async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get Specific data
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // Add Product in database
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Update product
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProducts = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProducts.name,
          price: updatedProducts.price,
        },
      };
      const options = {};
      const result = await productCollection.updateOne(query, update, options);
      res.send(result);
    });

    // Delete single product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // -----------> Bids Related Apis <----------- \\
    // Create a bid
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Post a bid
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "User already exist" });
      } else {
        const result = await bidsCollection.insertOne(newBid);
        res.send(result);
      }
    });

    // -----------> Users Related Apis <----------- \\
    // create a user
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("New user", newUser);
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // get all users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // so leaving 'await client.close();' commented out is generally correct.
  }
}
run().catch((error) => {
  // A little better error logging in case the connection fails.
  console.error("MongoDB Connection Error:", error);
});

app.get("/", (req, res) => {
  res.send("Srver");
});

app.listen(port, () => {
  console.log(`Your server running on port http://localhost:${port}`);
});
