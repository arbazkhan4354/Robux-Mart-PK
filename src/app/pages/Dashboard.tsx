import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, XCircle, Coins } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { ChatWidget } from '../components/ChatWidget';
import { AdminSetupInfo } from '../components/AdminSetup';
import { useAuth } from '../context/AuthContext';
import { API_URL, getAuthHeaders } from '../../lib/supabase';
import { toast } from 'sonner';

interface Order {
  id: string;
  packageId: string;
  robuxAmount: number;
  currency: string;
  totalPrice: number;
  paymentMethod: string;
  robloxUsername: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: getAuthHeaders(accessToken),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-400" size={20} />;
      case 'processing':
        return <Package className="text-blue-400" size={20} />;
      case 'completed':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      processing: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };

    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/10 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
    };

    return (
      <Badge variant={variants[status] || 'default'} className={colors[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentInstructions = (order: Order) => {
    const instructions: Record<string, string> = {
      easypaisa: 'Send payment to: 03XX-XXXXXXX (Contact support for details)',
      jazzcash: 'Send payment to: 03XX-XXXXXXX (Contact support for details)',
      binance: 'Contact support for crypto wallet address',
    };

    return instructions[order.paymentMethod] || 'Contact support for payment details';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Manage your orders and track your purchases</p>
      </motion.div>

      {/* Admin Setup Info */}
      {user?.role !== 'admin' && <AdminSetupInfo />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <Package className="text-purple-400" size={40} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-blue-400" size={40} />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold">
                  {orders.filter((o) => o.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="text-green-400" size={40} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
        
        {orders.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur border-purple-500/20">
            <Coins className="mx-auto mb-4 text-muted-foreground" size={64} />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start by purchasing your first Robux package!</p>
            <a href="/store" className="text-purple-400 hover:underline">
              Go to Store →
            </a>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-yellow-400/10">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {order.robuxAmount.toLocaleString()} Robux
                          </h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Order ID: {order.id}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Roblox Username: <span className="text-foreground">{order.robloxUsername}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Payment: {order.paymentMethod.toUpperCase()}
                        </p>
                        {order.status === 'pending' && (
                          <p className="text-sm text-yellow-400 mt-2">
                            💡 {getPaymentInstructions(order)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400 mb-2">
                        {order.currency} {order.totalPrice.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};