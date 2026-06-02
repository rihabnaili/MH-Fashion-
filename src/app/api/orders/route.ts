import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { createMofavoOrder } from '@/lib/mofavo';

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['customer', 'items', 'totalAmount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate customer info
    if (!body.customer.phone || !body.customer.name) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Customer phone and name are required' 
        },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order must contain at least one item' 
        },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = 'MH-' + Date.now().toString().slice(-6);
    
    // Create order
    const order = new Order({
      orderNumber,
      customer: body.customer,
      items: body.items,
      totalAmount: body.totalAmount,
      totalDiscount: body.totalDiscount || 0,
      status: 'pending'
    });

    await order.save();

    const mofavoResult = await createMofavoOrder({
      customer: body.customer,
      items: body.items,
      totalAmount: body.totalAmount,
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
        mofavo: order.mofavo
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    
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
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
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
        orders,
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
