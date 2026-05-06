import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { documentsRouter } from "./modules/documents/documents.router.js";
import { healthRouter } from "./modules/health.router.js";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: webOrigin }));
app.use(express.json({ limit: "25mb" }));

app.use("/health", healthRouter);
app.use("/documents", documentsRouter);

app.listen(port, () => {
  console.log(`eDMS API listening on http://localhost:${port}`);
});
