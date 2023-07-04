// require("dotenv").config();
import dotenv from "dotenv"
dotenv.config();
const PORT = process.env.PORT || 3001;
const DB_URL = process.env.DB_URL;

import express from "express"
import cors from "cors"
import mongoose from "mongoose" // Orm for the database we use
import {exRouter} from "./src/routes/ex.js"

const app = express();
// const api = axios();

// middleware
app.use(express.json());
app.use(cors());

mongoose.connect(`${DB_URL}`).then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database', error);
  });

app.use("/", exRouter);
app.listen(PORT, () => console.log("Server Started!"));

// command to run server
// node src.index.js
// or yarn start