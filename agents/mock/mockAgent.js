/**
 * This is a simple mock agent for testing the runtime.
 * It implements AgentMain:
 *   (input: AgentInput, context: AgentContext) => Promise<AgentOutput>
 */

module.exports = async function AgentMain(input, context) {
  // input: anything sent by API
  // context: { agentId, caller, timeStamp }

  // Example behavior: echo the input with some metadata
  const output = {
    echoedInput: input,
    message: `Hello, ${context.caller}! Your agent ID is ${context.agentId}.`,
  };

  const metadata = {
    executedAt: new Date().toISOString(),
    inputLength: JSON.stringify(input).length,
  };

  return {
    output,
    metadata,
  };
};
