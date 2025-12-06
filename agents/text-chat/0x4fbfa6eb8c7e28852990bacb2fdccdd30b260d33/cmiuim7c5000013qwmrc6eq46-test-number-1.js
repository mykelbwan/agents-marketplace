/**
 * This mock agent transforms any string field in the input
 * to uppercase and adds metadata.
 */

module.exports = async function AgentMain(input, context) {
  // Find the first string property in input
  const textField = Object.values(input).find((v) => typeof v === "string");
  const text = textField ?? "";

  // Simulate async operation
  const transformed = await new Promise((resolve) =>
    setTimeout(() => resolve(text.toUpperCase()), 100)
  );

  const output = {
    original: text,
    transformed,
    note: `Processed by agent ${context.agentId}`,
  };

  const metadata = {
    executedAt: new Date().toISOString(),
    inputLength: text.length,
    processingTimeMs: 100,
  };

  return {
    output,
    metadata,
  };
};
