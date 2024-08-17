const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivo4yuq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const productsCollection = client
      .db("productpeack")
      .collection("productsCollection");

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const searchQuery = req.query.searchQuery || "";
      const minPrice = parseInt(req.query.minPrice) || 0;
      const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
      const sortOption = req.query.sort || "default";
      const skip = (page - 1) * limit;
    
      try {
        const productsCollection = client
          .db("productpeack")
          .collection("productsCollection");
    
        const filter = {
          $and: [
            {
              $or: [
                { ProductName: { $regex: searchQuery, $options: "i" } },
                { Category: { $regex: searchQuery, $options: "i" } },
                { ProductCreationDateAndTime: { $regex: searchQuery, $options: "i" } },
              ],
            },
            { Price: { $gte: minPrice, $lte: maxPrice } },
          ],
        };
    
        let sortCriteria = {};
        if (sortOption === "price-asc") {
          sortCriteria = { Price: 1 }; // Low to High
        } else if (sortOption === "price-desc") {
          sortCriteria = { Price: -1 }; // High to Low
        } else if (sortOption === "date-newest") {
          sortCriteria = { ProductCreationDateAndTime: -1 }; // Newest First
        }
    
        const totalProducts = await productsCollection.countDocuments(filter);
        const products = await productsCollection
          .find(filter)
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit)
          .toArray();
    
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
    
    

    app.get("/products/category/:category", async (req, res) => {
      const category = req.params.category;

      try {
        const productsCollection = client
          .db("productpeack")
          .collection("productsCollection");
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        const filter = { Category: category };
        const totalProducts = await productsCollection.countDocuments(filter);
        const products = await productsCollection
          .find(filter)
          .skip(skip)
          .limit(limit)
          .toArray();

        res.json({
          products,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
        });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error fetching products by category", err });
      }
    });

    app.get("/products/brand/:brand", async (req, res) => {
      const brand = req.params.brand;
    
      try {
        const productsCollection = client
          .db("productpeack")
          .collection("productsCollection");
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
    
        const filter = { BrandName: brand };
        const totalProducts = await productsCollection.countDocuments(filter);
        const products = await productsCollection
          .find(filter)
          .skip(skip)
          .limit(limit)
          .toArray();
    
        res.json({
          products,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
        });
      } catch (err) {
        res.status(500).json({ message: "Error fetching products by brand", err });
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
