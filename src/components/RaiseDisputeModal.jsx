// src/components/RaiseDisputeModal.jsx
import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Upload, CheckCircle } from 'lucide-react';
import { api } from '../core/api/client';

export default function RaiseDisputeModal({
  isOpen,
  onClose,
  booking,
  onDisputeSuccess
}) {
  const [reason, setReason] = useState('DAMAGE');
  const [description, setDescription] = useState('');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a detailed description of the product damage or issue.');
      return;
    }

    const returnPhotos = booking.returnPhotos || [];
    if (returnPhotos.length === 0) {
      setError('Return inspection photos are required as proof before raising a dispute.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/bookings/raise-dispute', {
        bookingId: booking._id,
        reason,
        description,
        claimedAmount: parseFloat(claimedAmount) || 0,
        evidencePhotos: returnPhotos
      });

      if (res?.status === 'success') {
        alert('⚠️ Dispute submitted successfully. Escrow funds held on security lock pending Admin review.');
        onDisputeSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to raise dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <ShieldAlert className="h-5 w-5 text-red-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Raise Rental Damage / Condition Dispute</h3>
              <p className="text-[10px] text-red-100">Escrow Payout will be frozen on security lock for Admin verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-semibold">
              {error}
            </div>
          )}

          {/* Product Summary */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Rental Asset</p>
              <p className="font-bold text-gray-800">{booking.listingId?.title || 'Rental Item'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-medium">Renter Name</p>
              <p className="font-bold text-gray-800">{booking.userId?.name || 'Renter'}</p>
            </div>
          </div>

          {/* Dispute Category Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Dispute Reason / Violation Type</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="DAMAGE">Physical Product Damage / Breakage / Scratch</option>
              <option value="ITEM_MISSING">Missing Accessories / Components</option>
              <option value="LATE_RETURN">Severe Violation / Overdue Non-Response</option>
              <option value="OTHER">Other Condition Violation</option>
            </select>
          </div>

          {/* Claimed Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Claimed Compensation / Repair Cost (₹)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 1500 (Leave blank if full security deposit claim)"
              value={claimedAmount}
              onChange={(e) => setClaimedAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Detailed Description of Damage / Issue *</label>
            <textarea
              rows="3"
              required
              placeholder="Describe the exact physical damage, broken parts, or defect observed during return inspection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Evidence Photos attached */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-gray-700">Attached Return Inspection Proof ({booking.returnPhotos?.length || 0})</p>
            <div className="grid grid-cols-4 gap-2">
              {(booking.returnPhotos || []).map((img, idx) => (
                <div key={idx} className="h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {(!booking.returnPhotos || booking.returnPhotos.length === 0) && (
              <p className="text-[10px] text-red-500 font-semibold">⚠️ No return inspection photos found. Please capture photos of the item first.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !booking.returnPhotos || booking.returnPhotos.length === 0}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20 disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting Dispute...</span>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span>Freeze Payout & Raise Dispute</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
