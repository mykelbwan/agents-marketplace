export interface Agent {
  name: string; // Agent name
  address: string; // developer wallet address
  cost: number; // cost per inference
  description: string; // description of the agent
  category: string; // what category is the agent in?
  version: string; // what version is being deployed? (this will allow upgrades of agents later)
}
