import express, { Express } from "express";
import userRegistry from "./user-auth/user-auth.routes";
import agentRegistry from "./agent-registry/agent.routes";
import runAgent from "./agent-gateway/agent.routes";
import api from "./api-routes/api.routes";

const app: Express = express();

app.use(express.json());

app.use("/api/agent-registry", agentRegistry);
app.use("/api/user-auth", userRegistry);
app.use("/api/run-agent", runAgent);
app.use("/api/api-routes", api);

export default app;
