<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import axios from "axios";
  import { env } from "$env/dynamic/public";
  import { x402Call } from "$lib/x402Payment";

  interface Agent {
    id: string;
    name: string;
    description: string;
    cost: string;
    currency: string;
  }

  let agent: Agent | null = null;
  let input = "";
  let loading = false;
  let error: string | null = null;
  let output: any = null;
  let metadata: any = null;
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

      output = res.result.output;
      metadata = res.result.metadata;

      console.log(output);
      console.log(metadata);

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
  <div class="rounded border bg-white p-6 space-y-6 shadow-lg">
    <h3 class="text-xl font-semibold text-blue-800">Agent Execution Results</h3>

    <div>
      <p class="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Agent Output</p>
      <div class="space-y-1">
        {#each Object.entries(output) as [key, value]}
          <div class="flex">
            <span class="font-semibold text-gray-700 w-32 capitalize">
              {key}:
            </span>
            <span class="text-base whitespace-pre-wrap text-gray-900 flex-1">
              {value}
            </span>
          </div>
        {/each}
      </div>
    </div>
    
    <hr class="border-t border-gray-200" />

    <div>
      <p class="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Execution Metadata</p>
      <div class="space-y-1 text-sm">
        {#each Object.entries(metadata) as [key, value]}
          <div class="flex">
            <span class="font-medium text-gray-600 w-32 capitalize">
              {key}:
            </span>
            <span class="font-mono text-gray-800 flex-1">
              {#if key === 'executedAt'}
                {new Date(value as string).toLocaleString()}
              {:else}
                {value}
              {/if}
            </span>
          </div>
        {/each}
      </div>
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
