import { NodeVM } from "vm2";
import { ExecuteArgs } from "../types/types.executeArgs";
import { AgentOutput } from "../types/types.agentAbi";
import { loadAgent } from "./loadAgent";
/**
 * Executes an agent with the given input and context.
 * Returns { output, metadata }.
 * Throws if execution fails.
 */
export async function executeAgent(args: ExecuteArgs): Promise<AgentOutput> {
  const { agentPath, input, context, timeoutMs } = args;

  // 1. Load the agent function
  const agentFn = loadAgent(agentPath);

  // 2. Create a VM sandbox (optional, but safe)
  const vm = new NodeVM({
    timeout: timeoutMs ?? 5000, // default 5s
    sandbox: {},
    require: {
      external: false, // prevent importing modules
      builtin: [],
    },
  });

  try {
    // 3. Execute agent inside VM
    const exportedFn = vm.run(
      `
      module.exports = ${agentFn.toString()};
    `,
      agentPath
    );

    const result = await exportedFn(input, context);

    // 4. Validate result shape minimally
    if (!result || typeof result !== "object" || !("output" in result)) {
      throw new Error("Agent did not return a valid output object");
    }

    return result as AgentOutput;
  } catch (err: any) {
    // 5. Wrap and throw execution errors
    throw new Error(`Agent execution failed: ${err.message}`);
  }
}


