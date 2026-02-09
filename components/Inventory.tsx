import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, AlertTriangle, PlusCircle, MinusCircle } from 'lucide-react';
import { saveInventoryItem } from '../services/storage';

interface InventoryProps {
  items: InventoryItem[];
  onRefresh: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onRefresh }) => {
  const handleAdjust = (item: InventoryItem, delta: number) => {
    const newItem = { ...item, quantity: Math.max(0, item.quantity + delta) };
    saveInventoryItem(newItem);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${item.quantity <= item.minLevel ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Package className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{item.name}</h3>
                   <span className="text-xs text-slate-500 uppercase tracking-wider">{item.category}</span>
                 </div>
              </div>
              {item.quantity <= item.minLevel && (
                <div className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                   <AlertTriangle className="w-3 h-3" /> LOW STOCK
                </div>
              )}
            </div>

            <div className="flex items-end justify-between">
               <div>
                  <p className="text-xs text-slate-500 mb-1">Current Stock</p>
                  <div className="text-3xl font-bold text-slate-800">
                    {item.quantity} <span className="text-base font-normal text-slate-400">{item.unit}</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleAdjust(item, -1)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <MinusCircle className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={() => handleAdjust(item, 1)}
                    className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    <PlusCircle className="w-8 h-8" />
                  </button>
               </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-100">
               <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.quantity <= item.minLevel ? 'bg-red-500' : 'bg-brand-500'}`} 
                    style={{ width: `${Math.min(100, (item.quantity / (item.minLevel * 2)) * 100)}%` }}
                  ></div>
               </div>
               <div className="flex justify-between text-xs text-slate-400 mt-1">
                 <span>0</span>
                 <span>Min: {item.minLevel}</span>
                 <span>Target: {item.minLevel * 2}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;