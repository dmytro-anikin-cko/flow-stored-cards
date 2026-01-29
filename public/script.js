let paymentSession, cardRiskCheckResult;

const flowContainer = document.getElementById("flow-container");
const sessionStatus = document.getElementById("session-status");
const loader = document.getElementById("loader");
const emailInput = document.getElementById("email-input");
const randomBtn = document.getElementById("random-btn");
const createFlowBtn = document.getElementById("create-flow-btn");

let componentOptions = {
  card: {
    data: {
      cardholderName: "Dmytro Anikin",
    },
    displayCardholderName: "top",
  },
};

// Generate random email
const generateRandomEmail = () => {
  const names = ["john", "jane", "alice", "bob", "charlie", "diana", "emma", "frank"];
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "email.com", "test.com"];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomNumber = Math.floor(Math.random() * 9999);
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${randomName}${randomNumber}@${randomDomain}`;
};

// Random button click handler
randomBtn.addEventListener("click", () => {
  emailInput.value = generateRandomEmail();
});

// Create Flow button click handler
createFlowBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  
  if (!email) {
    alert("Please enter an email address");
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return;
  }

  // Disable button while loading
  createFlowBtn.disabled = true;
  createFlowBtn.textContent = "Creating...";
  createFlowBtn.classList.add("opacity-50", "cursor-not-allowed");

  // Clear previous flow if any
  flowContainer.innerHTML = "";
  sessionStatus.classList.add("hidden");

  // Create payment session with provided email
  const createPaymentSession = async (customerEmail) => {
    try {
      const response = await fetch("/api/get-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: customerEmail }),
      });
      return response.json();
    } catch (error) {
      console.error("❌ Error fetching payment session:", error);
      loader.innerHTML = `<span class="text-red-600">❌ Network error while loading payment session.</span>`;
      return null;
    }
  };

  loader.classList.remove("hidden");
  paymentSession = await createPaymentSession(email);

  if (!paymentSession || !paymentSession.id) {
    loader.innerHTML = `<span class="text-red-600">❌ Failed to initialize a valid payment session.</span>`;
    createFlowBtn.disabled = false;
    createFlowBtn.textContent = "Create Flow";
    createFlowBtn.classList.remove("opacity-50", "cursor-not-allowed");
    return;
  }

  loader.classList.add("hidden");
  sessionStatus.textContent = `✅ Your Payment Session ID is: ${paymentSession.id} | Email: ${email}`;
  sessionStatus.classList.remove("hidden");

  // Re-enable button
  createFlowBtn.disabled = false;
  createFlowBtn.textContent = "Create Flow";
  createFlowBtn.classList.remove("opacity-50", "cursor-not-allowed");

  initFlow();
});

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
