let paymentSession, cardRiskCheckResult;

const flowContainer = document.getElementById("flow-container");
const sessionStatus = document.getElementById("session-status");
const loader = document.getElementById("loader");
const emailInput = document.getElementById("email-input");
const randomBtn = document.getElementById("random-btn");
const createFlowBtn = document.getElementById("create-flow-btn");
const customersSection = document.getElementById("customers-section");
const customersList = document.getElementById("customers-list");
const captureCvvToggle = document.getElementById("capture-cvv-toggle");

let selectedCustomerId = null;

const getComponentOptions = () => {
  const options = {
    card: {
      data: {
        cardholderName: "Dmytro Anikin",
      },
      displayCardholderName: "top",
    },
  };
  
  // Add stored_card options if CVV capture is enabled
  if (captureCvvToggle.checked) {
    options.stored_card = {
      captureCardCvv: true,
    };
  }
  
  return options;
};

// Load and display customers on page load
const loadCustomers = () => {
  const customers = JSON.parse(localStorage.getItem('checkout_customers') || '[]');
  
  if (customers.length === 0) {
    customersSection.classList.add('hidden');
    return;
  }
  
  customersSection.classList.remove('hidden');
  customersList.innerHTML = '';
  
  customers.forEach(customer => {
    const customerCard = document.createElement('div');
    customerCard.className = 'bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors flex justify-between items-center';
    
    customerCard.innerHTML = `
      <div class="flex-1">
        <div class="font-medium text-gray-800">${customer.email}</div>
        <div class="text-xs text-gray-500 font-mono mt-1">ID: ${customer.id}</div>
        <div class="text-xs text-gray-400 mt-1">Last used: ${new Date(customer.lastUsed).toLocaleString()}</div>
      </div>
      <button class="use-customer-btn px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
        Use Customer
      </button>
    `;
    
    // Use customer button
    const useBtn = customerCard.querySelector('.use-customer-btn');
    useBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedCustomerId = customer.id;
      emailInput.value = customer.email;
      emailInput.disabled = true;
      emailInput.classList.add('bg-gray-100', 'cursor-not-allowed');
      randomBtn.disabled = true;
      randomBtn.classList.add('opacity-50', 'cursor-not-allowed');
      
      // Visual feedback
      document.querySelectorAll('.use-customer-btn').forEach(btn => {
        btn.textContent = 'Use Customer';
        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      });
      useBtn.textContent = '✓ Selected';
      useBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      useBtn.classList.add('bg-green-600', 'hover:bg-green-700');
      
      // Scroll to create button
      createFlowBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    customersList.appendChild(customerCard);
  });
};

// Load customers on page load
loadCustomers();

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
  // Reset customer selection
  selectedCustomerId = null;
  emailInput.disabled = false;
  emailInput.classList.remove('bg-gray-100', 'cursor-not-allowed');
  randomBtn.disabled = false;
  randomBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  emailInput.value = generateRandomEmail();
  
  // Reset customer selection visual feedback
  document.querySelectorAll('.use-customer-btn').forEach(btn => {
    btn.textContent = 'Use Customer';
    btn.classList.remove('bg-green-600', 'hover:bg-green-700');
    btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
  });
  
  console.log('Random email generated, selectedCustomerId reset to:', selectedCustomerId);
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
  
  console.log('Creating Flow with:', { email, selectedCustomerId });

  // Create payment session with provided email and optional customer ID
  const createPaymentSession = async (customerEmail, customerId = null) => {
    try {
      const body = { email: customerEmail };
      if (customerId) {
        body.customerId = customerId;
      }
      
      const response = await fetch("/api/get-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return response.json();
    } catch (error) {
      console.error("❌ Error fetching payment session:", error);
      loader.innerHTML = `<span class="text-red-600">❌ Network error while loading payment session.</span>`;
      return null;
    }
  };

  loader.classList.remove("hidden");
  paymentSession = await createPaymentSession(email, selectedCustomerId);

  if (!paymentSession || !paymentSession.id) {
    loader.innerHTML = `<span class="text-red-600">❌ Failed to initialize a valid payment session.</span>`;
    createFlowBtn.disabled = false;
    createFlowBtn.textContent = "Create Flow";
    createFlowBtn.classList.remove("opacity-50", "cursor-not-allowed");
    return;
  }

  loader.classList.add("hidden");
  
  let statusText = `✅ Your Payment Session ID is: ${paymentSession.id} | Email: ${email}`;
  if (selectedCustomerId) {
    statusText += ` | Customer ID: ${selectedCustomerId} (Stored cards enabled)`;
  }
  sessionStatus.textContent = statusText;
  sessionStatus.classList.remove("hidden");

  // Re-enable button
  createFlowBtn.disabled = false;
  createFlowBtn.textContent = "Create Flow";
  createFlowBtn.classList.remove("opacity-50", "cursor-not-allowed");

  initFlow();
});

// Allow manual input to reset customer selection
emailInput.addEventListener('input', () => {
  if (emailInput.disabled) return;
  
  selectedCustomerId = null;
  document.querySelectorAll('.use-customer-btn').forEach(btn => {
    btn.textContent = 'Use Customer';
    btn.classList.remove('bg-green-600', 'hover:bg-green-700');
    btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
  });
});

const initFlow = async () => {
  // Guarding initFlow against missing session
  if (!paymentSession || !paymentSession.id) {
    alert("Payment session not ready yet. Please wait...");
    return;
  }

  const componentOptions = getComponentOptions();
  console.log('Initializing Flow with componentOptions:', componentOptions);

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
