import React from 'react'

export default function NotesTerms({ register }) {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="label">Notes</label>
        <textarea className="field" rows={3} placeholder="Notes for customer" {...register('notes')} />
      </div>
      <div>
        <label className="label">Terms</label>
        <textarea className="field" rows={3} placeholder="Payment terms" {...register('terms')} />
      </div>
    </div>
  )
}


