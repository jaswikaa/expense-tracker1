import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Spendr</h1>
          <p className="hero-subtitle">
            Your simple solution for tracking expenses and managing your budget effectively.
          </p>
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">💰</span>
              <h3>Track Expenses</h3>
              <p>Monitor your spending across different categories</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <h3>Visual Reports</h3>
              <p>Get insights with beautiful charts and analytics</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <h3>Set Goals</h3>
              <p>Create and track your monthly budget goals</p>
            </div>
          </div>
          
          {user ? (
            <div className="cta-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <Link to="/transactions" className="btn btn-secondary">
                View Transactions
              </Link>
            </div>
          ) : (
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Choose Spendr?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your financial data is encrypted and secure. We prioritize your privacy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Access your finances from any device - desktop, tablet, or mobile.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">🚀</div>
              <h3>Easy to Use</h3>
              <p>Simple, intuitive interface that makes expense tracking effortless.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">📈</div>
              <h3>Smart Insights</h3>
              <p>Get actionable insights to improve your financial health.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
