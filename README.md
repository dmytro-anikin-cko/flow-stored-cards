# Flow Stored Cards Demo

A demo application showcasing Checkout.com's Flow component with stored card functionality. This project demonstrates how to integrate Flow to collect payment information, store customer cards, and enable returning customers to pay with their saved cards.

## Features

- **Customer Management**: View and reuse previously created customers
- **CVV Capture Toggle**: Optional CVV capture for stored card payments (required for some regions like Mada)

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, Tailwind CSS
- **Payment Processing**: Checkout.com Payment Sessions & Flow Component
- **Storage**: Browser localStorage for customer tracking
- **Deployment**: Render (or any Node.js hosting platform)

## Prerequisites

- Node.js 18.20.5 or higher
- Checkout.com sandbox account
- Checkout.com secret & public keys

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/flow-stored-cards.git
   cd flow-stored-cards
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create a `.env` file in the root directory:
   ```env
   CKO_SECRET_KEY=your_checkout_secret_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:3000`

## How to Use

### First Payment (New Customer)

1. Enter a customer email or click **"Random"** to generate one
2. Click **"Create Flow"** to initialize the payment component
3. Input a test card (ex. below)
4. Complete the payment and get redirected to the success page

### Using Stored Cards

1. Return to the homepage
2. In the **"Created Customers"** section, click **"Use Customer"** on a saved customer
3. (Optional) Use the CVV toggle to enable CVV capturing
4. Click **"Create Flow"**
5. The Flow component will now show the stored card option

## Test Cards

Use these Checkout.com test cards:

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4242 4242 4242 4242 | Any future date | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Declined |

## Project Structure

```
flow-stored-cards/
├── public/
│   ├── index.html          # Main page with email input and Flow
│   ├── success.html        # Payment success page
│   ├── failure.html        # Payment failure page
│   └── script.js           # Frontend logic
├── server.js               # Express server with API endpoints
├── package.json            # Project dependencies
├── .env                    # Environment variables (not in git)
└── README.md              # This file
```

