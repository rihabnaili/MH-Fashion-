import { createHmac } from 'crypto';

type MofavoOrderItem = {
  productName?: {
    fr?: string;
    ar?: string;
  };
  quantity: number;
  price: number;
};

type MofavoOrder = {
  customer: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
  };
  items: MofavoOrderItem[];
  totalAmount: number;
};

type MofavoCreateOrderResult =
  | {
      enabled: true;
      success: true;
      externalOrderId: number;
    }
  | {
      enabled: true;
      success: false;
      error: string;
    }
  | {
      enabled: false;
      success: false;
      error: string;
    };

const MOFAVO_ENDPOINT = process.env.MOFAVO_API_URL || 'https://api.mofavo.com/external';
const MOFAVO_STATUS = process.env.MOFAVO_ORDER_STATUS || 'draft';
const MOFAVO_DEFAULT_CITY = process.env.MOFAVO_DEFAULT_CITY || 'Tunis';
const MOFAVO_DEFAULT_STATE = process.env.MOFAVO_DEFAULT_STATE || MOFAVO_DEFAULT_CITY;

function getMofavoCredentials() {
  const apiKey = process.env.MOFAVO_API_KEY;
  const apiSecret = process.env.MOFAVO_API_SECRET;
  const authToken = process.env.MOFAVO_AUTH_TOKEN;

  if (!apiKey || !apiSecret || !authToken) {
    return null;
  }

  return { apiKey, apiSecret, authToken };
}

function buildMofavoBody(order: MofavoOrder) {
  const address = order.customer.address?.trim() || MOFAVO_DEFAULT_CITY;
  const city = order.customer.city?.trim() || MOFAVO_DEFAULT_CITY;
  const state = order.customer.state?.trim() || MOFAVO_DEFAULT_STATE;

  return {
    data: {
      status: MOFAVO_STATUS,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        address,
        city,
        state,
      },
      cart: order.items.map((item) => ({
        name: item.productName?.fr || item.productName?.ar || 'MH Fashion product',
        quantity: item.quantity,
        pricePerUnit: item.price,
      })),
      total: {
        totalPrice: order.totalAmount,
      },
    },
  };
}

export async function createMofavoOrder(order: MofavoOrder): Promise<MofavoCreateOrderResult> {
  const credentials = getMofavoCredentials();

  if (!credentials) {
    return {
      enabled: false,
      success: false,
      error: 'Mofavo credentials are not configured',
    };
  }

  const rawBody = JSON.stringify(buildMofavoBody(order));
  const signature = createHmac('sha256', credentials.apiSecret)
    .update(rawBody)
    .digest('base64');

  try {
    const response = await fetch(MOFAVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-mofavo-api-key': credentials.apiKey,
        'x-mofavo-signature': signature,
        Authorization: `Bearer ${credentials.authToken}`,
      },
      body: rawBody,
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        enabled: true,
        success: false,
        error:
          responseBody?.error ||
          responseBody?.message ||
          `Mofavo API returned ${response.status}`,
      };
    }

    if (typeof responseBody?.id !== 'number') {
      return {
        enabled: true,
        success: false,
        error: 'Mofavo API did not return an order id',
      };
    }

    return {
      enabled: true,
      success: true,
      externalOrderId: responseBody.id,
    };
  } catch (error) {
    return {
      enabled: true,
      success: false,
      error: error instanceof Error ? error.message : 'Mofavo request failed',
    };
  }
}
