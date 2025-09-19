import React, { useEffect, useState, useMemo, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import InvoicePreview from "./components/InvoicePreview.jsx";
import InvoiceHeaderFields from "./components/InvoiceHeaderFields.jsx";
import PartyFields from "./components/PartyFields.jsx";
import ItemsTable from "./components/ItemsTable.jsx";
import { formatInr } from "./utils/currency.js";

const defaultItem = { description: "", qty: 1, rate: 0, amount: 0 };

const defaultValues = {
  invoiceNo: "",
  invoiceDate: format(new Date(), "dd-MM-yyyy"),
  dueDate: "",
  panNo: "AACFY8636Q",
  gstin: "09AACFY8636Q1Z5",
  // logoUrl: "/logo.png",
  mobileNumber: "8299401945",
  billTo: { name: "", address: "", gstin: "" },
  items: [{ ...defaultItem }],
  notes: "",
  terms: "",
};

function currency(value) {
  return formatInr(value);
}

export default function App() {
  const { register, control, watch, setValue, handleSubmit } = useForm({
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const [isIgst, setIsIgst] = useState(false);

  const [cgstPercent, setCgstPercent] = useState(9);
  const [sgstPercent, setSgstPercent] = useState(9);
  const [igstPercent, setIgstPercent] = useState(18);
  const [taxAmount, setTaxAmount] = useState(0);

  const stageRef = useRef(null);

  const items = watch("items");

  useEffect(() => {
    items.forEach((it, idx) => {
      const amount = (Number(it.qty) || 0) * (Number(it.rate) || 0);
      if (amount !== it.amount)
        setValue(`items.${idx}.amount`, amount, { shouldDirty: true });
    });
  }, [items, setValue]);

  const totals = useMemo(() => {
    const subTotal = items.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const tax = 0;
    const total = subTotal + tax;
    return { subTotal, tax, total };
  }, [items]);

  // Single-page-fit PDF exporter
  const onDownload = async () => {
    if (!stageRef.current) return;

    try {
      // let layout settle
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );

      const node = stageRef.current;

      // wait for all images to load
      const imgs = node.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = img.onerror = () => res();
          });
        })
      );

      // capture at higher resolution
      const captureScale = 3;
      const rect = node.getBoundingClientRect();
      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: captureScale,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.ceil(rect.width),
        windowHeight: Math.ceil(rect.height),
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.textContent = `
            * { color: #111827 !important; background-color: #ffffff !important;
                font-family: Arial, sans-serif !important; line-height: 1.35 !important; box-sizing: border-box !important; }
            .invoice-stage * { font-family: Arial, sans-serif !important; word-break: keep-all !important; }
            .invoice-stage .title-nowrap { white-space: nowrap !important; }
            table { border-collapse: collapse !important; }
            td, th { vertical-align: middle !important; padding: 6px !important; }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      // convert px → pt (1px ≈ 0.75pt at 96dpi)
      const pxToPt = (px) => px * 0.75;
      const pageWidth = pxToPt(canvas.width);
      const pageHeight = pxToPt(canvas.height);

      const pdf = new jsPDF({
        unit: "pt",
        format: [pageWidth, pageHeight], // exact same size
        compress: true,
      });

      const imgData = canvas.toDataURL("image/png");

      // fill full page, no shrink
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

      const fileName = `Invoice-${(watch("invoiceNo") || "Draft")
        .replace(/[^a-z0-9-_]/gi, "_")}.pdf`;

      pdf.save(fileName);
      console.log("PDF saved:", fileName);
    } catch (err) {
      alert(`Failed to generate PDF: ${err?.message || err}`);
      console.error("Download error", err);
    }
  };

  const onSubmit = () => onDownload();

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-900/30 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Y.S Invoice Builder</h1>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" type="button" onClick={() => append({ ...defaultItem })}>
              Add Item
            </button>
            <button className="btn-primary" type="button" onClick={onSubmit}>
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form className="card p-4 lg:p-6" onSubmit={handleSubmit(onSubmit)}>
          <InvoiceHeaderFields register={register} />
          <PartyFields 
            register={register} 
            setIsIgst={setIsIgst} 
            isIgst={isIgst} 
            setCgstPercent={setCgstPercent} 
            setSgstPercent={setSgstPercent} 
            setIgstPercent={setIgstPercent}
            setTaxAmount={setTaxAmount}
            taxAmount={taxAmount}
          />
          <ItemsTable fields={fields} items={items} register={register} remove={remove} />

          <div className="mt-4 flex items-center gap-3 justify-end text-sm">
            <div className="min-w-48 text-right"><span className="muted">Subtotal:</span> ₹ {currency(totals.subTotal)}</div>
            <div className="min-w-48 text-right"><span className="muted">Tax:</span> ₹ {currency(totals.tax)}</div>
            <div className="min-w-48 text-right font-semibold"><span className="muted">Total:</span> ₹ {currency(totals.total)}</div>
          </div>

          {/* <NotesTerms register={register} /> */}

          <div className="mt-6 flex justify-end">
            <button className="btn-primary" type="submit">Save & Download</button>
          </div>
        </form>

        <section className="flex flex-col items-center gap-3">
          {/* IMPORTANT: wrapper must NOT be invoice-stage to avoid double styling/height issues */}
          <div ref={stageRef}>
            <InvoicePreview
              data={{
                invoiceNo: watch("invoiceNo"),
                invoiceDate: watch("invoiceDate"),
                billTo: watch("billTo"),
                items: watch("items"),
                logoUrl: '/logo.png',
                stampUrl: '/stamp.png',
                mobileNumber: watch("mobileNumber"),
                panNo: watch("panNo"),
                gstin: watch("gstin"),
                isIgst,
                igstPercent,
                cgstPercent,
                sgstPercent,
                taxAmount,
              }}
            />
          </div>
          <p className="muted text-xs">Preview matches the invoice blueprint. Fine-tune field positions as needed.</p>
        </section>
      </main>
    </div>
  );
}
