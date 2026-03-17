const Menu = require('../models/Menu');


exports.getAllMenuItems = async (req, res) => {
  try {
    const items = await Menu.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category and price are required' });
    }

    const menuItem = await Menu.create({
      name,
      category,
      price,
      description
    });
    
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, isAvailable } = req.body;

    const menuItem = await Menu.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await menuItem.update({
      name,
      category,
      price,
      description,
      isAvailable
    });

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await Menu.findByPk(id);
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await menuItem.destroy();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};