import React, { useState } from 'react';
import './TransactionForm.css';

const TransactionForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Groceries',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      // Reset form on success
      setFormData({
        amount: '',
        description: '',
        category: 'Groceries',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const categories = [
    'Groceries',
    'Entertainment',
    'Utilities',
    'Food & Drinks',
    'Transportation',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3>Add New Transaction</h3>
      
      <div className="form-group">
        <label htmlFor="type">Type:</label>
        <select 
          id="type"
          name="type" 
          value={formData.type} 
          onChange={handleChange}
          required
          className="form-select"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount (₹):</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="e.g., 500.00"
          min="0"
          step="0.01"
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., Coffee with a friend"
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="form-select"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary full-width"
        disabled={loading}
      >
        {loading ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
      </button>
    </form>
  );
};

export default TransactionForm;