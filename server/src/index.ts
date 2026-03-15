import "dotenv/config";
import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";

import authRoutes from "./routes/auth.routes";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use("/api/auth", authRoutes);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
