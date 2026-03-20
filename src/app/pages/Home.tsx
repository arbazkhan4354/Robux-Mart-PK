import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Coins, Shield, Zap, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AdminSetupInfo } from '../components/AdminSetup';

const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const Home: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 text-yellow-400 opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Coins size={60} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-purple-400 opacity-20"
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Coins size={80} />
        </motion.div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Buy Robux in PKR & INR Easily
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Trusted by thousands of players. Fast delivery, secure payments, and 24/7 support.
            </p>
            
            <Link to="/store">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50"
                >
                  <Coins className="mr-2" size={24} />
                  Buy Now
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto"
          >
            <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Users className="text-green-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold">Trusted by 10,000+ Players</h3>
                <p className="text-sm text-muted-foreground">Join our growing community</p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Zap className="text-blue-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Instant to 24 hours max</p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Shield className="text-purple-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">100% safe and encrypted</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-purple-900/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Live Statistics
            </h2>
            <p className="text-muted-foreground">Real-time data from our platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <TrendingUp className="mx-auto mb-3 text-purple-400" size={40} />
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  <CountUp end={10234} />
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                <CheckCircle className="mx-auto mb-3 text-blue-400" size={40} />
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  <CountUp end={45678} />
                </div>
                <div className="text-sm text-muted-foreground">Orders Completed</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 text-center bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <Coins className="mx-auto mb-3 text-yellow-400" size={40} />
                <div className="text-4xl font-bold text-yellow-400 mb-2">
                  <CountUp end={2} suffix="M+" />
                </div>
                <div className="text-sm text-muted-foreground">Robux Delivered</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <Shield className="mx-auto mb-3 text-green-400" size={40} />
                <div className="text-4xl font-bold text-green-400 mb-2">
                  <CountUp end={99} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Robux Mart PK?
            </h2>
            <p className="text-muted-foreground">We provide the best service in the market</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Zap, title: 'Instant Delivery', desc: 'Get your Robux within minutes of purchase' },
              { icon: Shield, title: '100% Secure', desc: 'All transactions are encrypted and safe' },
              { icon: Users, title: '24/7 Support', desc: 'Our team is always here to help you' },
              { icon: CheckCircle, title: 'Verified Seller', desc: 'Trusted by thousands of satisfied customers' },
              { icon: Coins, title: 'Best Prices', desc: 'Competitive rates in PKR and INR' },
              { icon: TrendingUp, title: 'Fast Growing', desc: 'Join our rapidly expanding community' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 bg-card/50 backdrop-blur border-purple-500/20 hover:border-purple-500/40 transition-all h-full">
                  <feature.icon className="text-purple-400 mb-4" size={40} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and get your Robux today!
            </p>
            <Link to="/store">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Browse Store
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-purple-500/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Robux Mart PK. All rights reserved.</p>
          <p className="mt-2">Secure • Fast • Trusted</p>
        </div>
      </footer>
    </div>
  );
};