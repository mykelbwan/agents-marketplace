// import { NodeVM } from "vm2";
// import fs from "fs";

// export const validateAgent = (codePath: string) => {
//   const code = fs.readFileSync(codePath, "utf8");

//   const vm = new NodeVM({
//     timeout: 1000,
//     sandbox: {},
//     require: {
//       external: false,
//       builtin: [],
//     },
//   });

//   const exported = vm.run(code, codePath);

//   // Must export a function
//   if (typeof exported !== "function") {
//     throw new Error("Agent must export a single async function");
//   }

//   // Enforce async
//   if (exported.constructor.name !== "AsyncFunction") {
//     throw new Error("Agent function must be async");
//   }
// };


import { NodeVM } from "vm2";
import fs from "fs";

export const validateAgent = (codePath: string) => {
  const code = fs.readFileSync(codePath, "utf8");

  const vm = new NodeVM({
    timeout: 1000,
    sandbox: {},
    require: {
      external: false,
      builtin: [],
    },
  });

  const exported = vm.run(code, codePath);

  // Must export a function
  if (typeof exported !== "function") {
    throw new Error("Agent must export a function");
  }

  // ✅ Validate returns a Promise when called
  const result = exported({}, {
    agentId: "validate",
    caller: "system",
    timeStamp: Date.now(),
  });

  if (!result || typeof result.then !== "function") {
    throw new Error("Agent function must return a Promise");
  }
};
