import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import annonceRoutes from "./api/annonce.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/annonces", annonceRoutes);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`annonce-service running on port ${PORT}`);
});
