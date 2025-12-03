/**
 * This mock agent is designed to throw an error
 * to test runtime error handling.
 */

module.exports = async function AgentMain(input, context) {
  // Simulate a failure
  throw new Error(`Intentional failure by agent ${context.agentId}`);
};
