import React, { useState, useEffect } from 'react';
import { transactionService, userService } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Reports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 0);
  const [budgetInput, setBudgetInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      // Get all data
      const [financialSummary, categoryData, allTransactions] = await Promise.all([
        transactionService.getSummary(params),
        transactionService.getCategoryBreakdown(),
        transactionService.getAll({ limit: 1000 })
      ]);

      console.log('Reports Summary:', financialSummary);
      console.log('Category Breakdown:', categoryData);

      setSummary(financialSummary);
      setCategoryBreakdown(categoryData);
      setTransactions(allTransactions.transactions || []);

      // If summary is zero, calculate from transactions
      if (financialSummary.totalExpenses === 0 && allTransactions.transactions?.length > 0) {
        const expenseTransactions = allTransactions.transactions.filter(t => t.type === 'expense');
        const incomeTransactions = allTransactions.transactions.filter(t => t.type === 'income');
        
        const calculatedExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const calculatedIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        if (calculatedExpenses > 0 || calculatedIncome > 0) {
          setSummary({
            totalIncome: calculatedIncome,
            totalExpenses: calculatedExpenses,
            netSavings: calculatedIncome - calculatedExpenses
          });
        }
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Error loading reports data. Please try again.');
    } finally {
      setLoading(false);
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

  const generateMonthlySpendingData = () => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const date = new Date(transaction.date);
        const monthYear = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += transaction.amount;
      }
    });
    
    // Sort by date and get last 6 months
    const sortedMonths = Object.keys(monthlyData)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-6);
    
    const sortedData = {};
    sortedMonths.forEach(month => {
      sortedData[month] = monthlyData[month];
    });
    
    return sortedData;
  };

  const progressPercentage = monthlyBudget > 0 
    ? Math.min((summary.totalExpenses / monthlyBudget) * 100, 100)
    : 0;

  const rupeeFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  // Monthly Spending Chart Data
  const monthlyData = generateMonthlySpendingData();
  const monthlyChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: Object.values(monthlyData),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  // Category Spending Chart Data
  const categoryChartData = {
    labels: categoryBreakdown.map(item => item._id),
    datasets: [
      {
        data: categoryBreakdown.map(item => item.total),
        backgroundColor: [
          '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${rupeeFormatter.format(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Generating your reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Financial Reports</h1>
        <p>Get insights into your spending habits and financial health</p>
        
        <div className="date-filters">
          <div className="filter-group">
            <label>From Date</label>
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>To Date</label>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <button 
            onClick={loadReportsData}
            className="btn btn-primary"
          >
            Apply Filter
          </button>
          <button 
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
            className="btn btn-secondary"
          >
            Clear Dates
          </button>
        </div>
      </div>

      {/* Financial Overview with Budget */}
      <div className="financial-overview">
        <div className="overview-card income-card">
          <div className="card-icon">📥</div>
          <div className="card-content">
            <h3>Total Income</h3>
            <div className="amount">{rupeeFormatter.format(monthlyBudget)}</div>
            <p>All income sources</p>
          </div>
        </div>

        <div className="overview-card expense-card">
          <div className="card-icon">📤</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <div className="amount">{rupeeFormatter.format(summary.totalExpenses)}</div>
            <p>Your total spending</p>
          </div>
        </div>

       

        <div className="overview-card savings-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Net Savings</h3>
            <div className={`amount ${summary.netSavings >= 0 ? 'positive' : 'negative'}`}>
              {rupeeFormatter.format(summary.netSavings)}
            </div>
            <p>Income minus expenses</p>
          </div>
        </div>
      </div>

      
         
         

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Monthly Spending Overview</h3>
          <div className="chart-container">
            {Object.keys(monthlyData).length > 0 ? (
              <Bar data={monthlyChartData} options={chartOptions} />
            ) : (
              <div className="no-chart-data">
                <p>No monthly data available</p>
                <small>Add some expenses to see your spending trends</small>
              </div>
            )}
          </div>
        </div>
        
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <div className="chart-container">
            {categoryBreakdown.length > 0 ? (
              <Pie data={categoryChartData} options={pieChartOptions} />
            ) : (
              <div className="no-chart-data">
                <p>No category data available</p>
                <small>Add some expenses to see category breakdown</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card">
        <h3>Detailed Category Breakdown</h3>
        <div className="table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Spent</th>
                <th>Transactions</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item) => {
                const percentage = summary.totalExpenses > 0 
                  ? ((item.total / summary.totalExpenses) * 100).toFixed(1)
                  : 0;
                  
                return (
                  <tr key={item._id}>
                    <td>
                      <span className={`category-tag ${item._id.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}>
                        {item._id}
                      </span>
                    </td>
                    <td className="expense">{rupeeFormatter.format(item.total)}</td>
                    <td>{item.count}</td>
                    <td>
                      <div className="percentage-bar">
                        <div 
                          className="percentage-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <span className="percentage-text">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {categoryBreakdown.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-data">
                    No expense data available. Start adding transactions to see reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;