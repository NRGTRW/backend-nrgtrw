import "dotenv/config";
import express from "express";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
