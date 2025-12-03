import path from "path";
import { executeAgent } from "./execute/executeAgent";

const agentsRoute = path.resolve(
  __dirname, // current file folder
  "../../agents/mock/mockTransformAgent.js" // relative to this file
);

(async () => {
  const result = await executeAgent({
    agentPath: agentsRoute,
    input: { text: "hello world, happy new month to each and everyone of you" },
    context: { agentId: "3", caller: "user-99", timeStamp: Date.now() },
  });

  console.log(result.output);
  // {
  //   original: "hello world",
  //   transformed: "HELLO WORLD",
  //   note: "Processed by agent 2"
  // }

  console.log(result.metadata);
  // {
  //   executedAt: "...",
  //   inputLength: 11,
  //   processingTimeMs: 100
  // }
})();


