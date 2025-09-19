import React, { useMemo } from "react";

/**
 * InvoicePreview (fixed)
 * - Preserves original markup & Tailwind classes
 * - Recalculates subtotal, taxable base, taxes and total immediately when data/items/tax percents/isIgst change
 * - Detects deep changes to items via JSON.stringify in dependencies (safe fallback if parent mutates in-place)
 *
 * Usage: <InvoicePreview data={invoiceData} />
 */
export default function InvoicePreview({ data = {} }) {
  const {
    invoiceNo,
    invoiceDate,
    mobileNumber,
    billTo,
    items = [],
    logoUrl,
    stampUrl,
    panNo,
    isIgst, // flag for IGST
    igstPercent = 18,
    cgstPercent = 9,
    sgstPercent = 9,
    taxAmount = 0, // invoice-level taxable base override
  } = data || {};

  const fmt = (n) => {
    const v = Number.isFinite(n) ? n : 0;
    return v.toFixed(2);
  };

  // Keep the same parsed percents used in original code
  const parsedIgstPercent = Number(igstPercent) || 0;
  const parsedCgstPercent = Number(cgstPercent) || 0;
  const parsedSgstPercent = Number(sgstPercent) || 0;

  /**
   * Derived values (rows, subtotal, taxableBase, taxes, total)
   * - dependencies include JSON.stringify(items) so deep content changes are detected
   * - also depend on isIgst and percents and taxAmount
   */
  const derived = useMemo(() => {
    // Build rows with row-level tax calculations
    const rows = (items || []).map((it = {}) => {
      // original pattern: use item.amount if present, else fallback to qty * rate
      const amount = Number(it.amount) || Number(it.qty) * Number(it.rate) || 0;

      const itemIgst = isIgst ? (amount * parsedIgstPercent) / 100 : 0;
      const itemCgst = !isIgst ? (amount * parsedCgstPercent) / 100 : 0;
      const itemSgst = !isIgst ? (amount * parsedSgstPercent) / 100 : 0;

      const tax = itemIgst + itemCgst + itemSgst;
      const netAmount = amount + tax;

      return {
        ...it,
        amount,
        itemIgst,
        itemCgst,
        itemSgst,
        tax,
        netAmount,
      };
    });

    const subTotal = rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const parsedTaxAmount = Number(taxAmount) || 0;
    const taxableBase = parsedTaxAmount > 0 ? parsedTaxAmount : subTotal;

    const igst = isIgst ? (taxableBase * parsedIgstPercent) / 100 : 0;
    const cgst = !isIgst ? (taxableBase * parsedCgstPercent) / 100 : 0;
    const sgst = !isIgst ? (taxableBase * parsedSgstPercent) / 100 : 0;


    const rawTotal = taxableBase + igst + cgst + sgst;
    // Round total to nearest 2 decimals (or 0 if you want integer rupees)
    const totalAmount = Math.floor(rawTotal); // nearest rupee
    const roundOff =  rawTotal - totalAmount;


    return {
      rows,
      subTotal,
      taxableBase,
      igst,
      cgst,
      sgst,
      totalAmount,
      roundOff,
      rawTotal
    };
    // deep-watch items so changes to nested props trigger recompute
  }, [
    // NOTE: JSON.stringify is used intentionally to catch in-place mutations.
    JSON.stringify(items || []),
    !!isIgst,
    igstPercent,
    cgstPercent,
    sgstPercent,
    taxAmount,
  ]);

  function numberToWordsIndian(num) {
    if (num === 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    function twoDigits(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    }

    function threeDigits(n) {
      let str = "";
      if (Math.floor(n / 100) > 0) {
        str += ones[Math.floor(n / 100)] + " Hundred";
        if (n % 100 > 0) str += " ";
      }
      if (n % 100 > 0) {
        str += twoDigits(n % 100);
      }
      return str;
    }

    let result = "";

    const crore = Math.floor(num / 10000000);
    if (crore > 0) {
      result += threeDigits(crore) + " Crore ";
      num %= 10000000;
    }

    const lakh = Math.floor(num / 100000);
    if (lakh > 0) {
      result += threeDigits(lakh) + " Lakh ";
      num %= 100000;
    }

    const thousand = Math.floor(num / 1000);
    if (thousand > 0) {
      result += threeDigits(thousand) + " Thousand ";
      num %= 1000;
    }

    if (num > 0) {
      result += threeDigits(num);
    }

    return result.trim();
  }

  // number of columns in items table (used for padding rows)
  const columnsCount = isIgst ? 8 : 9;

  return (
    <div
      className="invoice-stage relative w-[612px] bg-white text-gray-900 font-sans text-[11px]"
      style={{
        fontFamily: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`,
        height: "auto",
        minHeight: "auto",
        padding: "14px",
        paddingBottom: "40px",
        boxSizing: "border-box",
      }}
    >
      {/* Header Row */}
      <div className="flex p-2.5 pb-0 -mt-5">
        {/* Logo */}
        <div className="w-[200px] h-[85px] flex items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="logo"
              crossOrigin="anonymous"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-gray-500">Logo</span>
          )}
        </div>

        {/* Center title */}
        <div className="flex-1 text-center mt-[40px]">
          <div
            className="font-extrabold text-2xl leading-tight w-[350px]"
            style={{ whiteSpace: "nowrap" }}
          >
            Y.S. VIRTUAL COMMUNITY
          </div>
          <div className="text-[10px] leading-tight">
            UGF-5, SANGAM TOWER, NAZA MARKET LUCKNOW
          </div>
        </div>

        {/* Mobile */}
        <div className="w-40 text-[10px] text-right ml-1 mt-5.5">
          <b>Mob:</b> {mobileNumber || "8294019145"}
        </div>
      </div>

      {/* Party & Invoice Info */}
      <table
        className="w-full border border-black border-collapse text-[11px] mt-1"
        style={{ lineHeight: "1.4" }}
      >
        <tbody>
          <tr>
            <td className="font-bold border border-black px-2 py-2 h-[30px] align-middle">
              GSTIN: 09AACFY8636Q1Z5
            </td>
            <td className="font-bold border border-black px-2 py-2 text-right h-[30px] align-middle">
              PAN: {panNo}
            </td>
          </tr>

          <tr>
            <td
              colSpan={2}
              className="font-bold border border-black text-center py-2 h-[10px] text-[15px] align-middle"
            >
              Tax Invoice
            </td>
          </tr>
          <tr>
            <td className="font-bold border border-black px-2 py-2 h-[30px] align-middle">
              <b>NAME :</b> {billTo?.name}
            </td>
            <td className="font-bold border border-black px-2 py-2 h-[30px] align-middle">
              Invoice No: {invoiceNo}
            </td>
          </tr>
          <tr>
            <td className="font-bold border border-black px-2 py-2 h-[30px] align-middle">
              <b>Address :</b> {billTo?.address}
            </td>
            <td className="font-bold border border-black px-2 py-2 h-[30px] align-middle">
              Invoice Date: {invoiceDate}
            </td>
          </tr>

          <tr>
            <td className="font-bold border border-black px-2 py-2 h-[30px] align-middle">
              <b>GSTIN :</b> {billTo?.gstin}
            </td>
            <td className="font-bold border border-black px-2 py-2 h-[30px] align-middle">
              Code 9 &nbsp;&nbsp; Place: Lucknow
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table
        className="w-full border border-black border-collapse text-[10px] mt-0"
        style={{ lineHeight: "1.4" }}
      >
        <thead>
          <tr>
            <th className="border border-black px-1 py-3 w-[30px] h-[35px]">
              S.N.
            </th>
            <th className="border border-black px-1 py-3 text-left w-[200px] h-[35px]">
              Description of Services / Description
            </th>
            <th className="border border-black px-1 py-3 w-[80px] h-[35px]">
              Service Code (SAC/HSN)
            </th>
            <th className="border border-black px-1 py-3 w-[40px] h-[35px]">
              QTY
            </th>
            <th className="border border-black px-1 py-3 w-[60px] h-[35px]">
              RATE
            </th>

            {isIgst ? (
              <th className="border border-black px-1 py-2 w-[60px]">
                IGST {parsedIgstPercent}%
              </th>
            ) : (
              <>
                <th className="border border-black px-1 py-2 w-[60px]">
                  CGST {parsedCgstPercent}%
                </th>
                <th className="border border-black px-1 py-2 w-[60px]">
                  SGST {parsedSgstPercent}%
                </th>
              </>
            )}

            <th className="border border-black px-1 py-3 w-[70px] h-[35px]">
              TAX AMOUNT
            </th>
            <th className="border border-black px-1 py-3 w-[70px] h-[35px]">
              NET AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {derived.rows.map((it, idx) => {
            // row-level data now comes from derived.rows
            const amount = it.amount || 0;
            const itemIgst = it.itemIgst || 0;
            const itemCgst = it.itemCgst || 0;
            const itemSgst = it.itemSgst || 0;
            const tax = it.tax || 0;
            const netAmount = it.netAmount || 0;

            return (
              <tr key={idx}>
                <td className="border border-black px-1 py-3 text-center">
                  {idx + 1}
                </td>
                <td className="border border-black px-1 py-3 break-words">
                  {it.description}
                </td>
                <td className="border border-black px-1 py-3 text-center">
                  {it.hsn}
                </td>
                <td className="border border-black px-1 py-3 text-center">
                  {it.qty || ""}
                </td>
                <td className="border border-black px-1 py-3 text-right">
                  {fmt(it.rate)}
                </td>

                {isIgst ? (
                  <td className="border border-black px-1 py-3 text-right">
                    {fmt(itemIgst)}
                  </td>
                ) : (
                  <>
                    <td className="border border-black px-1 py-3 text-right">
                      {fmt(itemCgst)}
                    </td>
                    <td className="border border-black px-1 py-3 text-right">
                      {fmt(itemSgst)}
                    </td>
                  </>
                )}

                <td className="border border-black px-1 py-3 text-right">
                  {fmt(tax)}
                </td>
                <td className="border border-black px-1 py-3 text-right">
                  {fmt(netAmount)}
                </td>
              </tr>
            );
          })}

          {/* Empty padding rows (keeps table height consistent) */}
          {Array.from({
            length: Math.max(0, 8 - (derived.rows || []).length),
          }).map((_, i) => (
            <tr key={`pad-${i}`}>
              {Array.from({ length: columnsCount }).map((_, j) => (
                <td key={j} className="h-[35px] border border-black"></td>
              ))}
            </tr>
          ))}

          {/* Total Row */}
          <tr className="font-bold">
            <td colSpan={4} className="border border-black px-2 py-3">
              TOTAL AMOUNT
            </td>

            <td className="border border-black px-1 py-3 text-right">
              {fmt(derived.subTotal)}
            </td>

            {isIgst ? (
              <td className="border border-black px-1 py-3 text-right">
                {fmt(derived.igst)}
              </td>
            ) : (
              <>
                <td className="border border-black px-1 py-3 text-right">
                  {fmt(derived.cgst)}
                </td>
                <td className="border border-black px-1 py-3 text-right">
                  {fmt(derived.sgst)}
                </td>
              </>
            )}

            <td className="border border-black px-1 py-3 text-right">
              {fmt(derived.igst + derived.cgst + derived.sgst)}
            </td>
            <td className="border border-black px-1 py-3 text-right">
              {fmt(derived.totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Amount in words + Bank Details */}
      <table
        className="w-full border border-black border-collapse text-[11px] mt-0"
        style={{ lineHeight: "1.4" }}
      >
        <tbody>
          <tr>
            <td className="border border-black px-2 py-3 w-[60%] align-top">
              <div>
                <b>Total Invoice amount in words</b>
              </div>
              <div className="mt-1 text-[10px]">
                Rupees {numberToWordsIndian(derived.totalAmount)} Only
              </div>
            </td>
            <td className="border border-black px-2 py-3 align-top">
              <div className="flex justify-between mb-1">
                <span>Taxable value</span>
                <span>{fmt(derived.taxableBase)}</span>
              </div>

              {isIgst ? (
                <div className="flex justify-between mb-1">
                  <span>IGST {parsedIgstPercent}%</span>
                  <span>{fmt(derived.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-1">
                    <span>CGST {parsedCgstPercent}%</span>
                    <span>{fmt(derived.cgst)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>SGST {parsedSgstPercent}%</span>
                    <span>{fmt(derived.sgst)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between mb-1">
                <span>Tax Amount</span>
                <span>{fmt(derived.igst + derived.cgst + derived.sgst)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Total Amount</span>
                <span>{fmt(derived.rawTotal)}</span>
              </div>
               <div className="flex justify-between mb-1">
                <span>Round off</span>
                <span>- {fmt(derived.roundOff)}</span>
              </div>
              <div className="flex justify-between font-bold mb-1">
                <span>Total Amount</span>
                <span>{fmt(derived.totalAmount)}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-black px-2 py-3" colSpan={2}>
              <div className="mb-1">
                <b>Bank Details</b>
              </div>
              <div className="mb-1">Bank A/C: 40505295742</div>
              <div>Bank IFSC: SBIN0061802</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Terms & Signature */}
      <div className="flex mt-4 px-2 text-[9px] leading-tight">
        <div className="flex-1">
          <div className="font-bold mb-2">Terms & Conditions</div>
          <ul className="list-disc pl-4 space-y-1">
            <li>All disputes are subjected to Lucknow Jurisdiction only.</li>
            <li>
              Unless notified within 7 days, the content of this document will
              be considered as correct.
            </li>
            <li>Interest will be charged if not paid on due date.</li>
            <li>
              Cheque/Demand Draft to be made in favour of "Y.S. VIRTUAL
              COMMUNITY".
            </li>
          </ul>
        </div>
        <div className="w-[200px] text-center">
          <div className="mb-1">For Y.S. VIRTUAL COMMUNITY</div>
          <div className="w-[200px] h-[85px] flex items-center justify-center">
            {stampUrl ? (
              <img
                src={stampUrl}
                alt="stamp"
                crossOrigin="anonymous"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-gray-500">Stamp</span>
            )}
          </div>
          <div className="mt-1">Authorized signatory</div>
        </div>
      </div>
    </div>
  );
}
