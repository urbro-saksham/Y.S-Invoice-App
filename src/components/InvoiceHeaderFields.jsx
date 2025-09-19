import React from 'react'

export default function InvoiceHeaderFields({ register }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="label">Invoice No</label>
        <input className="field" placeholder="" {...register('invoiceNo')} />
      </div>
      <div>
        <label className="label">Mobile Number</label>
        <input className="field" placeholder="" {...register('mobileNumber')} />
      </div>
      <div>
        <label className="label">Invoice Date</label>
        <input className="field" placeholder="2023-01-01" {...register('invoiceDate')} />
      </div>
      <div>
        <label className="label">PAN:</label>
        <input className="field" type="text" {...register('panNo')} />
      </div>

      {/* <div>
        <label className="label">Due Date</label>
        <input className="field" type="date" {...register('dueDate')} />
      </div> */}
      
      {/* <div className="sm:col-span-2">
        <label className="label">Logo URL (optional)</label>
        <input className="field" placeholder="/logo.png" {...register('logoUrl')} />
        <p className="text-xs mt-1 muted">Place your logo file in the public folder and reference it, e.g. /logo.png</p>
      </div> */}
    </div>
  )
}


