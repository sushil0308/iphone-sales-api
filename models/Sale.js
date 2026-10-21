const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    customer_name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    phone_model: {
      type: String,
      required: true,
      maxlength: 50,
    },
    color: {
      type: String,
      required: true,
      maxlength: 30,
    },
    storage_gb: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sale_date: {
      type: Date,
      required: true,
    },
    store_location: {
      type: String,
      required: true,
      maxlength: 100,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

module.exports = mongoose.model("Sale", saleSchema);
