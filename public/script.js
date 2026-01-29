let paymentSession, cardRiskCheckResult;

const flowContainer = document.getElementById("flow-container");
const sessionStatus = document.getElementById("session-status");
const loader = document.getElementById("loader");

let componentOptions = {
  card: {
    data: {
      cardholderName: "Dmytro Anikin",
    },
    displayCardholderName: "top",
  },
};

// Requesting a Payment Session on page load
(async () => {
  const createPaymentSession = async () => {
    try {
      const response = await fetch("/api/get-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      return response.json();
    } catch (error) {
      console.error("❌ Error fetching payment session:", error);
      loader.innerHTML = `<span class="text-red-600">❌ Network error while loading payment session.</span>`;
      return null;
    }
  };
  loader.classList.remove("hidden");
  paymentSession = await createPaymentSession();

  if (!paymentSession || !paymentSession.id) {
    loader.innerHTML = `<span class="text-red-600">❌ Failed to initialize a valid payment session.</span>`;
    return;
  }

  loader.classList.add("hidden");
  sessionStatus.textContent = `✅ Your Payment Session ID is: ${paymentSession.id}`;
  sessionStatus.classList.remove("hidden");

  initFlow();
})();

const initFlow = async () => {
  // Guarding initFlow against missing session
  if (!paymentSession || !paymentSession.id) {
    alert("Payment session not ready yet. Please wait...");
    return;
  }

  let checkout = await CheckoutWebComponents({
    publicKey: "pk_sbox_guri7tp655hvceb3qaglozm7gee",
    environment: "sandbox",
    locale: "en-GB", // en-GB, fr-FR...
    paymentSession,
    componentOptions,
    onError: (_, error) => console.error(error)
  });

  const component = checkout.create("flow");

  console.log("Flow Component", component);

  if (await component.isAvailable()) {
    console.log("Available✅");
    component.mount(flowContainer);
  } else {
    console.log("Not Available❌");
  }
};
