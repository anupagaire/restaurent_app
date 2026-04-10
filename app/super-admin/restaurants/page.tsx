'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

import AddRestaurantModal from '@/components/super-admin/AddRestaurantModal';
import EditRestaurantModal from '@/components/super-admin/EditRestaurantModal';

interface Restaurant {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    {
      id: 1,
      name: "The Royal Spice",
      owner: "Ram Sharma",
      email: "ram@royalspice.com",
      phone: "+977 9841234567",
      address: "Thamel, Kathmandu",
      status: "active",
      createdAt: "2025-01-15",
    },
    {
      id: 2,
      name: "Himalayan Flavors",
      owner: "Sita Gurung",
      email: "sita@himalayan.com",
      phone: "+977 9812345678",
      address: "Lazimpat, Kathmandu",
      status: "active",
      createdAt: "2025-02-20",
    },
    {
      id: 3,
      name: "Momo Kingdom",
      owner: "Shyam Thapa",
      email: "shyam@momokingdom.com",
      phone: "+977 9861234567",
      address: "Boudha, Kathmandu",
      status: "inactive",
      createdAt: "2025-03-10",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      setRestaurants(restaurants.filter((r) => r.id !== id));
    }
  };

  const handleAdd = (newData: Omit<Restaurant, 'id' | 'status' | 'createdAt'>) => {
    const newEntry: Restaurant = {
      id: Date.now(),
      ...newData,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRestaurants([newEntry, ...restaurants]);
    alert('✅ Restaurant added successfully!');
  };

  const handleEditClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedRestaurant: Restaurant) => {
    setRestaurants(restaurants.map(r =>
      r.id === updatedRestaurant.id ? updatedRestaurant : r
    ));
    alert('✅ Restaurant updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#513012]">Restaurants</h1>
          <p className="text-gray-600 mt-1">Manage all restaurants in the system</p>
        </div>

        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#513012] hover:bg-[#3f260f] text-white"
        >
          <Plus className="mr-2 h-7 w-5" />
          Add New Restaurant
        </Button>
      </div>

      <Card className="border-[#513012]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#513012]/60 h-5 w-5" />
              <Input
                placeholder="Search restaurants or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#513012]/20 focus:border-[#47034E]"
              />
            </div>
            <div className="text-xl">
              Total Restaurants: <span className="font-semibold text-xl text-[#513012]">{restaurants.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className=" border-[#513012]/10">
                <TableHead className="text-[#513012]">Restaurant Name</TableHead>
                <TableHead className="text-[#513012]">Owner</TableHead>
                <TableHead className="text-[#513012]">Contact</TableHead>
                <TableHead className="text-[#513012]">Address</TableHead>
                <TableHead className="text-[#513012]">Status</TableHead>
                <TableHead className="text-right text-[#513012]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.map((restaurant) => (
                <TableRow key={restaurant.id} className="border-[#513012]/10 hover:bg-[#513012]/5">
                  <TableCell className="font-bold">{restaurant.name}</TableCell>
                  <TableCell>{restaurant.owner}</TableCell>
                  <TableCell>
                    <div>
                      <p >{restaurant.email}</p>
                      <p className=" text-gray-700">{restaurant.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm ">{restaurant.address}</TableCell>
                  <TableCell>
                    <Badge 
                      className={restaurant.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {restaurant.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(restaurant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(restaurant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddRestaurantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />

      <EditRestaurantModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        restaurant={selectedRestaurant}
        onSave={handleSaveEdit}
      />
    </div>
  );
}