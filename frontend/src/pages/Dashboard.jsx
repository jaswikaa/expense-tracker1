import React, { useState, useEffect } from 'react';
import { transactionService, userService } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import TransactionForm from '../components/TransactionForm';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0
  });
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 0);
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const financialSummary = await transactionService.getSummary();
      setSummary(financialSummary);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Error loading dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await transactionService.create(transactionData);
      await loadDashboardData(); // Reload data to reflect changes
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction. Please try again.');
      throw error;
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      const budget = parseFloat(budgetInput);
      if (budget >= 0) {
        await userService.updateProfile({ monthlyBudget: budget });
        setMonthlyBudget(budget);
        setBudgetInput('');
        alert('Budget updated successfully!');
      } else {
        alert('Please enter a valid budget amount.');
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Error updating budget. Please try again.');
    }
  };

  const progressPercentage = monthlyBudget > 0 
    ? Math.min((summary.totalExpenses / monthlyBudget) * 100, 100)
    : 0;

  const rupeeFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <main className="dashboard-container">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-content">
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p>Here's your financial overview for today</p>
        </div>
        <div className="welcome-illustration">
          <div className="illustration">💰</div>
        </div>
      </div>

      {/* Enhanced Financial Summary with Focus on Income */}
      <div className="financial-highlights">
        {/* Main Income Card - More Prominent */}
        <div className="highlight-card income-highlight">
          <div className="highlight-content">
            <div className="highlight-icon">💵</div>
            <div className="highlight-details">
              <h2>Total Income</h2>
              <div className="highlight-amount">{rupeeFormatter.format(monthlyBudget)}</div>
              <p className="highlight-description">All income transactions this month</p>
            </div>
          </div>
          <div className="income-stats">
            <div className="stat-item">
              <span className="stat-label">Monthly Budget</span>
              <span className="stat-value">{rupeeFormatter.format(monthlyBudget)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Remaining</span>
              <span className="stat-value positive">
                {rupeeFormatter.format(monthlyBudget - summary.totalExpenses)}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="secondary-stats">
          <div className="stat-card expense-stat">
            <div className="stat-icon">📤</div>
            <div className="stat-content">
              <h4>Total Expenses</h4>
              <div className="stat-amount">{rupeeFormatter.format(summary.totalExpenses)}</div>
            </div>
          </div>
          
          <div className="stat-card savings-stat">
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              <h4>Net Savings</h4>
              <div className={`stat-amount ${summary.netSavings >= 0 ? 'positive' : 'negative'}`}>
                {rupeeFormatter.format(summary.netSavings)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Budget Tracking Card */}
        <div className="dashboard-card budget-card">
          <div className="card-header">
            <h2>Monthly Budget Progress</h2>
            <div className="budget-status">
              <span className={`status ${progressPercentage > 100 ? 'over-budget' : 'on-track'}`}>
                {progressPercentage > 100 ? 'Over Budget' : 'On Track'}
              </span>
            </div>
          </div>
          
          <div className="budget-progress">
            <div className="progress-info">
              <div className="progress-text">
                <span className="spent">{rupeeFormatter.format(summary.totalExpenses)} spent</span>
                <span className="separator">of</span>
                <span className="budget">{rupeeFormatter.format(monthlyBudget)} budget</span>
              </div>
              <div className="progress-percentage">{progressPercentage.toFixed(1)}%</div>
            </div>
            
            <div className="progress-bar-container">
              <div 
                className={`progress-fill ${progressPercentage > 100 ? 'over-budget' : ''}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            
            {progressPercentage > 100 && (
              <div className="budget-warning">
                <span className="warning-icon">⚠️</span>
                You've exceeded your monthly budget by {rupeeFormatter.format(summary.totalExpenses - monthlyBudget)}
              </div>
            )}
          </div>

          <form onSubmit={handleSetBudget} className="budget-form">
            <div className="form-group">
              <label htmlFor="budget-input">Set Monthly Budget</label>
              <div className="input-with-symbol">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  id="budget-input"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Enter amount..." 
                  min="0"
                  step="100"
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary full-width">
              Update Budget
            </button>
          </form>
        </div>

        {/* Add Transaction Card */}
        <div className="dashboard-card transaction-form-card">
          <div className="card-header">
            <h2>Add New Transaction</h2>
          </div>
          <TransactionForm onSubmit={handleAddTransaction} />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;