import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error-handler";

import authRoutes from "./routes/auth.routes";
import configRoutes from "./routes/config.routes";
import electionRoutes from "./routes/election.routes";
import candidateRoutes from "./routes/candidate.routes";
import voteRoutes from "./routes/vote.routes";
import userRoutes from "./routes/user.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const PORT = process.env.PORT || 8000;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "..", "client", "dist")));
app.use(express.static(path.join(process.cwd(), "public")));
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/config", configRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// for production frontend build
// build client first
app.get("/*index", (req, res) => {
  res.sendFile(path.join(process.cwd(), "..", "client", "dist", "index.html"));
});

// error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
