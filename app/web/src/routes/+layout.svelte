<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";

  // 1. Imports needed for wallet connection logic
  import { getWalletClient } from "$lib/walletClient";
  import axios from "axios";
  import { env } from "$env/dynamic/public";

  let { children } = $props();

  interface User {
    id: number;
    address: string;
    username: string;
  }

  // 2. State variables for connection status and user data
  let user = $state<User | null>(null);
  let error = $state<string | null>(null);
  let isConnecting = $state(false);

  // 3. Connect function (copied from your profile component)
  export async function connect() {
    if (isConnecting) return;
    isConnecting = true;
    error = null;
    try {
      const client = getWalletClient();
      if (!client) throw new Error("Wallet client unavailable.");

      const [address] = await client.requestAddresses();

      const res = await axios.post(
        `${env.PUBLIC_MAIN_URL}/api/user-auth/connect`,
        {
          address,
        }
      );
      const token = await res.data.token;
      localStorage.setItem("token", token);

      user = res.data.user as User;
      localStorage.setItem("username", user.username);
    } catch (err: any) {
      // Improved error handling
      error = err.error || (err as Error).message || "Connection failed.";
      console.error("Wallet connection error:", err);
    } finally {
      isConnecting = false;
    }
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<header class="bg-blue-900 p-4 text-white shadow-lg">
  <div class="container mx-auto flex justify-between items-center">
    <a
      href="/"
      class="text-3xl font-extrabold tracking-wider hover:text-cyan-400 transition duration-300"
    >
      Agent Ocean
    </a>

    <nav class="flex space-x-6 items-center">
      {#if user}
        <div
          class="flex items-center space-x-3 bg-gray-700 py-2 px-4 rounded-full text-sm"
        >
          <span class="font-mono text-cyan-400">
            {user.address.slice(0, 6)}...{user.address.slice(-4)}
          </span>

          <a href="/profile" class="text-cyan-400 hover:underline ml-2 text-xs"
            >View Profile</a
          >
        </div>
      {:else}
        <button
          onclick={connect}
          disabled={isConnecting}
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {#if isConnecting}
            Connecting...
          {:else}
            Connect Wallet
          {/if}
        </button>
      {/if}

      <a
        href="/register-agent"
        class="bg-cyan-500 hover:bg-cyan-600 text-blue-900 font-bold py-2 px-5 rounded-full shadow-md transition duration-300 transform hover:scale-105"
      >
        Register Agent
      </a>
    </nav>
  </div>
</header>

<main class="container mx-auto p-8">
  {#if error}
    <div
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
      role="alert"
    >
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{error}</span>
    </div>
  {/if}
  {@render children()}
</main>
