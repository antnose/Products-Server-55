const { MongoClient, ServerApiVersion } = require("mongodb");
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

    // Add Product in database
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
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
