const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./Routes/auth");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://Harshita:harshita@cluster0.g1zjwi1.mongodb.net/Etlhive?retryWrites=true&w=majority"
  )

  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
