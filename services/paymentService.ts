// services/paymentService.ts
// This service handles communication with the payment backend (Midtrans Snap).
// It requests a Snap token from your backend and returns it to the caller.
// If no backend URL is configured via VITE_BACKEND_URL, a mock token will be
// returned in development mode so that the UI can still function without payment.

export interface PaymentPayload {
  productName: string;
  amount: number;
}

/**
 * Fetch a Snap payment token from the backend. The backend is expected to
 * expose a POST /create-transaction endpoint that accepts a JSON body with
 * `productName` and `amount` fields and returns an object with a `token` field.
 *
 * In development (`import.meta.env.MODE !== 'production'`), if the backend URL
 * is missing or the request fails, this function returns a mock token so the
 * payment flow can be simulated locally. In production, any error will be
 * propagated to the caller so it can be displayed to the user.
 */
export async function getSnapToken({ productName, amount }: PaymentPayload): Promise<string> {
  const baseUrl: string | undefined = (import.meta as any).env.VITE_BACKEND_URL;
  const isProduction: boolean = (import.meta as any).env.MODE === 'production';

  // If no backend URL is provided, fall back to mock token in dev
  if (!baseUrl) {
    if (isProduction) {
      throw new Error('Backend URL is not configured');
    }
    console.warn('[paymentService] VITE_BACKEND_URL not set, returning mock token');
    return 'MOCK_TOKEN_DEMO';
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/create-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, amount }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Backend responded with status ${response.status}`);
    }

    // The backend should return JSON with a `token` property.
    const data: any = await response.json();
    if (data && typeof data.token === 'string') {
      return data.token;
    }
    // Some backends might return the token directly as a string
    if (typeof data === 'string') {
      return data;
    }
    throw new Error('Invalid response from payment backend');
  } catch (err: any) {
    console.error('[paymentService] Failed to fetch Snap token:', err);
    if (!isProduction) {
      // In development, simulate the payment flow with a mock token
      return 'MOCK_TOKEN_DEMO';
    }
    throw err;
  }
}