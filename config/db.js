require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected!')
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
    });
