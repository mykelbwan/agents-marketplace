import { wrapFetchWithPayment } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { env } from "$env/dynamic/public";

export async function x402Call(agentId: string, input: string) {
  const token = localStorage.getItem("token");

  if (!token) throw new Error("Wallet not connected");

  const client = createThirdwebClient({
    clientId: env.PUBLIC_THIRDWEB_CLIENT_ID,
  });

  const wallet = createWallet("io.metamask"); // or any other wallet
  await wallet.connect({ client });

  // Wrap fetch with payment handling
  const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);

  // Make a request that may require payment
  const response = await fetchWithPay(
    `${env.PUBLIC_MAIN_URL}/api/run-agent/agents/${agentId}/run`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ input }),
    }
  );
  return await response.json();
}
