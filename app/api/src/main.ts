import express, { Express } from "express";
import cors from "cors";
import userRegistry from "./user-auth/user-auth.routes";
import agentRegistry from "./agent-registry/agent.routes";
import runAgent from "./agent-gateway/agent.routes";
import api from "./api-routes/api.routes";
import "dotenv/config";

const app: Express = express();

app.use(express.json());
app.use(cors({ origin: [process.env.ALLOW_REQUEST_ORIGIN_FROM!] }));

app.use("/api/agent-registry", agentRegistry);
app.use("/api/user-auth", userRegistry);
app.use("/api/run-agent", runAgent);
app.use("/api/api-routes", api);

export default app;
