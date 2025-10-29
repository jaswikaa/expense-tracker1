const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type } = req.query;
    
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Get recent transactions (for dashboard)
router.get('/recent', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent transactions', error: error.message });
  }
});

// Create transaction
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, category, type, date } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      amount,
      description,
      category,
      type,
      date: date || new Date()
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
});

// Get financial summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const match = { user: req.user._id };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const income = summary.find(s => s._id === 'income')?.total || 0;
    const expenses = summary.find(s => s._id === 'expense')?.total || 0;

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating summary', error: error.message });
  }
});

// Get spending by category
router.get('/category-breakdown', auth, async (req, res) => {
  try {
    const breakdown = await Transaction.aggregate([
      { 
        $match: { 
          user: req.user._id,
          type: 'expense'
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(breakdown);
  } catch (error) {
    res.status(500).json({ message: 'Error generating category breakdown', error: error.message });
  }
});

module.exports = router;