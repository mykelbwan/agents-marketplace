REQUIRED AGENT FORMAT

```js
// agent.js (or bundled agent-bundle.js)

module.exports = async function main(input, context) {
  return {
    output: `Hello ${input}`,
  };
};
```