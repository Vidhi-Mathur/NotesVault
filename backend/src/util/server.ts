import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "../app";

dotenv.config();

const uri = process.env.MONGODB_URI;
if(!uri){
    console.error("MONGODB_URI is missing");
    process.exit(1);
}

mongoose.connect(uri).then(() => {
    console.log("Mongo connected");
    app.listen(5000, "0.0.0.0", () => console.log("Server on 5000"));
}).catch(err => console.log(err))