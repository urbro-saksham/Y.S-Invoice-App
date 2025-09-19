import React, { useState } from "react";

export default function PartyFields({ 
    register, 
    isIgst, 
    setIsIgst, 
    setCgstPercent, 
    setSgstPercent, 
    setIgstPercent, 
    setTaxAmount,
    taxAmount
  }) {

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-1">
      {/* Bill To */}
      <div className=" w-[300px]">
        <h3 className="text-sm font-semibold text-white/80 mb-2">Bill To</h3>
        <input
          className="field mb-2"
          placeholder="Name"
          {...register("billTo.name")}
        />
        <input
          className="field mb-2"
          placeholder="GSTIN"
          {...register("billTo.gstin")}
        />
        <textarea
          className="field mt-2"
          rows={2}
          placeholder="Address"
          {...register("billTo.address")}
        />
      </div>

      {/* Our GST */}
      <div>
        {/* <h3 className="text-sm font-semibold text-white/80 mb-2">Our GSTIN</h3>
        <input

          className="field mb-2"
          placeholder="Enter Our GSTIN"
          {...register("our.gstin")}
        /> */}

        {/* <label className="flex items-center gap-2 mt-4 text-white/80">
          <input
            type="checkbox"
            checked={Igst}
            onChange={() => setIgst(!Igst)}
          />
          Use IGST
        </label> */}
      </div>

      {/* Tax Selection */}
      <div className=" w-[200px]">
        <h3 className="text-sm font-semibold text-white/80 mb-0">Tax Details</h3>
        <label className="flex items-center gap-2 mt-1 text-white/80">
            <input
              type="checkbox"
              checked={isIgst}
              onChange={() => setIsIgst(!isIgst)}
            />
          Use IGST
        </label>
        <div className="flex flex-col gap-3">
          {isIgst ? (
            // IGST text field
            <input
              type="number"
              className="field"
              placeholder="Enter IGST %"
              onChange={(e) => setIgstPercent(e.target.value)}
            />
          ) : (
            // CGST + SGST fields
            <>
              <input
                type="number"
                className="field"
                placeholder="Enter CGST %"
                onChange={(e) => setCgstPercent(e.target.value)}
              />
              <input
                type="number"
                className="field"
                placeholder="Enter SGST %"
                onChange={(e) => setSgstPercent(e.target.value)}
              />
            </>
          )}
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-semibold text-white/80 mb-0">Taxable Amount</h3>
          <input
            type="number"
            className="field"
            placeholder="Enter Taxable Amount"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
