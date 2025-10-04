import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';

function Home() {
  const navigate = useNavigate();

  const stats = [
    { 
      title: 'Total Users', 
      value: '24', 
      change: '+5', 
      icon: '👥',
      description: 'Active users'
    },
    { 
      title: 'Total Customers', 
      value: '156', 
      change: '+12', 
      icon: '👨‍💼',
      description: 'Registered customers'
    },
    { 
      title: 'Revenue', 
      value: '₿12.4K', 
      change: '+8.2%', 
      icon: '💰',
      description: 'This month'
    },
    { 
      title: 'Pending Tasks', 
      value: '8', 
      change: '-3', 
      icon: '📝',
      description: 'Awaiting action'
    }
  ];

  const quickActions = [
    {
      title: 'Create New User',
      description: 'Add new admin/user account',
      icon: '👥',
      buttonText: 'Create User',
      path: '/users',
      variant: 'primary'
    },
    {
      title: 'Add Customer',
      description: 'Register new customer',
      icon: '👨‍💼',
      buttonText: 'Add Customer',
      path: '/customers',
      variant: 'success'
    },
    {
      title: 'View Reports',
      description: 'Analytics and insights',
      icon: '📊',
      buttonText: 'View Reports',
      path: '/reports',
      variant: 'info'
    },
    {
      title: 'System Settings',
      description: 'Configure application',
      icon: '⚙️',
      buttonText: 'Settings',
      path: '/settings',
      variant: 'warning'
    }
  ];

  const recentActivities = [
    { action: 'New user "john_doe" created', time: '2 minutes ago', icon: '✅' },
    { action: 'Customer "PT. Example" registered', time: '1 hour ago', icon: '✅' },
    { action: 'Password reset for "jane_smith"', time: '2 hours ago', icon: '🔄' },
    { action: 'System backup completed', time: '5 hours ago', icon: '💾' },
    { action: 'Monthly report generated', time: '1 day ago', icon: '📈' }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard</h2>
          <p className="text-muted mb-0">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-end">
          <small className="text-muted">Last updated: Just now</small>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col xl={3} lg={6} md={6} className="mb-3" key={index}>
            <Card className="stat-card h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title text-muted mb-2">{stat.title}</h6>
                    <h3 className="text-primary mb-1">{stat.value}</h3>
                    <small className={`text-${stat.change.startsWith('+') ? 'success' : 'danger'} fw-bold`}>
                      {stat.change}
                    </small>
                    <p className="text-muted small mb-0">{stat.description}</p>
                  </div>
                  <div className="display-4 text-muted opacity-25">
                    {stat.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions & Recent Activity */}
      <Row>
        {/* Quick Actions */}
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {quickActions.map((action, index) => (
                  <Col lg={6} className="mb-3" key={index}>
                    <div className="border rounded p-3 h-100">
                      <div className="d-flex align-items-start mb-2">
                        <span className="display-6 me-3">{action.icon}</span>
                        <div>
                          <h6 className="mb-1">{action.title}</h6>
                          <p className="text-muted small mb-2">{action.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={action.variant} 
                        size="sm" 
                        className="w-100"
                        onClick={() => action.path && navigate(action.path)}
                      >
                        {action.buttonText}
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="list-group-item border-0 py-3">
                    <div className="d-flex align-items-start">
                      <span className="me-3">{activity.icon}</span>
                      <div className="flex-grow-1">
                        <p className="mb-1 small">{activity.action}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}

export default Home;