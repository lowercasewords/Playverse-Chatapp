// import mongoose from 'mongoose';

const mongoose = require("mongoose");
require("dotenv").config();


let MONGO_URI = process.env.MONGO_URI_NORMAL
if(process.env.NODE_ENV === "test")
{
    console.log("Setting the test database!")
    MONGO_URI = process.env.MONGO_URI_TEST 
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {});
    console.log(`MongoDB Connected: ${MONGO_URI}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB } ;