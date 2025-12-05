<script lang="ts">
  import { getWalletClient } from "$lib/walletClient";
  import axios from "axios";
  import { env } from "$env/dynamic/public";

  interface User {
    id: number;
    address: string;
    username: string;
  }

  let user: User;
  let error: string | null = null;

  async function connect() {
    try {
      const client = getWalletClient();
      if (!client) throw new Error("client unavailable");

      const [address] = await client.requestAddresses();

      const res = await axios.post(
        `${env.PUBLIC_MAIN_URL}/api/user-auth/connect`,
        {
          address
        }
      );
      const token = await res.data.token;
      localStorage.setItem("token", token);
      user = (await res.data.user) as User;
    } catch (err: any) {
      error = err.error || (err as Error).message;
    }
  }
</script>

<button on:click={connect}>
  {user ? `Connected: ${user.address.slice(0, 6)}...` : "Connect Wallet"}
</button>

{#if user}
  <span>Username: {user.username}</span>
{/if}

{#if error}
  <p style="color: red">{error}</p>
{/if}
