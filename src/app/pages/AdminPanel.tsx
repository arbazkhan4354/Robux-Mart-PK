import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Users,
  Package,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  Settings,
  DollarSign,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { API_URL, getAuthHeaders } from '../../lib/supabase';
import { toast } from 'sonner';

interface Order {
  id: string;
  userId: string;
  robuxAmount: number;
  currency: string;
  totalPrice: number;
  paymentMethod: string;
  robloxUsername: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Chat {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: any;
}

interface Stats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface RobuxPackage {
  id: string;
  amount: number;
  pricePKR: number;
  priceINR: number;
  popular?: boolean;
}

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [packages, setPackages] = useState<RobuxPackage[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Package form
  const [packageForm, setPackageForm] = useState({
    amount: '',
    pricePKR: '',
    priceINR: '',
    popular: false,
  });

  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const fetchAllData = async () => {
    if (!accessToken) return;

    try {
      await Promise.all([
        fetchStats(),
        fetchOrders(),
        fetchUsers(),
        fetchChats(),
        fetchPackages(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders(accessToken!),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: getAuthHeaders(accessToken!),
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(accessToken!),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/chats`, {
        headers: getAuthHeaders(accessToken!),
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}/packages`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(accessToken!),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Order status updated');
        fetchOrders();
        fetchStats();
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      console.error('Update order error:', error);
      toast.error('Failed to update order');
    }
  };

  const fetchChatMessages = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/chat/${userId}`, {
        headers: getAuthHeaders(accessToken!),
      });
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken!),
        body: JSON.stringify({
          chatUserId: selectedChat,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchChatMessages(selectedChat);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  const handleAddPackage = async () => {
    if (!packageForm.amount || !packageForm.pricePKR || !packageForm.priceINR) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/packages`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken!),
        body: JSON.stringify({
          amount: parseInt(packageForm.amount),
          pricePKR: parseInt(packageForm.pricePKR),
          priceINR: parseInt(packageForm.priceINR),
          popular: packageForm.popular,
        }),
      });

      if (response.ok) {
        toast.success('Package added successfully');
        setPackageForm({ amount: '', pricePKR: '', priceINR: '', popular: false });
        fetchPackages();
      } else {
        toast.error('Failed to add package');
      }
    } catch (error) {
      console.error('Add package error:', error);
      toast.error('Failed to add package');
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    try {
      const response = await fetch(`${API_URL}/packages/${packageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(accessToken!),
      });

      if (response.ok) {
        toast.success('Package deleted');
        fetchPackages();
      } else {
        toast.error('Failed to delete package');
      }
    } catch (error) {
      console.error('Delete package error:', error);
      toast.error('Failed to delete package');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="mx-auto mb-4 text-yellow-400 animate-pulse" size={64} />
          <p className="text-muted-foreground">Loading admin panel...</p>
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
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-yellow-400" size={40} />
          <h1 className="text-4xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">Manage your Robux Mart platform</p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <Users className="text-purple-400 mb-3" size={32} />
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <Package className="text-blue-400 mb-3" size={32} />
          <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <TrendingUp className="text-yellow-400 mb-3" size={32} />
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-bold">{stats.pendingOrders}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <TrendingUp className="text-green-400 mb-3" size={32} />
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-bold">{stats.completedOrders}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/30">
          <DollarSign className="text-pink-400 mb-3" size={32} />
          <p className="text-sm text-muted-foreground mb-1">Revenue</p>
          <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">All Orders</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Robux Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell>{order.robuxAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        {order.currency} {order.totalPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                      <TableCell>{order.robloxUsername}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.status === 'completed'
                              ? 'bg-green-500/10 text-green-400'
                              : order.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">All Users</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>User ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">Add New Package</h2>
              <div className="space-y-4">
                <div>
                  <Label>Robux Amount</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 800"
                    value={packageForm.amount}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Price in PKR</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2300"
                    value={packageForm.pricePKR}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, pricePKR: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Price in INR</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 750"
                    value={packageForm.priceINR}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, priceINR: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={packageForm.popular}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, popular: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="popular" className="cursor-pointer">
                    Mark as Popular
                  </Label>
                </div>
                <Button
                  onClick={handleAddPackage}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Add Package
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">Existing Packages</h2>
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-purple-500/20 bg-purple-500/5"
                  >
                    <div>
                      <p className="font-semibold">
                        {pkg.amount.toLocaleString()} Robux
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PKR {pkg.pricePKR} / INR {pkg.priceINR}
                      </p>
                      {pkg.popular && (
                        <Badge className="mt-1 bg-yellow-400/10 text-yellow-400">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Chats Tab */}
        <TabsContent value="chats">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20">
              <h2 className="text-xl font-bold mb-4">Active Chats</h2>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.userId}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedChat === chat.userId
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-purple-500/20 hover:bg-purple-500/5'
                      }`}
                      onClick={() => {
                        setSelectedChat(chat.userId);
                        fetchChatMessages(chat.userId);
                      }}
                    >
                      <p className="font-semibold">{chat.userName}</p>
                      <p className="text-xs text-muted-foreground">{chat.userEmail}</p>
                      <p className="text-sm mt-2 text-muted-foreground truncate">
                        {chat.lastMessage?.message}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur border-purple-500/20">
              <h2 className="text-xl font-bold mb-4">
                {selectedChat ? 'Chat Messages' : 'Select a chat'}
              </h2>
              {selectedChat ? (
                <>
                  <ScrollArea className="h-[500px] mb-4 p-4 border border-purple-500/20 rounded-lg">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.isAdmin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.isAdmin
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm font-semibold mb-1">
                              {msg.senderName}
                            </p>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <Button
                      onClick={sendChatMessage}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Send
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                  <MessageCircle size={64} className="opacity-20" />
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
