import express from "express";
import customerRoutes from "./routes/customer.routes";
import projectRoutes from "./routes/project.routes";
import modRoutes from "./routes/mod.routes";
import lfcRoutes from "./routes/lfc.routes";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors());

const port = process.env.PORT || 5005
const db = process.env.DBURL || "mongodb://localhost:27017/customer"
mongoose.connect(db).then(()=>{
  console.log("Connected to MongoDB")
}).catch((error:any)=>{
  console.log("Error connecting to MongoDB", error)
})

app.use("/api/customer", customerRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/mod", modRoutes);
app.use("/api/lfc", lfcRoutes);

app.listen(port, () => console.log("Server running on port " + port));