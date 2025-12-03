import { AgentContext } from "./types.agentAbi";

export type ExecuteArgs = {
  agentPath: string;
  input: any;
  context: AgentContext;
  timeoutMs?: number;
};
