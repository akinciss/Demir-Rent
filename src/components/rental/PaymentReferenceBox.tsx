"use client";

interface PaymentReferenceBoxProps {
  value: string;
  onChange: (val: string) => void;
}

export function PaymentReferenceBox({ value, onChange }: PaymentReferenceBoxProps) {
  return (
    <div>
      <label
        htmlFor="receipt-info"
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        Gönderici Ad Soyad / Dekont Referans No{" "}
        <span className="text-rose-500" aria-hidden="true">*</span>
      </label>
      <input
        id="receipt-info"
        type="text"
        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "rgba(255,255,255,0.7)",
          color: "var(--color-text)",
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Örn: Ahmet Yılmaz — REF12345"
        required
        aria-required="true"
        maxLength={200}
      />
      <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
        Ödeme yapan kişinin adı veya banka dekontunun referans numarası.
      </p>
    </div>
  );
}
