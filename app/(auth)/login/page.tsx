'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Eye, EyeOff } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: {
    viewOrders: boolean;
    manageOrders: boolean;
    addMenuItems: boolean;
    editMenuItems: boolean;
    globalSettings: boolean;
    manageStaff: boolean;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load demo users + staff created from Staffs page
  useEffect(() => {
    const loadUsers = () => {
      const demoUsers: User[] = [
        {
          id: 1,
          name: "Restaurant Owner",
          email: "owner@yoh.com",
          password: "owner123",
          role: "Owner",
          permissions: { viewOrders: true, manageOrders: true, addMenuItems: true, editMenuItems: true, globalSettings: true, manageStaff: true }
        },
        {
          id: 2,
          name: "Rahul Sharma",
          email: "rahul@yoh.com",
          password: "manager123",
          role: "Manager",
          permissions: { viewOrders: true, manageOrders: true, addMenuItems: true, editMenuItems: true, globalSettings: false, manageStaff: false }
        },
        {
          id: 3,
          name: "Priya Thapa",
          email: "priya@yoh.com",
          password: "waiter123",
          role: "Waiter",
          permissions: { viewOrders: true, manageOrders: false, addMenuItems: false, editMenuItems: false, globalSettings: false, manageStaff: false }
        }
      ];

      const savedStaff = localStorage.getItem('staffList');
      let createdStaff: User[] = [];

      if (savedStaff) {
        const staffList = JSON.parse(savedStaff);
        createdStaff = staffList.map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          email: staff.email,
          password: staff.password || 'password123',
          role: staff.role,
          permissions: staff.permissions,
        }));
      }

      const combined = [...demoUsers];
      createdStaff.forEach(staff => {
        if (!combined.some(u => u.email === staff.email)) {
          combined.push(staff);
        }
      });

      setAllUsers(combined);
    };

    loadUsers();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = allUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (user) {
        login({
          id: user.id,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        });

        // Redirect directly to Dashboard
        router.push('/restaurant-admin');
        router.refresh();        
      } else {
        setError('Invalid email or password. Try the accounts below.');
      }
      setIsLoading(false);
    }, 600);
  };

  const quickLogin = (user: User) => {
    login({
      id: user.id,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    });
    router.push('/restaurant-admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#513012] to-[#5D0565] rounded-2xl flex items-center justify-center">
              <span className="text-white text-3xl font-bold">Y</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#513012] tracking-tight">YOH</h1>
              <p className="text-sm text-gray-500">Restaurant Admin</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-[#513012]/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-[#513012]">Welcome Back</CardTitle>
            <p className="text-gray-600">Sign in to your restaurant dashboard</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@yoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <Button 
                type="submit" 
                className="w-full bg-[#513012] hover:bg-[#513012]/90 text-white py-6 text-base"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                <LogIn className="ml-2 w-5 h-5" />
              </Button>
            </form>

            {/* Available Accounts */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3 text-center">
                Available Accounts (Click to login)
              </p>
              <div className="grid gap-2 max-h-80 overflow-y-auto">
                {allUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="outline"
                    className="justify-start h-auto py-3 text-left"
                    onClick={() => quickLogin(user)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email} • {user.role}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Password: <span className="font-medium">{user.password}</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}