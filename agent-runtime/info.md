Suggested execution flow (mental checklist)

   1. Resolve agent path

   2. Import / require agent module

   3. Validate it exports a function (your AgentMain)

   4. Call it

   5. Ensure it returns something

   6. Wrap success / failure cleanly








Very minimum “definition of done”

You’re done when:

1. one agent file exists in /agents

2. calling executeAgent runs it

3. output comes back

4. a thrown error doesn’t crash the server

That’s a working runtime.