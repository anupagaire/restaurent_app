'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import MenuModal from '@/components/restaurant-admin/MenuModal';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isVeg: boolean;
}

// ✅ Default categories — each restaurant starts with these
const DEFAULT_CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Rice & Biryani',
  'Breads',
  'Beverages',
  'Desserts',
];

const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Butter Chicken',
    description: 'Tender chicken cooked in rich tomato gravy with butter and cream',
    price: 420,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae784',
    isAvailable: true,
    isVeg: false,
  },
  {
    id: 2,
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in creamy tomato gravy',
    price: 380,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7',
    isAvailable: true,
    isVeg: true,
  },
  {
    id: 3,
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice cooked with mixed vegetables and spices',
    price: 320,
    category: 'Rice & Biryani',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    isAvailable: true,
    isVeg: true,
  },
  {
    id: 4,
    name: 'Garlic Naan',
    description: 'Soft naan bread topped with garlic and butter',
    price: 80,
    category: 'Breads',
    image: 'https://images.unsplash.com/photo-1626507827-9e3d5c8b2e5e',
    isAvailable: true,
    isVeg: true,
  },
  {
    id: 5,
    name: 'Mango Lassi',
    description: 'Refreshing yogurt drink with fresh mango pulp',
    price: 120,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1626200419199-7c0c3a8a1b0e',
    isAvailable: false,
    isVeg: true,
  },
];

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ✅ Categories are owned here — per restaurant, per page instance
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // ✅ Add a new category
  const handleAddCategory = (newCat: string) => {
    setCategories((prev) => [...prev, newCat]);
  };

  // ✅ Delete a category
  const handleDeleteCategory = (catToDelete: string) => {
    setCategories((prev) => prev.filter((c) => c !== catToDelete));

    // If the filter tab was on the deleted category, reset to All
    if (selectedCategory === catToDelete) {
      setSelectedCategory('All');
    }
  };

  // Filter tabs = All + current categories
  const filterTabs = ['All', ...categories];

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSubmitMenuItem = (newOrUpdatedItem: any) => {
    if (editingItem) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...newOrUpdatedItem } : item
        )
      );
    } else {
      const newItem: MenuItem = {
        id: Date.now(),
        ...newOrUpdatedItem,
        isAvailable: newOrUpdatedItem.isAvailable ?? true,
        isVeg: newOrUpdatedItem.isVeg ?? false,
      };
      setMenuItems((prev) => [...prev, newItem]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#513012] cinzel">Menu Management</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items and categories</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-[#513012] hover:bg-[#513012]/90 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </Button>
      </div>

      {/* ✅ Category Filter Tabs — updates dynamically as categories are added/removed */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'bg-[#513012] hover:bg-[#513012]/90' : ''}
          >
            {category}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Menu Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-600">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[#5D0565]/10 text-[#5D0565]">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-[#513012]">
                    Rs. {item.price}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.isVeg
                          ? 'border-green-600 text-green-700'
                          : 'border-red-600 text-red-700'
                      }
                    >
                      {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSubmit={handleSubmitMenuItem}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}