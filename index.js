const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivo4yuq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      await client.connect();

      const productsCollection = client.db("productpeack").collection("productsCollection");

      app.get('/', (req, res) => {
        res.send('Hello World!')
      })

      app.get("/products", async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const searchQuery = req.query.searchQuery || "";
        const skip = (page - 1) * limit;
      
        try {
          const productsCollection = client.db("productpeack").collection("productsCollection");
      
          const filter = {
            $or: [
              { ProductName: { $regex: searchQuery, $options: "i" } },
              { Category: { $regex: searchQuery, $options: "i" } },
              { ProductCreationDateAndTime: { $regex: searchQuery, $options: "i" } },
            ],
          };
      
          const totalProducts = await productsCollection.countDocuments(filter);
          const products = await productsCollection.find(filter).skip(skip).limit(limit).toArray();
      
          res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
          });
        } catch (err) {
          res.status(500).json({ message: "Error fetching products", err });
        }
      });
      
    


      console.log("You successfully connected to MongoDB!");
    } finally {

    }
  }
  run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
