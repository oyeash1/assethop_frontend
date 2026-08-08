// src/components/ListingCard.jsx
import React from 'react';
import { useAuth } from '../core/hooks/useAuth';

export default function ListingCard({ item, onClick }) {
  const { cibil } = useAuth();
  
  const depositRate = item.category === 'ELECTRONICS' ? 0.08 : 0.05;
  const rawDeposit = Math.round(item.mrp * depositRate);
  const userDeposit = cibil >= 750 ? Math.round(rawDeposit * 0.60) : rawDeposit;

  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-gray-200 hover:border-accent hover:shadow-md cursor-pointer transition-all duration-200 flex gap-4"
    >
      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
        {item.images && item.images[0] ? (
          <img src={item.images[0]} alt={item.title} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400 text-[10px] font-bold">AssetHop</span>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded">
              {item.category}
            </span>
            <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
              {item.status}
            </span>
          </div>
          <h4 className="font-bold text-gray-900 text-sm mt-1 line-clamp-1">{item.title}</h4>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
        </div>

        <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400">Security Deposit</p>
            <p className="text-xs font-semibold text-gray-700">
              ₹{userDeposit}
              {cibil >= 750 && <span className="text-[9px] text-green-500 ml-1 font-bold">(-40% Trust)</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Rent / Day</p>
            <p className="text-sm font-bold text-accent">₹{item.dailyRent}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
