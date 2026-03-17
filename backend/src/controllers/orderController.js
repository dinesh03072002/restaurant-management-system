const { Order, Menu, OrderItem, sequelize } = require('../models');

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Generate unique order number
    const orderNumber = 'ORD' + Date.now();

    // Create order
    const order = await Order.create({
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending' // Default payment status
    }, { transaction: t });

    let totalAmount = 0;

    // Add order items
    for (const item of items) {
      const menuItem = await Menu.findByPk(item.menuId, { transaction: t });
      
      if (!menuItem) {
        await t.rollback();
        return res.status(404).json({ error: `Menu item ${item.menuId} not found` });
      }

      await OrderItem.create({
        orderId: order.id,
        menuId: item.menuId,
        quantity: item.quantity,
        price: menuItem.price
      }, { transaction: t });

      totalAmount += parseFloat(menuItem.price) * item.quantity;
    }

    // Update order total
    await order.update({ totalAmount }, { transaction: t });

    await t.commit();

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Menu,
          as: 'menus',
          through: { attributes: ['quantity'] }
        }
      ]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    await t.rollback();
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Menu,
          as: 'menus',
          through: { attributes: ['quantity'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Menu,
          as: 'menus',
          through: { attributes: ['quantity'] }
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'preparing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status });
    
    // Fetch updated order with associations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Menu,
          as: 'menus',
          through: { attributes: ['quantity'] }
        }
      ]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    // Validate payment status
    if (!['pending', 'paid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ paymentStatus });
    
    // Fetch updated order with associations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Menu,
          as: 'menus',
          through: { attributes: ['quantity'] }
        }
      ]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete associated order items first (cascade should handle this if set up)
    await OrderItem.destroy({ where: { orderId: id } });
    
    // Delete the order
    await order.destroy();
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: error.message });
  }
};