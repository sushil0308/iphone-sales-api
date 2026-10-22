require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Sale = require("./models/Sale");

const app = express();
app.use(express.json());

// 1. Create a sale
app.post("/sales", async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. Get all sales
app.get("/sales", async (req, res) => {
  try {
    const filter = {};

    if (req.query.phone_model) {
      filter.phone_model = req.query.phone_model;
    }

    const sales = await Sale.find(filter);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Sales statistics
app.get("/sales/stats", async (req, res) => {
  try {
    const totalSales = await Sale.countDocuments();

    const revenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const popularModel = await Sale.aggregate([
      { $group: { _id: "$phone_model", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 }
    ]);

    const average = await Sale.aggregate([
      { $group: { _id: null, average: { $avg: "$price" } } }
    ]);

    res.json({
      total_sales: totalSales,
      total_revenue: revenue[0]?.total || 0,
      most_popular_model: popularModel[0]?._id || null,
      average_sale_price: average[0]?.average || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get sale by ID
app.get("/sales/:sale_id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.sale_id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    res.status(400).json({ error: "Invalid sale ID" });
  }
});

// 5. Update a sale
app.put("/sales/:sale_id", async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.sale_id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Delete a sale
app.delete("/sales/:sale_id", async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.sale_id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid sale ID" });
  }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed:", error.message);
  });
