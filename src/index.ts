import express from "express";
import customerRoutes from "./routes/customer.routes";
import projectRoutes from "./routes/project.routes";
import modRoutes from "./routes/mod.routes";
import lfcRoutes from "./routes/lfc.routes";
import marketHead from './routes/marketingHead.routes'
import marketDetail from './routes/marketDetail.routes'
import mod from './routes/mod.routes'
import nvt from './routes/nvt.routes'
import role from './routes/role.routes'
import menu from './routes/menu.routes'
import roleMenu from './routes/roleMenu.routes'
import percentage from './routes/percentage.routes'
import common from './routes/common.routes'
import user from './routes/user.routes'
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import plotBookingFormRoutes from "./routes/plotBookingForm.routes";
import lifeSacingRoutes from "./routes/lifeSaving.routes";
import { IEmi } from "./type/emi";
import { Emi } from "./models/emi.model";
import { General } from "./models/general.model";
import cron from "node-cron";

const app = express();
app.use(express.json());
dotenv.config();
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const port = process.env.PORT || 5005
const db = process.env.DBURL || "mongodb://localhost:27017/customer"
mongoose.connect(db).then(() => {
  console.log("Connected to MongoDB")
}).catch((error: any) => {
  console.log("Error connecting to MongoDB", error)
})

app.use("/api/customer", customerRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/mod", modRoutes);
app.use("/api/lfc", lfcRoutes);
app.use("/api/market/head", marketHead);
app.use("/api/market/detail", marketDetail);
app.use("/api/mod", mod);
app.use("/api/nvt", nvt);
app.use("/api/percentage", percentage);
app.use("/api/role", role);
app.use("/api/menu", menu);
app.use("/api/role/menu", roleMenu);
app.use("/api/user", user);
app.use("/api/common", common);
app.use("/api/plot/booking", plotBookingFormRoutes);
app.use("/api/life/saving", lifeSacingRoutes);

cron.schedule("02 00 * * *", async () => {
  console.log("Running cron job");
  try {
    // Find all unpaid EMIs
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize date

    // Calculate the cutoff date: EMIs whose date + 2 months <= today
    const cutoffDate = new Date(today);
    cutoffDate.setMonth(cutoffDate.getMonth() - 2); // subtract 2 months

    // Find unpaid EMIs where emi.date <= cutoffDate
    const unpaidEmis: IEmi[] = await Emi.find({
      paidDate: null,
      date: { $lte: cutoffDate }, // MongoDB comparison
    });
    for (const emi of unpaidEmis) {
      const emiDate = new Date(emi.date);
      const duePlus2Months = new Date(emiDate);
      duePlus2Months.setMonth(duePlus2Months.getMonth() + 2);
      duePlus2Months.setHours(0, 0, 0, 0);
      if (duePlus2Months <= today) {
        await General.findByIdAndUpdate(
          emi.general,
          { status: "blocked" },
          { new: true }
        );
      }
    }

  } catch (err) {
    console.error("Error in cron job:", err);
  }
});

app.listen(port, () => console.log("Server running on port " + port));