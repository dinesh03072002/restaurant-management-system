const sequelize = require('../config/database');
const Menu = require('./Menu');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

const setupAssociations = () => {

  Order.belongsToMany(Menu, { 
    through: OrderItem, 
    foreignKey: 'orderId',
    otherKey: 'menuId',
    as: 'menus'
  });
  
  Menu.belongsToMany(Order, { 
    through: OrderItem, 
    foreignKey: 'menuId',
    otherKey: 'orderId',
    as: 'orders'
  });

  // Order has many OrderItems
  Order.hasMany(OrderItem, { 
    foreignKey: 'orderId',
    as: 'orderItems'
  });
  
  OrderItem.belongsTo(Order, { 
    foreignKey: 'orderId',
    as: 'order'
  });

  // Menu has many OrderItems
  Menu.hasMany(OrderItem, { 
    foreignKey: 'menuId',
    as: 'orderItems'
  });
  
  OrderItem.belongsTo(Menu, { 
    foreignKey: 'menuId',
    as: 'menu'
  });
};

// Run associations setup
setupAssociations();

module.exports = {
  sequelize,
  Menu,
  Order,
  OrderItem
};