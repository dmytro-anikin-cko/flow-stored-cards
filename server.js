const express = require("express");
const path = require("path");
// const fetch = require("node-fetch"); // no need for this, since in Node 18.20.5 I already have the global fetch API built in!
require("dotenv").config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve index.html & script.js
app.use(express.json());

// API route to get payment details
app.get("/api/payment-details", async (req, res) => {
  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }

    const ckoRes = await fetch(
      `https://api.sandbox.checkout.com/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CKO_SECRET_KEY}`,
        },
      }
    );

    const paymentDetails = await ckoRes.json();

    if (!ckoRes.ok) {
      return res.status(ckoRes.status).json(paymentDetails);
    }

    // Return safe data to frontend
    res.status(200).json({
      customerId: paymentDetails.customer?.id,
      email: paymentDetails.customer?.email,
      paymentId: paymentDetails.id,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
    });
  } catch (err) {
    console.error("Error fetching payment details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API route to create payment session
app.post("/api/get-payment-session", async (req, res) => {
  try {
    const { email, customerId } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`Creating payment session for: ${email}${customerId ? ` (Customer ID: ${customerId})` : ' (New customer)'}`);

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
        email: email,
        ...(customerId && { id: customerId }),
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
        ...(customerId && {
          stored_card: {
            customer_id: customerId,
          },
        }),
      },
      success_url: `http://localhost:${PORT}/success.html`,
      failure_url: `http://localhost:${PORT}/failure.html`,
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
