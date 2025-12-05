<script lang="ts">
  import axios from "axios";
  import { env } from "$env/dynamic/public";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  interface Category {
    id: string;
    label: string;
    description?: string | null;
  }

  let categories: Category[] = [];

  let name = "";
  let address = "";
  let cost = "";
  let description = "";
  let category = "";
  let version = "";
  let file: File | null = null;
  let loading = false;
  let error: string | null = null;
  let success: boolean = false;

  onMount(async () => {
    categories = await getCategories();
  });

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      file = input.files[0];
    }
  }

  async function getCategories(): Promise<Category[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Wallet not connected");
    
    const res = await axios.get(
      `${env.PUBLIC_MAIN_URL}/api/api-routes/categories`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return (await res.data.categories) as Category[];
  }

  async function registerAgent() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Wallet not connected");

    try {
      if (!file) throw new Error("Agent code file required");

      loading = true;
      error = null;

      const form = new FormData();
      form.append("name", name);
      form.append("address", address);
      form.append("cost", cost);
      form.append("description", description);
      form.append("category", category);
      form.append("version", version);
      form.append("code", file);

      const res = await axios.post(
        `${env.PUBLIC_MAIN_URL}/api/agent-registry/register-agent`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // const agent = await res.data.agent;
      success = await res.data.success;

      // if (success) {
      //   goto("/agents", { replaceState: true });
      // }
    } catch (err: any) {
      error = err.error || err.response?.data?.error || err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="mx-auto max-w-xl space-y-4">
  <h1 class="text-xl font-semibold">Register Agent</h1>

  {#if error}
    <div class="rounded bg-red-100 p-2 text-sm text-red-700">
      {error}
    </div>
  {/if}

  {#if success}
    <div class="rounded bg-green-100 p-2 text-sm text-green-700">
      Agent registered successfully ✅
    </div>
  {/if}

  <input
    class="w-full rounded border p-2"
    placeholder="Agent name"
    bind:value={name}
  />

  <input
    class="w-full rounded border p-2"
    placeholder="Cost (e.g 0.01)"
    bind:value={cost}
  />

  <input
    class="w-full rounded border p-2"
    placeholder="Version (e.g 1.0.0)"
    bind:value={version}
  />

  <input
    class="w-full rounded border p-2"
    placeholder="Developer wallet address"
    bind:value={address}
  />

  {#if categories.length === 0}
    <p class="text-sm text-gray-400">Loading categories…</p>
  {/if}

  <select
    class="w-full rounded border p-2"
    bind:value={category}
    required
    disabled={categories.length === 0}
  >
    <option value="" disabled>Select category</option>

    {#each categories as c}
      <option value={c.id}>
        {c.label}
      </option>
    {/each}
  </select>

  <textarea
    class="w-full rounded border p-2"
    placeholder="Description"
    bind:value={description}
  ></textarea>

  <input type="file" accept=".js" on:change={onFileChange} />

  <button
    on:click={registerAgent}
    disabled={loading}
    class="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
  >
    {loading ? "Registering..." : "Register Agent"}
  </button>
</div>
