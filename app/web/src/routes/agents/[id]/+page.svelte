<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import axios from "axios";
  import { env } from "$env/dynamic/public";
  import { x402Call } from "$lib/x402Payment";

  // const result = {
  //   output: {
  //     echoedInput: { input: "hello test" },
  //     message:
  //       "Hello, 0x1749F4aA848Aeab728f1D183E24dF13cf22864d0! Your agent ID is cminsn9lq0001fsbgmo1vjoj6.",
  //   },
  //   metadata: { executedAt: "2025-12-05T00:37:12.802Z", inputLength: 22 },
  // };

  interface Agent {
    id: string;
    name: string;
    description: string;
    cost: string;
    currency: string;
  }

  interface ResultMetaData {
    executedAt: string;
    inputLength: number;
  }

  let agent: Agent | null = null;
  let input = "";
  let loading = false;
  let error: string | null = null;
  let inputLength: any;
  let executedAt: any;
  let message: string;
  let success = false;

  const agentId = $page.params.id;

  onMount(async () => {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("Wallet not connected");

    const res = await axios.get(
      `${env.PUBLIC_MAIN_URL}/api/api-routes/${agentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    agent = res.data.agent;
  });

  async function runAgent() {
    if (!input.trim()) return;

    loading = true;
    error = null;

    try {
      const res = await x402Call(agentId!, input);

      const data = await res.result;
      executedAt = await res?.metadata?.executedAt;
      inputLength = res?.metadata?.inputLength;
      message = await data?.output?.message;
      success = true;
    } catch (err: any) {
      error = err.message || "Execution failed";
    } finally {
      loading = false;
    }
  }
</script>

{#if agent}
  <div class="mx-auto max-w-3xl space-y-6">
    <div>
      <h1 class="text-xl font-semibold">{agent.name}</h1>
      <p class="text-gray-600">{agent.description}</p>
      <p class="text-sm text-gray-500">
        Cost: {agent.cost}
        {agent.currency}
      </p>
    </div>

    {#if success}
      <div class="rounded border bg-white p-4 space-y-2">
        <p class="text-sm text-gray-500">Agent response</p>

        <p class="text-base whitespace-pre-wrap">
          {message}
        </p>

        <div class="border-t pt-2 text-xs text-gray-500 flex gap-4">
          <span>
            Executed At:
            {new Date(executedAt || "").toLocaleString()}
          </span>
          <span>
            Input length: {inputLength || "N/A"}
          </span>
        </div>
      </div>
    {/if}

    <textarea
      bind:value={input}
      rows="5"
      placeholder="Type input..."
      class="w-full rounded border p-3 font-mono text-sm"
    ></textarea>

    <button
      on:click={runAgent}
      disabled={loading}
      class="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Running…" : "Run Agent"}
    </button>

    {#if error}
      <p class="text-sm text-red-500">{error}</p>
    {/if}
  </div>
{:else}
  <p>Loading agent…</p>
{/if}

<!-- {#if agent}
  <div class="mx-auto max-w-3xl space-y-6">
    <div>
      <h1 class="text-xl font-semibold">{agent.name}</h1>
      <p class="text-gray-600">{agent.description}</p>
      <p class="text-sm text-gray-500">
        Cost: {agent.cost}
        {agent.currency}
      </p>
    </div>

    <textarea
      bind:value={input}
      rows="6"
      placeholder="Type input..."
      class="w-full rounded border p-3 font-mono text-sm"
    ></textarea>

    <button
      on:click={runAgent}
      disabled={loading}
      class="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Running…" : "Run Agent"}
    </button>

    {#if error}
      <p class="text-sm text-red-500">{error}</p>
    {/if}

    {#if results}
      <pre class="rounded bg-gray-100 p-4 text-sm overflow-x-auto">
{results[0].output.message}
      </pre>
    {/if}
  </div>
{:else}
  <p>Loading agent…</p>
{/if} -->
