// load the agent module and return its entry function

// Responsibilities:

// import the agent file

// validate it exports a function

// return that function

import path from "path";
import fs from "fs";
import { AgentMain } from "../types/types.agentAbi";

/**
 * Load an agent module from file and return its main function.
 * Throws if file doesn't exist or does not export a function.
 */
export function loadAgent(codePath: string): AgentMain {
  // 1. Ensure file exists
  if (!fs.existsSync(codePath)) {
    throw new Error(`Agent file not found at path: ${codePath}`);
  }

  // 2. Resolve absolute path
  const resolvedPath = path.resolve(codePath);

  // 3. Import the module dynamically
  const agentModule = require(resolvedPath);

  // 4. Validate it exports a function
  const agentFn = agentModule?.default ?? agentModule?.AgentMain ?? agentModule;
  if (typeof agentFn !== "function") {
    throw new Error(`Agent at ${codePath} does not export a function`);
  }

  // 5. Return the entry function
  return agentFn as AgentMain;
}

