import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handler";

import authRoutes from "./routes/auth.routes";
import configRoutes from "./routes/config.routes";
import electionRoutes from "./routes/election.routes";
import candidateRoutes from "./routes/candidate.routes";

const PORT = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
