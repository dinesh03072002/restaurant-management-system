const { Order, Menu } = require('../models');
const { Op } = require('sequelize');

exports.getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todayOrders = await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [
        {
          model: Menu,
          as: 'menus',
          through: { attributes: ['quantity'] },
          required: false
        }
      ]
    });

    // Get today's paid orders
    const paidOrders = todayOrders.filter(order => order.paymentStatus === 'paid');
    
    // Calculate revenue from paid orders only
    const totalRevenue = paidOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount || 0);
    }, 0);

    // Calculate statistics
    const totalOrders = todayOrders.length;
    const completedOrders = todayOrders.filter(o => o.status === 'completed').length;
    const pendingOrders = todayOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const paidOrdersCount = paidOrders.length;
    const pendingPaymentOrders = todayOrders.filter(o => o.paymentStatus === 'pending').length;

    res.json({
      date: today,
      totalOrders,
      completedOrders,
      pendingOrders,
      paidOrders: paidOrdersCount,
      pendingPaymentOrders,
      totalRevenue,
      orders: todayOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        menus: order.menus?.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          OrderItem: item.OrderItem
        }))
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const dates = [];
    const revenues = [];
    const paidOrdersCount = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get paid orders for this date
      const paidOrders = await Order.findAll({
        where: {
          paymentStatus: 'paid',
          createdAt: {
            [Op.gte]: date,
            [Op.lt]: nextDate
          }
        }
      });

      const dailyRevenue = paidOrders.reduce((sum, order) => {
        return sum + parseFloat(order.totalAmount || 0);
      }, 0);
      
      dates.push(date.toISOString().split('T')[0]);
      revenues.push(dailyRevenue);
      paidOrdersCount.push(paidOrders.length);
    }

    res.json({ 
      dates, 
      revenues,
      paidOrders: paidOrdersCount,
      totalRevenue: revenues.reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ error: error.message });
  }
};