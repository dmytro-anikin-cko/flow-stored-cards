const express = require("express");
const path = require("path");
// const fetch = require("node-fetch"); // no need for this, since in Node 18.20.5 I already have the global fetch API built in!
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve index.html & script.js
app.use(express.json());

// API route
app.post("/api/get-payment-session", async (req, res) => {
  try {
    const sessionReq = {
      processing_channel_id: "pc_w2njpb6jbjjujgcz5dgzxdn5mm",
      currency: "EUR",
      amount: 1000,
      reference: `DIMA-TEST`,
      "3ds": {
        enabled: true,
      },
      billing: {
        address: {
          country: "NL",
        },
      },
      customer: {
        // name: "Random Name",
        email: "dima123@email.com",
        // id: "cus_223w7iymefoujpwu4wgktb4hwe"
      },
      // enabled_payment_methods: ["card"],
      disabled_payment_methods: ["remember_me"],
      payment_method_configuration: {
        card: {
          /**
           * This value displays the option to store card credentials for future payments.
           * If you have already collected consent from the customer,
           * you can provide payment_method_configuration.card.store_payment_details: "enabled" instead.
           */
          store_payment_details: "collect_consent",
        },
        stored_card: {
          customer_id: "cus_223w7iymefoujpwu4wgktb4hwe",
        },
      },
      success_url: "https://checkout.checkout.test.success",
      failure_url: "https://checkout.checkout.test.failure",
    };

    const ckoRes = await fetch(
      "https://api.sandbox.checkout.com/payment-sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CKO_SECRET_KEY}`,
        },
        body: JSON.stringify(sessionReq),
      },
    );

    const result = await ckoRes.json();
    res.status(200).json(result);
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
