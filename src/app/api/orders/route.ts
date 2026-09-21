import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { withTotalItems } from '@/models/Order';
import Product from '@/models/Product';
import { createMofavoOrder } from '@/lib/mofavo';
import { DELIVERY_FEE, MAX_ITEM_QUANTITY, MAX_ORDER_ITEMS } from '@/lib/orderPricing';
import { buildProductImagePath, resolveProductImageCount } from '@/lib/productImageUrls';
import { escapeRegex, parsePagination } from '@/lib/queryUtils';

export const dynamic = 'force-dynamic';

const NO_OPTION = '-';

class OrderValidationError extends Error {}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function generateOrderNumber() {
  const now = new Date();
  const datePart = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const randomPart = randomBytes(3).toString('hex').toUpperCase();
  return `MH-${datePart}-${randomPart}`;
}

type RequestedItem = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

function parseRequestedItems(rawItems: unknown): RequestedItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new OrderValidationError('Order must contain at least one item');
  }

  if (rawItems.length > MAX_ORDER_ITEMS) {
    throw new OrderValidationError(`An order cannot contain more than ${MAX_ORDER_ITEMS} items`);
  }

  return rawItems.map((rawItem) => {
    const productId = cleanString(rawItem?.productId, 24);
    const quantity = Number(rawItem?.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new OrderValidationError('Invalid product id');
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
      throw new OrderValidationError(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}`);
    }

    return {
      productId,
      size: cleanString(rawItem?.size, 10) || NO_OPTION,
      color: cleanString(rawItem?.color, 60) || NO_OPTION,
      quantity,
    };
  });
}

// Prices, names and totals always come from the database, never from the client.
async function buildOrderItems(requestedItems: RequestedItem[]) {
  const productIds = [...new Set(requestedItems.map((item) => item.productId))];
  const products = (await Product.find({ _id: { $in: productIds } })
    .select('name price originalPrice size color disabledColors availability imageCount')
    .lean()) as any[];
  const productsById = new Map(products.map((product) => [String(product._id), product]));

  return requestedItems.map((item) => {
    const product = productsById.get(item.productId);

    if (!product || !product.availability) {
      throw new OrderValidationError('A product in your order is no longer available');
    }

    const sizes: string[] = Array.isArray(product.size) ? product.size : [];
    const colors: string[] = Array.isArray(product.color) ? product.color : [];
    const disabledColors: string[] = Array.isArray(product.disabledColors)
      ? product.disabledColors
      : [];

    if (sizes.length > 0 ? !sizes.includes(item.size) : item.size !== NO_OPTION) {
      throw new OrderValidationError('Selected size is not available');
    }

    if (
      colors.length > 0
        ? !colors.includes(item.color) || disabledColors.includes(item.color)
        : item.color !== NO_OPTION
    ) {
      throw new OrderValidationError('Selected color is not available');
    }

    return {
      productId: item.productId,
      productName: {
        fr: product.name?.fr || product.name?.ar || 'Produit',
        ar: product.name?.ar || product.name?.fr || 'Produit',
      },
      price: product.price,
      originalPrice:
        typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      images: resolveProductImageCount(product) > 0 ? [buildProductImagePath(item.productId, 0)] : [],
    };
  });
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const customer = {
      name: cleanString(body.customer?.name, 100),
      phone: cleanString(body.customer?.phone, 30),
      address: cleanString(body.customer?.address, 500),
    };

    if (!customer.name || !customer.phone) {
      return NextResponse.json(
        { success: false, message: 'Customer phone and name are required' },
        { status: 400 }
      );
    }

    if (!/^\+?[0-9\s]{8,20}$/.test(customer.phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    const requestedItems = parseRequestedItems(body.items);

    await connectDB();

    const items = await buildOrderItems(requestedItems);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = items.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);
    const totalAmount = roundMoney(subtotal + DELIVERY_FEE);

    // Retry in the unlikely event of an order number collision.
    let order;
    for (let attempt = 0; attempt < 3 && !order; attempt += 1) {
      try {
        order = await Order.create({
          orderNumber: generateOrderNumber(),
          customer,
          items,
          totalAmount,
          totalDiscount: roundMoney(totalDiscount),
          status: 'pending',
        });
      } catch (error: any) {
        if (error?.code !== 11000 || attempt === 2) {
          throw error;
        }
      }
    }

    if (!order) {
      throw new Error('Failed to create order');
    }

    const mofavoResult = await createMofavoOrder({
      customer,
      items,
      totalAmount,
    });

    if (mofavoResult.success) {
      order.mofavo = {
        syncStatus: 'synced',
        externalOrderId: mofavoResult.externalOrderId,
        syncedAt: new Date(),
      };
    } else {
      order.mofavo = {
        syncStatus: mofavoResult.enabled ? 'failed' : 'notConfigured',
        error: mofavoResult.error,
      };
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderNumber: order.orderNumber,
        orderId: order._id,
        totalAmount,
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating order:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET - Fetch all orders (for admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const { limit, page, skip } = parsePagination(searchParams, 20, 100);
    const search = escapeRegex((searchParams.get('search') || '').trim().slice(0, 100));

    // Build query
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order: any) => withTotalItems(order)),
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders: total,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
