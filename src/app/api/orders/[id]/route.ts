import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Fetch single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const order = await Order.findById(params.id).lean();
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate status if provided
    if (body.status && !['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(body.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid status value' 
        },
        { status: 400 }
      );
    }
    
    const order = await Order.findByIdAndUpdate(
      params.id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).lean();
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Error updating order:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const order = await Order.findByIdAndDelete(params.id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting order:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
