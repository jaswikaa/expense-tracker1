import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import TransactionForm from '../components/TransactionForm';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await transactionService.getAll(params);
      setTransactions(response.transactions);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      alert('Error loading transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await transactionService.create(transactionData);
      await loadTransactions();
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction. Please try again.');
      throw error;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.delete(id);
        await loadTransactions();
        alert('Transaction deleted successfully!');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const rupeeFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  const categories = [
    'Groceries',
    'Entertainment',
    'Utilities',
    'Food & Drinks',
    'Transportation',
    'Other'
  ];

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h1>Transaction History</h1>
        <p>View and manage all your transactions</p>
      </div>

      <div className="transactions-content">
        <div className="sidebar">
          <div className="card">
            <h3>Add Transaction</h3>
            <TransactionForm onSubmit={handleAddTransaction} />
          </div>

          <div className="card filters-card">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <button 
              onClick={() => setFilters({ category: '', type: '', startDate: '', endDate: '' })}
              className="btn btn-secondary full-width"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="card">
            <div className="table-header">
              <h3>All Transactions</h3>
              <button onClick={loadTransactions} className="btn btn-secondary">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading transactions...</div>
            ) : (
              <>
                <div className="table-container">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(transaction => (
                        <tr key={transaction._id}>
                          <td>{new Date(transaction.date).toLocaleDateString('en-IN')}</td>
                          <td className="description">{transaction.description}</td>
                          <td>
                            <span className={`category-tag ${transaction.category.toLowerCase().replace(' & ', '-')}`}>
                              {transaction.category}
                            </span>
                          </td>
                          <td>
                            <span className={`type-badge ${transaction.type}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={transaction.type === 'expense' ? 'expense' : 'income'}>
                            {transaction.type === 'expense' ? '- ' : '+ '}
                            {rupeeFormatter.format(transaction.amount)}
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteTransaction(transaction._id)}
                              className="btn-danger"
                              title="Delete transaction"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan="6" className="no-data">
                            <div className="no-transactions">
                              <p>No transactions found</p>
                              <small>Try adjusting your filters or add a new transaction</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    
                    <span className="pagination-info">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;