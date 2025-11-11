import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "../app";

dotenv.config();

mongoose.connect(`${process.env.MONGODB_URI}`).then(() => app.listen(5000)).catch((err) => console.log(err))