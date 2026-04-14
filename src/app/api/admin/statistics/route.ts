import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // 'today', 'week', 'month', 'all'
    
    // Calculate date range
    const now = new Date();
    let startDate: Date | null = null;
    
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }
    
    // Build date query
    const dateQuery = startDate ? { createdAt: { $gte: startDate } } : {};
    
    // Get all orders for the period
    const orders = await Order.find(dateQuery).lean();
    
    // Calculate order statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalDiscount = orders.reduce((sum, order) => sum + (order.totalDiscount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Orders by status
    const ordersByStatus = orders.reduce((acc: any, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Revenue by status (only completed orders)
    const completedStatuses = ['delivered', 'shipped', 'processing'];
    const completedRevenue = orders
      .filter(order => completedStatuses.includes(order.status))
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Orders over time (last 30 days for chart)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentOrders = await Order.find({ 
      createdAt: { $gte: last30Days } 
    }).sort({ createdAt: 1 }).lean();
    
    // Group orders by date
    const ordersByDate = recentOrders.reduce((acc: any, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Revenue by date
    const revenueByDate = recentOrders.reduce((acc: any, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (order.totalAmount || 0);
      return acc;
    }, {});
    
    // Product statistics
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ availability: true });
    const outOfStockProducts = totalProducts - availableProducts;
    
    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Top selling products (by quantity in orders)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);
    
    // Total items sold
    const totalItemsSold = orders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum: number, item: any) => 
        itemSum + (item.quantity || 0), 0) || 0);
    }, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        period,
        overview: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalDiscount: Math.round(totalDiscount * 100) / 100,
          completedRevenue: Math.round(completedRevenue * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          totalItemsSold
        },
        orders: {
          byStatus: ordersByStatus,
          byDate: ordersByDate,
          recentCount: recentOrders.length
        },
        revenue: {
          byDate: revenueByDate,
          total: Math.round(totalRevenue * 100) / 100,
          completed: Math.round(completedRevenue * 100) / 100
        },
        products: {
          total: totalProducts,
          available: availableProducts,
          outOfStock: outOfStockProducts,
          byCategory: productsByCategory.reduce((acc: any, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        topProducts: topProducts.map(product => ({
          productId: product._id,
          name: product.productName,
          quantity: product.totalQuantity,
          revenue: Math.round(product.totalRevenue * 100) / 100
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

