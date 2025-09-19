import React from 'react'
import { formatInr } from '../utils/currency'

export default function ItemsTable({ fields, items, register, remove }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-white/70">
          <tr>
            <th className="text-left font-medium pb-2">Description</th>
            <th className="text-right font-medium pb-2">Qty</th>
            <th className="text-right font-medium pb-2">HSN/SAC</th>
            <th className="text-right font-medium pb-2">Rate</th>
            <th className="text-right font-medium pb-2">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {fields.map((field, idx) => (
            <tr key={field.id}>
              <td className="py-2 pr-2">
                <input className="field" placeholder="Item description" {...register(`items.${idx}.description`)} />
              </td>
              <td className="py-2 pr-2">
                <input className="field text-right" type="number" step="1" min="0" {...register(`items.${idx}.qty`, { valueAsNumber: true })} />
              </td>
              <td className="py-2 pr-2">
                <input className="field text-right" placeholder="HSN/SAC" {...register(`items.${idx}.hsn`)} />
              </td>
              <td className="py-2 pr-2">
                <input className="field text-right" type="number" step="0.01" min="0" {...register(`items.${idx}.rate`, { valueAsNumber: true })} />
              </td>
              <td className="py-2 pr-2 align-middle text-right">₹ {formatInr(items[idx]?.amount)}</td>
              <td className="py-2">
                {fields.length > 1 && (
                  <button type="button" className="btn-secondary" onClick={() => remove(idx)}>Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


