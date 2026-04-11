import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, QrCode, Leaf } from "lucide-react";
import { useTables } from "@/hooks/useFloor";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://marvelous-youtiao-ab8734.netlify.app/";

const statusColors: Record<string, string> = {
  available: "bg-[#74C69D]/20 text-[#2D6A4F] border-[#74C69D]/40",
  occupied: "bg-[#F4A261]/20 text-[#B5540A] border-[#F4A261]/40",
  preorder: "bg-[#457B9D]/20 text-[#1D4F6B] border-[#457B9D]/40",
  reserved: "bg-[#E76F51]/20 text-[#9B3020] border-[#E76F51]/40",
  cleaning: "bg-[#8A8A7A]/20 text-[#4A4A40] border-[#8A8A7A]/40",
};

export default function TableQRCodes() {
  const printRef = useRef<HTMLDivElement>(null);
  const { data: rawTables = [] } = useTables();

  const tables = Array.isArray(rawTables)
    ? rawTables.map((table: any) => ({
        id: table.id,
        label: table.name || `T-${table.id}`,
        capacity: table.capacity ?? 0,
        status: table.status === "pre-order" ? "preorder" : table.status,
      }))
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <QrCode size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display text-lg leading-tight">Table QR Codes</h1>
            <p className="text-xs text-muted-foreground">{tables.length} tables · Scan to order</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Printer size={15} /> Print All
          </button>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/8 text-accent text-xs font-medium border border-accent/20">
            <Leaf size={13} />
            DineFlow
          </div>
        </div>
      </header>

      {/* Info bar */}
      <div className="px-6 py-3 bg-muted/40 border-b border-border text-xs text-muted-foreground flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        Each QR code links to <code className="bg-muted px-1 rounded text-foreground font-mono">/menu?table_id=123</code> — customers scan and order directly from their phone.
      </div>

      {/* QR Grid */}
      <div ref={printRef} className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {tables.map((table) => {
          const url = `${BASE_URL}/menu?table_id=${table.id}`;
          const statusClass = statusColors[table.status] ?? statusColors.available;

          return (
            <div key={table.id}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 print:shadow-none print:border-gray-300"
            >
              {/* Table label */}
              <div className="w-full flex items-center justify-between">
                <span className="font-mono font-bold text-sm">{table.label}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClass} capitalize`}>
                  {table.status}
                </span>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-xl p-2.5 shadow-inner">
                <QRCodeSVG
                  id={`qr-${table.id}`}
                  value={url}
                  size={110}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Capacity + URL snippet */}
              <div className="text-center space-y-0.5">
                <p className="text-xs font-medium text-foreground">{table.capacity} seat{table.capacity !== 1 ? "s" : ""}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate w-28 text-center">
                  /menu?table_id={table.id}
                </p>
              </div>

              {/* Individual download button */}
              <button
                onClick={() => {
                  const svg = document.getElementById(`qr-${table.id}`);
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([svgData], { type: "image/svg+xml" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `QR-${table.label}.svg`;
                  link.click();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Download size={11} /> Save SVG
              </button>
            </div>
          );
        })}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print-area, #qr-print-area * { visibility: visible; }
          #qr-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          header, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
