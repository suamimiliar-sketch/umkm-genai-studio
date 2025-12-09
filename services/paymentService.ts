
export interface PaymentDetails {
  productName: string;
  amount: number;
}

// In a real application, this would call your backend to create a transaction 
// and get a Snap Token from Midtrans.
/**
 * Retrieve a Midtrans Snap token for a given transaction.
 *
 * If a backend URL is provided via the `VITE_BACKEND_URL` environment variable,
 * this function will attempt to create a real transaction by sending a POST
 * request to `${VITE_BACKEND_URL}/create-transaction` with the payment details.
 * The backend is expected to respond with a JSON payload containing a `token`
 * property.  The returned token can then be passed directly to `window.snap.pay`.
 *
 * When no backend URL is configured, or if the request fails, a mock token
 * (`"MOCK_TOKEN_DEMO"`) is returned.  The app treats this token as a simulation
 * and uses a confirmation dialog to emulate payment.
 */
export const getSnapToken = async (details: PaymentDetails): Promise<string> => {
  console.log("Initiating payment for:", details);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // If no backend URL is set, fall back to simulation mode
  if (!backendUrl) {
    console.warn(
      "VITE_BACKEND_URL is not defined. Falling back to mock token for payment simulation."
    );
    return "MOCK_TOKEN_DEMO";
  }

  try {
    const response = await fetch(`${backendUrl}/create-transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (data && typeof data.token === "string" && data.token.length > 0) {
      return data.token;
    }
    throw new Error("Invalid token response from backend");
  } catch (err) {
    console.error("Error fetching Snap token:", err);
    // As a safety net, return the mock token if the real call fails.  The frontend
    // will then fall back to simulation mode.
    return "MOCK_TOKEN_DEMO";
  }
};
