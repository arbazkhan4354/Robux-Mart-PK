import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Coins, Sparkles, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { API_URL, getAuthHeaders } from '../../lib/supabase';
import { toast } from 'sonner';

interface Package {
  id: string;
  amount: number;
  pricePKR: number;
  priceINR: number;
  popular?: boolean;
}

export const Store: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState<'PKR' | 'INR'>('PKR');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}/packages`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg: Package) => {
    if (!user) {
      toast.error('Please sign in to purchase');
      navigate('/login');
      return;
    }
    setSelectedPackage(pkg);
    setCustomAmount('');
    setShowOrderDialog(true);
  };

  const handleCustomPackage = () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      navigate('/login');
      return;
    }
    if (!customAmount || parseInt(customAmount) < 10) {
      toast.error('Minimum 10 Robux required');
      return;
    }
    // Calculate price (approximate)
    const pricePerRobux = currency === 'PKR' ? 3.125 : 1.125;
    setSelectedPackage({
      id: 'custom',
      amount: parseInt(customAmount),
      pricePKR: Math.ceil(parseInt(customAmount) * 3.125),
      priceINR: Math.ceil(parseInt(customAmount) * 1.125),
    });
    setShowOrderDialog(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPackage || !paymentMethod || !robloxUsername) {
      toast.error('Please fill all fields');
      return;
    }

    if (!accessToken) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        packageId: selectedPackage.id,
        robuxAmount: selectedPackage.amount,
        currency,
        totalPrice: currency === 'PKR' ? selectedPackage.pricePKR : selectedPackage.priceINR,
        paymentMethod,
        robloxUsername,
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      toast.success('Order placed successfully! Check your dashboard.');
      setShowOrderDialog(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to place order');
    }
  };

  const getPrice = (pkg: Package) => {
    return currency === 'PKR' ? pkg.pricePKR : pkg.priceINR;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Coins className="text-yellow-400" size={48} />
          </motion.div>
          <p className="mt-4 text-lg font-semibold">Loading packages...</p>
          <p className="text-sm text-muted-foreground">Preparing the best deals for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Package
          </h1>
          <p className="text-xl text-muted-foreground">Select the perfect Robux package for you</p>
        </motion.div>

        {/* Currency Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-purple-500/30 p-1 bg-card/50 backdrop-blur">
            <Button
              variant={currency === 'PKR' ? 'default' : 'ghost'}
              onClick={() => setCurrency('PKR')}
              className={currency === 'PKR' ? 'bg-purple-600' : ''}
            >
              PKR (Pakistani Rupee)
            </Button>
            <Button
              variant={currency === 'INR' ? 'default' : 'ghost'}
              onClick={() => setCurrency('INR')}
              className={currency === 'INR' ? 'bg-purple-600' : ''}
            >
              INR (Indian Rupee)
            </Button>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative p-6 bg-card/50 backdrop-blur border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer ${pkg.popular ? 'ring-2 ring-yellow-400/50' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-xs font-bold text-black">
                    <Sparkles className="inline mr-1" size={12} />
                    POPULAR
                  </div>
                )}

                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-yellow-400/10">
                    <Coins className="text-yellow-400" size={48} />
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-center mb-2">
                  {pkg.amount.toLocaleString()} Robux
                </h3>

                <div className="text-center mb-6">
                  <span className="text-2xl font-bold text-purple-400">
                    {currency} {getPrice(pkg).toLocaleString()}
                  </span>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => handlePackageSelect(pkg)}
                >
                  Purchase Now
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Custom Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Custom Amount</h2>
            <p className="text-muted-foreground text-center mb-6">
              Need a different amount? Enter custom Robux quantity
            </p>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Enter Robux amount (min. 10)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="10"
                className="flex-1"
              />
              <Button
                onClick={handleCustomPackage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Calculate
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              You're purchasing {selectedPackage?.amount.toLocaleString()} Robux
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-4 bg-purple-500/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="text-2xl font-bold text-purple-400">
                  {currency} {selectedPackage && getPrice(selectedPackage).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roblox-username">Roblox Username</Label>
              <Input
                id="roblox-username"
                placeholder="Enter your Roblox username"
                value={robloxUsername}
                onChange={(e) => setRobloxUsername(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-purple-500/30 hover:bg-purple-500/5 cursor-pointer">
                  <RadioGroupItem value="easypaisa" id="easypaisa" />
                  <Label htmlFor="easypaisa" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Easypaisa</div>
                    <div className="text-xs text-muted-foreground">Mobile wallet payment</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-purple-500/30 hover:bg-purple-500/5 cursor-pointer">
                  <RadioGroupItem value="jazzcash" id="jazzcash" />
                  <Label htmlFor="jazzcash" className="flex-1 cursor-pointer">
                    <div className="font-semibold">JazzCash</div>
                    <div className="text-xs text-muted-foreground">Mobile wallet payment</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-purple-500/30 hover:bg-purple-500/5 cursor-pointer">
                  <RadioGroupItem value="binance" id="binance" />
                  <Label htmlFor="binance" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Binance</div>
                    <div className="text-xs text-muted-foreground">Crypto payment</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={handlePlaceOrder}
            >
              <Check className="mr-2" size={18} />
              Place Order
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              After placing order, you'll receive payment instructions. Please complete payment and our team will process your order.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};