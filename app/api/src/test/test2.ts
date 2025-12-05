import "dotenv/config";
import express from "express";
import { settlePayment, facilitator } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: "0x06ceD68b79c3a3583A5360E98F2E060788d46a1b",
});

const app = express();

app.get("/api/premium", async (req, res) => {
  const result = await settlePayment({
    resourceUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    method: req.method,
    paymentData:
      typeof req.headers["x-payment"] === "string"
        ? req.headers["x-payment"]
        : null,

    payTo: process.env.ADDRESS!,
    network: process.env.NETWORK!,
    price: "$0.05",
    facilitator: thirdwebFacilitator,
    routeConfig: {
      description: "Access to premium content",
      mimeType: "application/json",
      maxTimeoutSeconds: 300,
    },
  });

  if (result.status === 200) {
    // Set payment receipt headers
    Object.entries(result.responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.json({ message: "This is premium content!" });
  } else {
    res
      .status(result.status)
      .set(result.responseHeaders)
      .json(result.responseBody);
  }
});

const PORT = 3000;

function server() {
  app.listen(PORT, () =>
    console.log(`Server running on PORT: http://localhost:${PORT}`)
  );
}

server();
