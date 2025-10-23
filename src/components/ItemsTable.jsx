import React, { useState } from 'react';
import { formatInr } from '../utils/currency';

export default function ItemsTable({ fields, items, register, remove }) {
  // Track checkbox state per row using an array of booleans
  const [inrAmts, setInrAmts] = useState(() => fields.map(() => true));

  // Toggle checkbox for specific row
  const handleCheckboxChange = (index) => {
    setInrAmts((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="text-left font-medium py-2 px-2">Item Details</th>
            <th className="text-right font-medium py-2 px-2">Qty</th>
            <th className="text-right font-medium py-2 px-2">Inner Amount</th>
            <th className="py-2 px-2"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {fields.map((field, idx) => (
            <tr key={field.id} className="align-top hover:bg-white/5">
              <td className="py-3 px-2">
                <div className="flex flex-col space-y-1">
                  {/* Description */}
                  <input
                    className="field w-full"
                    placeholder="Item description"
                    {...register(`items.${idx}.description`)}
                  />

                  {/* HSN + Price */}
                  <div className="flex space-x-2">
                    <input
                      className="field w-1/2 text-right"
                      placeholder="HSN/SAC"
                      {...register(`items.${idx}.hsn`)}
                    />

                    {/* Price field - disable when Inner GST checked */}
                    <input
                      className="field w-1/2 text-right disabled:opacity-60 disabled:cursor-not-allowed"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      disabled={inrAmts[idx]} // ✅ disable when Inner GST is checked
                      {...register(`items.${idx}.price`, { valueAsNumber: true })}
                    />
                  </div>

                  {/* Checkbox (row-specific) */}
                  <span className="flex items-center space-x-2 mt-2 ml-1">
                    <input
                      type="checkbox"
                      checked={inrAmts[idx]}
                      onChange={() => handleCheckboxChange(idx)}
                      className="w-5 h-5 cursor-pointer accent-blue-600"
                    />
                    <span className="text-sm text-white/80">
                      Check this for Inner GST
                    </span>
                  </span>
                </div>
              </td>

              {/* Quantity */}
              <td className="py-3 px-2 text-right align-top">
                <input
                  className="field text-right w-16"
                  type="number"
                  step="1"
                  min="0"
                  {...register(`items.${idx}.qty`, { valueAsNumber: true })}
                />
              </td>

              {/* Inner Amount field - disable when Inner GST is unchecked */}
              <td className="py-3 px-2 text-right align-top">
                <input
                  className="field text-right w-24 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Inner Amount"
                  disabled={!inrAmts[idx]} // ✅ disable when Inner GST is unchecked
                  {...register(`items.${idx}.inneramount`, { valueAsNumber: true })}
                />
              </td>

              {/* Remove button */}
              <td className="py-3 px-2 text-center align-top">
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="btn-secondary text-xs px-2 py-1"
                    onClick={() => remove(idx)}
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
