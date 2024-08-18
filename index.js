const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivo4yuq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let clientPromise;

function connectToMongo() {
  if (!clientPromise) {
    clientPromise = client.connect();
  }
  return clientPromise;
}

// Middleware to connect to MongoDB
app.use(async (req, res, next) => {
  try {
    await connectToMongo();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).send({ message: 'Failed to connect to database' });
  }
});

// Collections
const productsCollection = client.db("productpeack").collection("productsCollection");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/products", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const searchQuery = req.query.searchQuery || "";
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
  const sortField = req.query.sortField || "ProductCreationDateAndTime";
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1; // Default to descending order
  const skip = (page - 1) * limit;

  try {
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

    const totalProducts = await productsCollection.countDocuments(filter);
    const products = await productsCollection
      .find(filter)
      .sort({ [sortField]: sortOrder })
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  try {
    const filter = { Category: category };
    const totalProducts = await productsCollection.countDocuments(filter);
    const products = await productsCollection.find(filter).skip(skip).limit(limit).toArray();

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products by category", err });
  }
});

app.get("/products/brand/:brand", async (req, res) => {
  const brand = req.params.brand;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;

  try {
    const filter = { BrandName: brand };
    const totalProducts = await productsCollection.countDocuments(filter);
    const products = await productsCollection.find(filter).skip(skip).limit(limit).toArray();

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

app.listen(port, () => {
  console.log(`Server is running on port${port}`);
});
