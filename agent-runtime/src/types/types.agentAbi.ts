/**
 * ABI runtime V1
 * This defines how the platform talks to agents
 */

export type AgentInput = any;

export type AgentContext = {
  caller: string; // wallet agent executing the agent
  agentId: string; // unique agent ID
  timeStamp: number; // unix timestamp
};

export type AgentOutput = {
  output: any;
  metadata: Record<string, any>;
};

export type AgentMain = (
  input: AgentInput,
  context: AgentContext
) => Promise<AgentOutput>;
