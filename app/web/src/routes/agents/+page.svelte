<script lang="ts">
  import axios from "axios";
  import { env } from "$env/dynamic/public";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  interface Category {
    id: string;
    label: string;
    description?: string | null;
  }

  interface AgentByCategory {
    id: string;
    name: string;
    cost: string;
    category: string;
    currency: string;
    isActive: boolean;
    description: string;
  }

  let categories: Category[] = [];
  let agentsByCategory: AgentByCategory[] = [];
  let activeCategory: string | null = null;
  let loading = false;

  // Reactive statement to watch the URL and extract the category query param
  $: categoryFromUrl = $page.url.searchParams.get("category");

  // If the category URL param is found, select that category
  $: if (categoryFromUrl) {
    selectCategory(categoryFromUrl);
  }

  // onMount runs when the component is first loaded
  onMount(async () => {
    categories = await getCategories();

    // Auto-load the first category if categories exist
    if (categories.length > 0) {
      selectCategory(categories[0].id); // Select the first category
    }
  });

  // Fetch categories from the API
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
    return res.data.categories as Category[];
  }

  // Fetch agents based on the selected category
  async function getAgentsByCategory(
    category: string
  ): Promise<AgentByCategory[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Wallet not connected");

    const res = await axios.get(
      `${env.PUBLIC_MAIN_URL}/api/api-routes/agents-by-category/${category}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.agents as AgentByCategory[];
  }

  // Handle category selection (called when a category button is clicked)
  function selectCategory(category: string) {
    activeCategory = category; // Update the active category
    loading = true; // Set loading state to true
    getAgentsByCategory(category) // Fetch agents for the selected category
      .then((fetchedAgents) => {
        agentsByCategory = fetchedAgents; // Update the agents array
        loading = false; // Set loading state to false
        goto(`/agents?category=${category}`, { replaceState: true }); // Navigate to the agents page
      })
      .catch((error) => {
        console.error("Error fetching agents:", error);
        loading = false; // Handle error and stop loading
      });
  }
</script>

<div class="flex gap-6">
  <!-- Categories -->
  <aside class="w-64 space-y-1">
    {#each categories as c}
      <button
        on:click={() => selectCategory(c.id)}
        class="w-full rounded-md px-4 py-2 text-left text-sm
          transition
          hover:bg-gray-100
          {c.id === activeCategory
          ? 'bg-gray-200 font-semibold'
          : 'bg-transparent'}"
      >
        {c.label}
      </button>
    {/each}
  </aside>

  <!-- Agents -->
  <main class="flex-1">
    {#if loading}
      <p class="text-gray-500">Loading agents…</p>
    {:else if agentsByCategory.length === 0}
      <p class="text-gray-500">No agents in this category</p>
    {:else}
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        {#each agentsByCategory as a}
          <div class="rounded-lg border p-4 shadow-sm hover:shadow">
            <h3 class="font-medium mt-0.5">{a.name}</h3>
            <p class="text-sm text-gray-500">
              cost: {a.cost}
            </p>
            <p class="text-sm text-gray-500">payment currency: {a.currency}</p>
            <p class="text-sm text-gray-500">
              description: {a.description}
            </p>

            <button
              on:click={() => goto(`/agents/${a.id}`)}
              class="mt-3 text-sm text-white hover:underline w-full bg-blue-600 rounded-[5px] pt-1 pb-1"
            >
              Run agent
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>
