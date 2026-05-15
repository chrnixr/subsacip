import { useState, useRef, useEffect } from "react";
import {
  Music, Play, Cloud, Code2, FileText,
  Layers, Zap, Wifi, Check, ChevronDown, ChevronRight,
  Plus, LayoutGrid, History, AlertCircle, ArrowRight,
  X, ChevronLeft, Calendar, CreditCard, Building2, Smartphone, Wallet,
} from "lucide-react";

// ── Earth Tone Palette ────────────────────────────────────────────────────────
const E = {
  bg:           "#F0EAE0",
  card:         "#FAF6F0",
  cardSurface:  "#F5EDE2",
  divider:      "rgba(139,109,71,0.1)",
  inkDark:      "#2C1F14",
  inkMid:       "#7A6252",
  inkLight:     "#B5A090",
  primary:      "#4A3728",
  accent:       "#7B5E45",
  pillActiveTxt:"#FAF6F0",
  pillInact:    "#FAF6F0",
  pillInactTxt: "#8A7360",
  pillBorder:   "rgba(139,109,71,0.18)",
  urgToday:     { bg:"#FDF0EA", icon:"#EAC9BB", text:"#7A3020", sub:"#C47860" },
  urgSoon:      { bg:"#FDF8EC", icon:"#EBD8A0", text:"#6B4D00", sub:"#C4A040" },
  urgNorm:      { bg:"#EDE9E4", text:"#8A7360" },
  monthly:      { bg:"#EDE9E2", text:"#5A4430" },
  yearly:       { bg:"#E6EDE4", text:"#3D5435" },
  paid:         "#6B8C6B",
  shadow:       "0 1px 4px rgba(60,35,15,0.08), 0 1px 2px rgba(60,35,15,0.05)",
  shadowDark:   "0 2px 10px rgba(60,35,15,0.22)",
  input:        "#F5EDE2",
  inputBorder:  "rgba(139,109,71,0.22)",
  inputFocus:   "#7B5E45",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type BillingCycle = "monthly" | "yearly";
type PaymentType = "visa" | "mastercard" | "amex" | "bank" | "promptpay" | "truemoney";
type Category = "entertainment" | "productivity" | "developer" | "cloud";
type MainTab = "subscriptions" | "history";
type FilterTab = "all" | "monthly" | "yearly";

interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  last4?: string;
  bank?: string;
  phone?: string;
}

interface Subscription {
  id: string; name: string; description: string; price: number;
  cycle: BillingCycle; nextBillingDate: string;
  payment: { type: PaymentType; last4: string };
  paymentMethodId?: string | null;
  category: Category; color: string; active: boolean;
}
interface HistoryEntry {
  id: string; subscriptionId: string; name: string; description: string;
  price: number; paidDate: string;
  payment: { type: PaymentType; last4: string };
  cycle: BillingCycle; color: string; category: Category;
}

// ── Preset services ───────────────────────────────────────────────────────────
const PRESET_SERVICES = [
  { name: "Netflix",   color: "#9B4040", category: "entertainment" as Category, icon: "play"     },
  { name: "Spotify",   color: "#4A7A5A", category: "entertainment" as Category, icon: "music"    },
  { name: "YouTube",   color: "#8B4A30", category: "entertainment" as Category, icon: "play"     },
  { name: "iCloud",    color: "#4A6080", category: "cloud"         as Category, icon: "cloud"    },
  { name: "Dropbox",   color: "#5A6A80", category: "cloud"         as Category, icon: "cloud"    },
  { name: "GitHub",    color: "#3D3028", category: "developer"     as Category, icon: "code"     },
  { name: "Figma",     color: "#8B4A30", category: "productivity"  as Category, icon: "layers"   },
  { name: "Notion",    color: "#4A3728", category: "productivity"  as Category, icon: "file"     },
  { name: "Adobe CC",  color: "#7A3030", category: "productivity"  as Category, icon: "zap"      },
];

const CUSTOM_COLORS = [
  "#9B4040", "#4A7A5A", "#8B4A30", "#4A6080", "#5A6A80",
  "#3D3028", "#7A3030", "#7B5E45", "#6B8C6B", "#8A7360",
];

const CUSTOM_ICONS = [
  { id: "play", icon: "play" },
  { id: "music", icon: "music" },
  { id: "code", icon: "code" },
  { id: "file", icon: "file" },
  { id: "layers", icon: "layers" },
  { id: "cloud", icon: "cloud" },
  { id: "zap", icon: "zap" },
  { id: "wifi", icon: "wifi" },
];

const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm1", type: "visa", last4: "4242", label: "Visa ···· 4242" },
  { id: "pm2", type: "mastercard", last4: "8832", label: "MC ···· 8832" },
  { id: "pm3", type: "amex", last4: "0005", label: "Amex ···· 0005" },
];

const THAI_BANKS = [
  "กสิกรไทย", "กรุงเทพ", "ไทยพาณิชย์", "กรุงศรี", "กรุงไทย",
  "ทหารไทยธนชาต", "ธนชาต", "ออมสิน", "อาคารสงเคราะห์", "ธกส.",
];

// ── Data ──────────────────────────────────────────────────────────────────────
const initialSubscriptions: Subscription[] = [
  { id: "1", name: "Netflix",   description: "Standard with ads",   price: 379,   cycle: "monthly", nextBillingDate: "2026-05-18", payment: { type: "visa",       last4: "4242" }, category: "entertainment", color: "#9B4040", active: true  },
  { id: "2", name: "Spotify",   description: "Premium Individual",  price: 99,    cycle: "monthly", nextBillingDate: "2026-05-22", payment: { type: "mastercard", last4: "8832" }, category: "entertainment", color: "#4A7A5A", active: true  },
  { id: "3", name: "GitHub",    description: "Pro Plan",            price: 1399,  cycle: "yearly",  nextBillingDate: "2027-01-15", payment: { type: "visa",       last4: "4242" }, category: "developer",    color: "#3D3028", active: true  },
  { id: "4", name: "Notion",    description: "Plus Plan",           price: 2999,  cycle: "yearly",  nextBillingDate: "2026-11-20", payment: { type: "amex",       last4: "0005" }, category: "productivity", color: "#4A3728", active: true  },
  { id: "5", name: "Figma",     description: "Professional",        price: 5699,  cycle: "yearly",  nextBillingDate: "2026-09-03", payment: { type: "visa",       last4: "4242" }, category: "productivity", color: "#8B4A30", active: true  },
  { id: "6", name: "iCloud",    description: "200 GB Storage",      price: 35,    cycle: "monthly", nextBillingDate: "2026-05-16", payment: { type: "mastercard", last4: "8832" }, category: "cloud",        color: "#4A6080", active: true  },
  { id: "7", name: "Adobe CC",  description: "All Apps",            price: 28900, cycle: "yearly",  nextBillingDate: "2026-08-11", payment: { type: "amex",       last4: "0005" }, category: "productivity", color: "#7A3030", active: false },
];

const mockHistory: HistoryEntry[] = [
  { id: "h-may-1", subscriptionId: "1", name: "Netflix",   description: "Standard with ads",  price: 379,   paidDate: "2026-05-01", payment: { type: "visa",       last4: "4242" }, cycle: "monthly", color: "#9B4040", category: "entertainment" },
  { id: "h-may-2", subscriptionId: "6", name: "iCloud",    description: "200 GB Storage",     price: 35,    paidDate: "2026-05-03", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A6080", category: "cloud"         },
  { id: "h-apr-1", subscriptionId: "1", name: "Netflix",   description: "Standard with ads",  price: 379,   paidDate: "2026-04-01", payment: { type: "visa",       last4: "4242" }, cycle: "monthly", color: "#9B4040", category: "entertainment" },
  { id: "h-apr-2", subscriptionId: "2", name: "Spotify",   description: "Premium Individual", price: 99,    paidDate: "2026-04-28", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A7A5A", category: "entertainment" },
  { id: "h-apr-3", subscriptionId: "6", name: "iCloud",    description: "200 GB Storage",     price: 35,    paidDate: "2026-04-03", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A6080", category: "cloud"         },
  { id: "h-mar-1", subscriptionId: "1", name: "Netflix",   description: "Standard with ads",  price: 379,   paidDate: "2026-03-01", payment: { type: "visa",       last4: "4242" }, cycle: "monthly", color: "#9B4040", category: "entertainment" },
  { id: "h-mar-2", subscriptionId: "2", name: "Spotify",   description: "Premium Individual", price: 99,    paidDate: "2026-03-28", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A7A5A", category: "entertainment" },
  { id: "h-mar-3", subscriptionId: "6", name: "iCloud",    description: "200 GB Storage",     price: 35,    paidDate: "2026-03-03", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A6080", category: "cloud"         },
  { id: "h-mar-4", subscriptionId: "5", name: "Figma",     description: "Professional",       price: 5699,  paidDate: "2026-03-09", payment: { type: "visa",       last4: "4242" }, cycle: "yearly",  color: "#8B4A30", category: "productivity"  },
  { id: "h-feb-1", subscriptionId: "1", name: "Netflix",   description: "Standard with ads",  price: 379,   paidDate: "2026-02-01", payment: { type: "visa",       last4: "4242" }, cycle: "monthly", color: "#9B4040", category: "entertainment" },
  { id: "h-feb-2", subscriptionId: "2", name: "Spotify",   description: "Premium Individual", price: 99,    paidDate: "2026-02-28", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A7A5A", category: "entertainment" },
  { id: "h-feb-3", subscriptionId: "6", name: "iCloud",    description: "200 GB Storage",     price: 35,    paidDate: "2026-02-03", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A6080", category: "cloud"         },
  { id: "h-jan-1", subscriptionId: "1", name: "Netflix",   description: "Standard with ads",  price: 379,   paidDate: "2026-01-01", payment: { type: "visa",       last4: "4242" }, cycle: "monthly", color: "#9B4040", category: "entertainment" },
  { id: "h-jan-2", subscriptionId: "2", name: "Spotify",   description: "Premium Individual", price: 99,    paidDate: "2026-01-28", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A7A5A", category: "entertainment" },
  { id: "h-jan-3", subscriptionId: "6", name: "iCloud",    description: "200 GB Storage",     price: 35,    paidDate: "2026-01-03", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A6080", category: "cloud"         },
  { id: "h-jan-4", subscriptionId: "3", name: "GitHub",    description: "Pro Plan",           price: 1399,  paidDate: "2026-01-15", payment: { type: "visa",       last4: "4242" }, cycle: "yearly",  color: "#3D3028", category: "developer"     },
  { id: "h-jan-5", subscriptionId: "7", name: "Adobe CC",  description: "All Apps",           price: 28900, paidDate: "2026-01-11", payment: { type: "amex",       last4: "0005" }, cycle: "yearly",  color: "#7A3030", category: "productivity"  },
  { id: "h-dec-1", subscriptionId: "1", name: "Netflix",   description: "Standard with ads",  price: 379,   paidDate: "2025-12-01", payment: { type: "visa",       last4: "4242" }, cycle: "monthly", color: "#9B4040", category: "entertainment" },
  { id: "h-dec-2", subscriptionId: "2", name: "Spotify",   description: "Premium Individual", price: 99,    paidDate: "2025-12-28", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A7A5A", category: "entertainment" },
  { id: "h-dec-3", subscriptionId: "6", name: "iCloud",    description: "200 GB Storage",     price: 35,    paidDate: "2025-12-03", payment: { type: "mastercard", last4: "8832" }, cycle: "monthly", color: "#4A6080", category: "cloud"         },
  { id: "h-dec-4", subscriptionId: "4", name: "Notion",    description: "Plus Plan",          price: 2999,  paidDate: "2025-12-20", payment: { type: "amex",       last4: "0005" }, cycle: "yearly",  color: "#4A3728", category: "productivity"  },
];

const API_BASE = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL ?? "http://localhost:3001/api").replace(/\/$/, "");

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function toSubscriptionPayload(sub: Subscription) {
  return {
    name: sub.name,
    description: sub.description,
    price: sub.price,
    cycle: sub.cycle,
    nextBillingDate: sub.nextBillingDate,
    paymentMethodId: sub.paymentMethodId ?? undefined,
    payment: sub.payment,
    category: sub.category,
    color: sub.color,
    active: sub.active,
  };
}

function toPaymentMethodPayload(pm: PaymentMethod) {
  return {
    type: pm.type,
    label: pm.label,
    last4: pm.last4,
    bank: pm.bank,
    phone: pm.phone,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const TODAY = "2026-05-15";

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - new Date(TODAY).getTime()) / 86400000);
}
function toMonthly(price: number, cycle: BillingCycle) {
  return cycle === "yearly" ? price / 12 : price;
}
function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("th-TH", { month: "long", year: "numeric" });
}
function groupByMonth(entries: HistoryEntry[]) {
  const map = new Map<string, HistoryEntry[]>();
  for (const e of entries) {
    const k = e.paidDate.slice(0, 7);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(e);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

const PAYMENT_BRAND: Record<PaymentType, string> = {
  visa: "Visa", mastercard: "MC", amex: "Amex",
  bank: "บัญชีธนาคาร", promptpay: "PromptPay", truemoney: "TrueMoney",
};

function urgency(days: number): "today" | "soon" | "normal" {
  if (days <= 1) return "today";
  if (days <= 7) return "soon";
  return "normal";
}

function ServiceIcon({ icon, size }: { icon: string; size: number }) {
  const s = size * 0.42;
  if (icon === "play")   return <Play size={s} />;
  if (icon === "music")  return <Music size={s} />;
  if (icon === "code")   return <Code2 size={s} />;
  if (icon === "file")   return <FileText size={s} />;
  if (icon === "layers") return <Layers size={s} />;
  if (icon === "cloud")  return <Cloud size={s} />;
  if (icon === "zap")    return <Zap size={s} />;
  return <Wifi size={s} />;
}

function ServiceAvatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const preset = PRESET_SERVICES.find(p => p.name === name);
  return (
    <div className="rounded-2xl flex items-center justify-center text-white shrink-0"
      style={{ width: size, height: size, backgroundColor: color }}>
      <ServiceIcon icon={preset?.icon ?? "wifi"} size={size} />
    </div>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full px-4 py-2 transition-all"
      style={{
        fontSize: "0.8125rem", fontWeight: active ? 600 : 400,
        backgroundColor: active ? E.primary : E.pillInact,
        color: active ? E.pillActiveTxt : E.pillInactTxt,
        border: `1px solid ${active ? "transparent" : E.pillBorder}`,
        boxShadow: active ? E.shadowDark : E.shadow,
      }}>
      {children}
    </button>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: E.inkMid, letterSpacing: "0.04em", textTransform: "uppercase", display: "block" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="w-full px-4 py-3 rounded-xl outline-none transition-all"
      style={{
        fontSize: "0.9375rem", color: E.inkDark, backgroundColor: E.input,
        border: `1.5px solid ${focused ? E.inputFocus : E.inputBorder}`,
        boxShadow: focused ? `0 0 0 3px rgba(123,94,69,0.12)` : "none",
      }}
    />
  );
}

// ── Add Payment Method Sheet ──────────────────────────────────────────────────
type PaymentAddStep = "choose" | "form";
type PaymentFormType = "card" | "bank" | "promptpay" | "truemoney";

interface PaymentFormData {
  type: PaymentFormType;
  // Card
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  // Bank
  bank: string;
  accountNumber: string;
  accountName: string;
  // PromptPay
  promptpayId: string;
  // TrueMoney
  truemoneyPhone: string;
}

function AddPaymentSheet({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (pm: PaymentMethod) => void;
}) {
  const [step, setStep] = useState<PaymentAddStep>("choose");
  const [form, setForm] = useState<PaymentFormData>({
    type: "card",
    cardNumber: "", cardName: "", expiry: "", cvv: "",
    bank: "กสิกรไทย", accountNumber: "", accountName: "",
    promptpayId: "", truemoneyPhone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function chooseType(t: PaymentFormType) {
    setForm(f => ({ ...f, type: t }));
    setStep("form");
    setErrors({});
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.type === "card") {
      if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ""))) e.cardNumber = "กรุณากรอกเลขบัตร 16 หลัก";
      if (!form.cardName.trim()) e.cardName = "กรุณากรอกชื่อบนบัตร";
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = "รูปแบบ MM/YY";
      if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = "CVV ไม่ถูกต้อง";
    } else if (form.type === "bank") {
      if (!/^\d{10,15}$/.test(form.accountNumber)) e.accountNumber = "เลขบัญชี 10-15 หลัก";
      if (!form.accountName.trim()) e.accountName = "กรุณากรอกชื่อบัญชี";
    } else if (form.type === "promptpay") {
      const cleaned = form.promptpayId.replace(/\s/g, "");
      if (!/^(\d{10}|\d{13})$/.test(cleaned)) e.promptpayId = "กรอกเบอร์โทร 10 หลัก หรือเลข ID 13 หลัก";
    } else if (form.type === "truemoney") {
      if (!/^0\d{9}$/.test(form.truemoneyPhone.replace(/\s/g, ""))) e.truemoneyPhone = "กรอกเบอร์โทร 10 หลัก";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    let pm: PaymentMethod;
    if (form.type === "card") {
      const cleaned = form.cardNumber.replace(/\s/g, "");
      const last4 = cleaned.slice(-4);
      let cardType: PaymentType = "visa";
      if (cleaned.startsWith("5")) cardType = "mastercard";
      else if (cleaned.startsWith("3")) cardType = "amex";
      pm = { id: Date.now().toString(), type: cardType, last4, label: `${PAYMENT_BRAND[cardType]} ···· ${last4}` };
    } else if (form.type === "bank") {
      const last4 = form.accountNumber.slice(-4);
      pm = { id: Date.now().toString(), type: "bank", last4, bank: form.bank, label: `${form.bank} ···· ${last4}` };
    } else if (form.type === "promptpay") {
      const cleaned = form.promptpayId.replace(/\s/g, "");
      const display = cleaned.length === 10 ? cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3") : cleaned;
      pm = { id: Date.now().toString(), type: "promptpay", phone: cleaned, label: `PromptPay ${display}` };
    } else {
      const cleaned = form.truemoneyPhone.replace(/\s/g, "");
      const display = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
      pm = { id: Date.now().toString(), type: "truemoney", phone: cleaned, label: `TrueMoney ${display}` };
    }
    onAdd(pm);
    onClose();
  }

  const PAYMENT_TYPES = [
    { type: "card" as PaymentFormType, icon: CreditCard, label: "บัตรเครดิต/เดบิต", desc: "Visa · Mastercard · Amex" },
    { type: "bank" as PaymentFormType, icon: Building2, label: "หักผ่านบัญชีธนาคาร", desc: "ธนาคารในประเทศไทย" },
    { type: "promptpay" as PaymentFormType, icon: Smartphone, label: "PromptPay", desc: "เบอร์โทรหรือเลข ID" },
    { type: "truemoney" as PaymentFormType, icon: Wallet, label: "TrueMoney Wallet", desc: "เบอร์โทรศัพท์" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(44,31,20,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div ref={sheetRef} className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
        style={{ maxHeight: "92dvh", borderRadius: "24px 24px 0 0", backgroundColor: E.card, boxShadow: "0 -4px 32px rgba(60,35,15,0.18)" }}>

        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: E.inkLight }} />
        </div>

        <div className="flex items-center px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${E.divider}` }}>
          {step === "form" ? (
            <button onClick={() => setStep("choose")} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ backgroundColor: E.urgNorm.bg }}>
              <ChevronLeft size={18} style={{ color: E.inkMid }} />
            </button>
          ) : <div className="w-9" />}
          <p className="flex-1 text-center" style={{ fontSize: "1rem", fontWeight: 600, color: E.inkDark }}>
            {step === "choose" ? "เลือกช่องทางชำระ" : "กรอกรายละเอียด"}
          </p>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ backgroundColor: E.urgNorm.bg }}>
            <X size={18} style={{ color: E.inkMid }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === "choose" ? (
            <div className="px-5 py-5 space-y-2">
              {PAYMENT_TYPES.map(({ type, icon: Icon, label, desc }) => (
                <button key={type} onClick={() => chooseType(type)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{ backgroundColor: E.cardSurface, border: `1px solid ${E.divider}` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: E.accent }}>
                    <Icon size={22} style={{ color: E.pillActiveTxt }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: E.inkDark }}>{label}</p>
                    <p style={{ fontSize: "0.75rem", color: E.inkLight }}>{desc}</p>
                  </div>
                  <ChevronRight size={18} style={{ color: E.inkLight }} />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-5 py-5 space-y-4 pb-8">
              {form.type === "card" && (
                <>
                  <Field label="เลขบัตร">
                    <TextInput value={form.cardNumber}
                      onChange={v => setForm(f => ({ ...f, cardNumber: v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") }))}
                      placeholder="1234 5678 9012 3456" />
                    {errors.cardNumber && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.cardNumber}</p>}
                  </Field>
                  <Field label="ชื่อบนบัตร">
                    <TextInput value={form.cardName} onChange={v => setForm(f => ({ ...f, cardName: v }))} placeholder="SOMCHAI SOMBOON" />
                    {errors.cardName && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.cardName}</p>}
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="วันหมดอายุ">
                      <TextInput value={form.expiry}
                        onChange={v => {
                          let val = v.replace(/\D/g, "");
                          if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          setForm(f => ({ ...f, expiry: val }));
                        }}
                        placeholder="MM/YY" />
                      {errors.expiry && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.expiry}</p>}
                    </Field>
                    <Field label="CVV">
                      <TextInput value={form.cvv} onChange={v => setForm(f => ({ ...f, cvv: v.replace(/\D/g, "").slice(0, 4) }))} placeholder="123" type="password" />
                      {errors.cvv && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.cvv}</p>}
                    </Field>
                  </div>
                </>
              )}
              {form.type === "bank" && (
                <>
                  <Field label="ธนาคาร">
                    <div className="relative">
                      <select value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl outline-none appearance-none pr-10"
                        style={{ fontSize: "0.9375rem", color: E.inkDark, backgroundColor: E.input, border: `1.5px solid ${E.inputBorder}` }}>
                        {THAI_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: E.inkLight }} />
                    </div>
                  </Field>
                  <Field label="เลขบัญชี">
                    <TextInput value={form.accountNumber}
                      onChange={v => setForm(f => ({ ...f, accountNumber: v.replace(/\D/g, "").slice(0, 15) }))}
                      placeholder="1234567890" />
                    {errors.accountNumber && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.accountNumber}</p>}
                  </Field>
                  <Field label="ชื่อบัญชี">
                    <TextInput value={form.accountName} onChange={v => setForm(f => ({ ...f, accountName: v }))} placeholder="นาย สมชาย สมบูรณ์" />
                    {errors.accountName && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.accountName}</p>}
                  </Field>
                </>
              )}
              {form.type === "promptpay" && (
                <Field label="เบอร์โทร หรือเลข ID">
                  <TextInput value={form.promptpayId}
                    onChange={v => setForm(f => ({ ...f, promptpayId: v.replace(/\D/g, "").slice(0, 13) }))}
                    placeholder="0812345678 หรือ 1234567890123" />
                  {errors.promptpayId && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.promptpayId}</p>}
                  <p style={{ fontSize: "0.75rem", color: E.inkLight, marginTop: 4 }}>กรอกเบอร์โทร 10 หลัก หรือเลข ID 13 หลัก</p>
                </Field>
              )}
              {form.type === "truemoney" && (
                <Field label="เบอร์โทรศัพท์">
                  <TextInput value={form.truemoneyPhone}
                    onChange={v => setForm(f => ({ ...f, truemoneyPhone: v.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="0812345678" />
                  {errors.truemoneyPhone && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.truemoneyPhone}</p>}
                </Field>
              )}
            </div>
          )}
        </div>

        {step === "form" && (
          <div className="px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${E.divider}`, backgroundColor: E.card, paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
            <button onClick={handleSave}
              className="w-full py-4 rounded-2xl transition-all active:scale-[0.98]"
              style={{ fontSize: "1rem", fontWeight: 600, backgroundColor: E.primary, color: E.pillActiveTxt, boxShadow: E.shadowDark }}>
              เพิ่มช่องทางชำระ
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Add Subscription Sheet ────────────────────────────────────────────────────
type AddStep = "pick" | "details";

interface AddForm {
  name: string;
  description: string;
  price: string;
  cycle: BillingCycle;
  nextBillingDate: string;
  paymentId: string;
  category: Category;
  color: string;
  icon: string;
  isCustom: boolean;
}

function AddSubscriptionSheet({ onClose, onAdd, paymentMethods, onAddPayment }: {
  onClose: () => void;
  onAdd: (sub: Subscription) => void;
  paymentMethods: PaymentMethod[];
  onAddPayment: () => void;
}) {
  const [step, setStep] = useState<AddStep>("pick");
  const [form, setForm] = useState<AddForm>({
    name: "", description: "", price: "",
    cycle: "monthly", nextBillingDate: "2026-06-15",
    paymentId: paymentMethods[0]?.id ?? "", category: "productivity", color: "#7B5E45",
    icon: "wifi", isCustom: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddForm, string>>>({});
  const sheetRef = useRef<HTMLDivElement>(null);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function pickPreset(p: typeof PRESET_SERVICES[0]) {
    setForm(f => ({ ...f, name: p.name, category: p.category, color: p.color, icon: p.icon, isCustom: false }));
    setStep("details");
  }

  function pickCustom() {
    setForm(f => ({ ...f, name: "", category: "productivity", color: CUSTOM_COLORS[0], icon: "wifi", isCustom: true }));
    setStep("details");
  }

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "กรุณากรอกชื่อบริการ";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "กรุณากรอกราคาที่ถูกต้อง";
    if (!form.nextBillingDate) e.nextBillingDate = "กรุณาเลือกวันที่";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const pm = paymentMethods.find(p => p.id === form.paymentId);
    if (!pm) return;
    onAdd({
      id: Date.now().toString(),
      name: form.name.trim(),
      description: form.description.trim() || form.name,
      price: Number(form.price),
      cycle: form.cycle,
      nextBillingDate: form.nextBillingDate,
      payment: { type: pm.type, last4: pm.last4 ?? pm.phone?.slice(-4) ?? "0000" },
      paymentMethodId: pm.id,
      category: form.category,
      color: form.color,
      active: true,
    });
    onClose();
  }

  const set = (k: keyof AddForm) => (v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(44,31,20,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose} />

      {/* Sheet */}
      <div ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          maxHeight: "92dvh", borderRadius: "24px 24px 0 0",
          backgroundColor: E.card, boxShadow: "0 -4px 32px rgba(60,35,15,0.18)",
        }}>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: E.inkLight }} />
        </div>

        {/* Header */}
        <div className="flex items-center px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${E.divider}` }}>
          {step === "details" ? (
            <button onClick={() => setStep("pick")} className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ backgroundColor: E.urgNorm.bg }}>
              <ChevronLeft size={18} style={{ color: E.inkMid }} />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <p className="flex-1 text-center" style={{ fontSize: "1rem", fontWeight: 600, color: E.inkDark }}>
            {step === "pick" ? "เลือกบริการ" : "รายละเอียด"}
          </p>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: E.urgNorm.bg }}>
            <X size={18} style={{ color: E.inkMid }} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {step === "pick" ? (
            // ── Step 1: Pick service ─────────────────────────────────────────
            <div className="px-5 py-5">
              <p style={{ fontSize: "0.8125rem", color: E.inkMid, marginBottom: 16 }}>เลือกบริการด้านล่าง หรือเพิ่มชื่อเอง</p>
              <div className="grid grid-cols-3 gap-3">
                {PRESET_SERVICES.map(p => (
                  <button key={p.name} onClick={() => pickPreset(p)}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
                    style={{ backgroundColor: E.cardSurface, border: `1px solid ${E.divider}` }}>
                    <div className="rounded-xl flex items-center justify-center text-white"
                      style={{ width: 44, height: 44, backgroundColor: p.color }}>
                      <ServiceIcon icon={p.icon} size={44} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500, color: E.inkDark }}>{p.name}</span>
                  </button>
                ))}
                <button onClick={pickCustom}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
                  style={{ backgroundColor: E.urgNorm.bg, border: `1.5px dashed ${E.inputBorder}` }}>
                  <div className="rounded-xl flex items-center justify-center"
                    style={{ width: 44, height: 44, backgroundColor: E.accent }}>
                    <Plus size={20} style={{ color: E.pillActiveTxt }} />
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 500, color: E.inkMid }}>กรอกเอง</span>
                </button>
              </div>
            </div>
          ) : (
            // ── Step 2: Fill details ─────────────────────────────────────────
            <div className="px-5 py-5 space-y-5 pb-8">
              {/* Preview */}
              <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: E.cardSurface, border: `1px solid ${E.divider}` }}>
                <div className="rounded-2xl flex items-center justify-center text-white shrink-0"
                  style={{ width: 44, height: 44, backgroundColor: form.color }}>
                  <ServiceIcon icon={form.icon} size={44} />
                </div>
                <div>
                  <p style={{ fontSize: "1rem", fontWeight: 600, color: E.inkDark }}>{form.name || "ชื่อบริการ"}</p>
                  <p style={{ fontSize: "0.8125rem", color: E.inkLight }}>
                    {form.price ? `฿${Number(form.price).toLocaleString()}` : "—"} · {form.cycle === "monthly" ? "รายเดือน" : "รายปี"}
                  </p>
                </div>
              </div>

              {/* Name */}
              <Field label="ชื่อบริการ">
                <TextInput value={form.name} onChange={set("name")} placeholder="เช่น Netflix, Spotify" />
                {errors.name && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.name}</p>}
              </Field>

              {/* Custom: Color & Icon picker */}
              {form.isCustom && (
                <>
                  <Field label="สี">
                    <div className="flex gap-2 flex-wrap">
                      {CUSTOM_COLORS.map(c => (
                        <button key={c} onClick={() => set("color")(c)}
                          className="w-10 h-10 rounded-xl transition-all active:scale-95 relative"
                          style={{ backgroundColor: c, border: form.color === c ? `3px solid ${E.accent}` : `1px solid ${E.divider}` }}>
                          {form.color === c && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={16} style={{ color: "#fff" }} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="ไอคอน">
                    <div className="flex gap-2 flex-wrap">
                      {CUSTOM_ICONS.map(({ id, icon }) => (
                        <button key={id} onClick={() => set("icon")(icon)}
                          className="w-12 h-12 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                          style={{
                            backgroundColor: form.icon === icon ? E.accent : E.cardSurface,
                            border: `1px solid ${form.icon === icon ? E.accent : E.divider}`,
                            color: form.icon === icon ? E.pillActiveTxt : E.inkMid,
                          }}>
                          <ServiceIcon icon={icon} size={48} />
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {/* Description */}
              <Field label="แพ็กเกจ / รายละเอียด">
                <TextInput value={form.description} onChange={set("description")} placeholder="เช่น Standard, Premium" />
              </Field>

              {/* Price + Cycle */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="ราคา (฿)">
                  <TextInput value={form.price} onChange={set("price")} placeholder="0" type="number" />
                  {errors.price && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.price}</p>}
                </Field>
                <Field label="รอบบิล">
                  <div className="flex rounded-xl overflow-hidden" style={{ border: `1.5px solid ${E.inputBorder}` }}>
                    {(["monthly", "yearly"] as BillingCycle[]).map((c, i) => (
                      <button key={c} onClick={() => set("cycle")(c)}
                        className="flex-1 py-3 transition-all"
                        style={{
                          fontSize: "0.8125rem", fontWeight: form.cycle === c ? 600 : 400,
                          backgroundColor: form.cycle === c ? E.primary : E.input,
                          color: form.cycle === c ? E.pillActiveTxt : E.inkMid,
                          borderRight: i === 0 ? `1px solid ${E.inputBorder}` : "none",
                        }}>
                        {c === "monthly" ? "เดือน" : "ปี"}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Next billing date */}
              <Field label="วันตัดบัตรครั้งถัดไป">
                <div className="relative">
                  <input
                    type="date" value={form.nextBillingDate}
                    onChange={e => set("nextBillingDate")(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{
                      fontSize: "0.9375rem", color: E.inkDark,
                      backgroundColor: E.input, border: `1.5px solid ${E.inputBorder}`,
                      colorScheme: "light",
                    }}
                  />
                  <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: E.inkLight }} />
                </div>
                {errors.nextBillingDate && <p style={{ fontSize: "0.75rem", color: E.urgToday.text }}>{errors.nextBillingDate}</p>}
              </Field>

              {/* Payment method */}
              <Field label="ช่องทางชำระเงิน">
                <div className="space-y-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.type === "visa" || pm.type === "mastercard" || pm.type === "amex" ? CreditCard
                      : pm.type === "bank" ? Building2
                      : pm.type === "promptpay" ? Smartphone
                      : Wallet;
                    return (
                      <button key={pm.id} onClick={() => set("paymentId")(pm.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                        style={{
                          backgroundColor: form.paymentId === pm.id ? E.cardSurface : E.input,
                          border: `1.5px solid ${form.paymentId === pm.id ? E.accent : E.inputBorder}`,
                        }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: form.paymentId === pm.id ? E.accent : E.inkLight }}>
                          <Icon size={14} style={{ color: "#fff" }} />
                        </div>
                        <span style={{ flex: 1, fontSize: "0.9375rem", color: E.inkDark, textAlign: "left" }}>{pm.label}</span>
                        {form.paymentId === pm.id && <Check size={16} style={{ color: E.accent }} />}
                      </button>
                    );
                  })}
                  <button onClick={onAddPayment}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98]"
                    style={{ backgroundColor: E.urgNorm.bg, border: `1.5px dashed ${E.inputBorder}` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: E.accent }}>
                      <Plus size={16} style={{ color: E.pillActiveTxt }} />
                    </div>
                    <span style={{ flex: 1, fontSize: "0.9375rem", fontWeight: 500, color: E.inkMid, textAlign: "left" }}>เพิ่มบัตร/บัญชี</span>
                  </button>
                </div>
              </Field>

              {/* Category */}
              <Field label="หมวดหมู่">
                <div className="flex gap-2 flex-wrap">
                  {(["entertainment", "productivity", "developer", "cloud"] as Category[]).map(cat => {
                    const labels: Record<Category, string> = { entertainment: "ความบันเทิง", productivity: "งาน", developer: "Developer", cloud: "Cloud" };
                    return (
                      <button key={cat} onClick={() => set("category")(cat)}
                        className="px-3 py-2 rounded-xl transition-all"
                        style={{
                          fontSize: "0.8125rem", fontWeight: form.category === cat ? 600 : 400,
                          backgroundColor: form.category === cat ? E.primary : E.input,
                          color: form.category === cat ? E.pillActiveTxt : E.inkMid,
                          border: `1px solid ${form.category === cat ? "transparent" : E.inputBorder}`,
                        }}>
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step === "details" && (
          <div className="px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${E.divider}`, backgroundColor: E.card, paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
            <button onClick={handleSave}
              className="w-full py-4 rounded-2xl transition-all active:scale-[0.98]"
              style={{ fontSize: "1rem", fontWeight: 600, backgroundColor: E.primary, color: E.pillActiveTxt, boxShadow: E.shadowDark }}>
              บันทึก Subscription
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Attention Banner ──────────────────────────────────────────────────────────
function AttentionBanner({ items }: { items: Subscription[] }) {
  if (items.length === 0) return null;
  const isToday = daysUntil(items[0].nextBillingDate) <= 1;
  const palette = isToday ? E.urgToday : E.urgSoon;
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: palette.bg, border: `1px solid ${palette.icon}` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: palette.icon }}>
        <AlertCircle size={18} style={{ color: palette.text }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: palette.text }}>
          {isToday ? "ถูกเรียกเก็บวันนี้" : `${items.length} รายการใน 7 วันข้างหน้า`}
        </p>
        <p style={{ fontSize: "0.75rem", color: palette.sub }} className="truncate">
          {items.map(s => s.name).join(" · ")}
        </p>
      </div>
      <ArrowRight size={16} style={{ color: palette.text }} className="shrink-0" />
    </div>
  );
}

// ── Subscription Card ─────────────────────────────────────────────────────────
function SubCard({ sub, expanded, onToggle }: { sub: Subscription; expanded: boolean; onToggle: () => void }) {
  const days = daysUntil(sub.nextBillingDate);
  const u = urgency(days);
  const urg = u === "today" ? { bg: E.urgToday.bg, color: E.urgToday.text }
    : u === "soon" ? { bg: E.urgSoon.bg, color: E.urgSoon.text }
    : { bg: E.urgNorm.bg, color: E.urgNorm.text };
  const urgText = days <= 0 ? "วันนี้" : days === 1 ? "พรุ่งนี้" : `${days} วัน`;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: E.card, boxShadow: E.shadow }}>
      <button className="w-full px-4 py-4 flex items-center gap-3 text-left" onClick={onToggle}>
        <ServiceAvatar name={sub.name} color={sub.color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: E.inkDark }}>{sub.name}</span>
            <span className="rounded-full px-2 py-0.5" style={{
              fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.02em",
              backgroundColor: sub.cycle === "monthly" ? E.monthly.bg : E.yearly.bg,
              color: sub.cycle === "monthly" ? E.monthly.text : E.yearly.text,
            }}>
              {sub.cycle === "monthly" ? "รายเดือน" : "รายปี"}
            </span>
          </div>
          <p className="mt-0.5 truncate" style={{ fontSize: "0.8125rem", color: E.inkLight }}>{sub.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: E.inkDark }}>฿{sub.price.toLocaleString()}</span>
          <span className="rounded-full px-2 py-0.5" style={{ fontSize: "0.6875rem", fontWeight: 600, backgroundColor: urg.bg, color: urg.color }}>
            {urgText}
          </span>
        </div>
        <ChevronDown size={16} className="shrink-0"
          style={{ color: E.inkLight, marginLeft: 2, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {expanded && (
        <div style={{ backgroundColor: E.cardSurface, borderTop: `1px solid ${E.divider}` }}>
          <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: E.divider }}>
            {[
              { label: "ตัดบัตรครั้งถัดไป", value: formatShortDate(sub.nextBillingDate) },
              { label: "ช่องทางชำระ", value: `${PAYMENT_BRAND[sub.payment.type]} ···· ${sub.payment.last4}` },
              { label: "เทียบต่อเดือน", value: `฿${Math.round(toMonthly(sub.price, sub.cycle)).toLocaleString()}` },
              { label: "รอบบิล", value: sub.cycle === "monthly" ? "ทุกเดือน" : "ทุกปี" },
            ].map(item => (
              <div key={item.label} className="px-4 py-3" style={{ backgroundColor: E.cardSurface }}>
                <p style={{ fontSize: "0.6875rem", color: E.inkLight, letterSpacing: "0.04em", textTransform: "uppercase" }}>{item.label}</p>
                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: E.inkDark }} className="mt-1">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-4">
            <button className="flex-1 py-2.5 rounded-xl"
              style={{ fontSize: "0.875rem", fontWeight: 500, backgroundColor: E.urgNorm.bg, color: E.inkMid }}>แก้ไข</button>
            <button className="flex-1 py-2.5 rounded-xl"
              style={{ fontSize: "0.875rem", fontWeight: 500, backgroundColor: E.urgToday.bg, color: E.urgToday.text }}>ยกเลิก</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Month Group (History) ─────────────────────────────────────────────────────
function MonthGroup({ monthKey, entries, defaultOpen }: { monthKey: string; entries: HistoryEntry[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const total = entries.reduce((s, e) => s + e.price, 0);
  const sorted = [...entries].sort((a, b) => a.paidDate.localeCompare(b.paidDate));
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: E.card, boxShadow: E.shadow }}>
      <button className="w-full px-4 py-4 flex items-center justify-between" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: E.inkDark }}>{monthLabel(monthKey)}</span>
          <span className="rounded-full px-2 py-0.5" style={{ fontSize: "0.625rem", fontWeight: 600, backgroundColor: E.urgNorm.bg, color: E.inkMid }}>
            {entries.length} รายการ
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: E.inkDark }}>฿{total.toLocaleString()}</span>
          <ChevronDown size={16} style={{ color: E.inkLight, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
        </div>
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${E.divider}` }}>
          {sorted.map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < sorted.length - 1 ? `1px solid ${E.divider}` : "none" }}>
              <ServiceAvatar name={entry.name} color={entry.color} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: E.inkDark }}>{entry.name}</span>
                  <span className="rounded-full px-1.5 py-0.5" style={{
                    fontSize: "0.5625rem", fontWeight: 600,
                    backgroundColor: entry.cycle === "monthly" ? E.monthly.bg : E.yearly.bg,
                    color: entry.cycle === "monthly" ? E.monthly.text : E.yearly.text,
                  }}>
                    {entry.cycle === "monthly" ? "เดือน" : "ปี"}
                  </span>
                </div>
                <p className="mt-0.5" style={{ fontSize: "0.75rem", color: E.inkLight }}>
                  {formatShortDate(entry.paidDate)} · {PAYMENT_BRAND[entry.payment.type]} ···· {entry.payment.last4}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: E.inkDark }}>฿{entry.price.toLocaleString()}</span>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <Check size={10} style={{ color: E.paid }} />
                  <span style={{ fontSize: "0.625rem", color: E.paid, fontWeight: 600 }}>ชำระแล้ว</span>
                </div>
              </div>
            </div>
          ))}
          <div className="px-4 py-3 flex justify-between" style={{ backgroundColor: E.cardSurface }}>
            <span style={{ fontSize: "0.8125rem", color: E.inkMid }}>รวม {entries.length} รายการ</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: E.inkDark }}>฿{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subscriptions View ────────────────────────────────────────────────────────
function SubscriptionsView({ subscriptions }: { subscriptions: Subscription[] }) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = subscriptions.filter(s => s.active);
  const filtered = active.filter(s => filter === "all" || s.cycle === filter);
  const totalMonthly = active.reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0);
  const urgent = active.filter(s => daysUntil(s.nextBillingDate) <= 7).sort((a, b) => daysUntil(a.nextBillingDate) - daysUntil(b.nextBillingDate));

  return (
    <div className="space-y-5">
      <AttentionBanner items={urgent} />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ backgroundColor: E.primary, boxShadow: E.shadowDark }}>
          <p style={{ fontSize: "0.6875rem", color: "rgba(250,246,240,0.5)", letterSpacing: "0.05em", textTransform: "uppercase" }}>รายจ่ายต่อเดือน</p>
          <p style={{ fontSize: "1.625rem", fontWeight: 700, color: E.pillActiveTxt, letterSpacing: "-0.02em" }} className="mt-2">
            ฿{Math.round(totalMonthly).toLocaleString()}
          </p>
          <p style={{ fontSize: "0.75rem", color: "rgba(250,246,240,0.45)" }} className="mt-1">{active.length} subscriptions</p>
        </div>
        <div className="rounded-2xl p-4" style={{ backgroundColor: E.card, boxShadow: E.shadow, border: `1px solid ${E.divider}` }}>
          <p style={{ fontSize: "0.6875rem", color: E.inkLight, letterSpacing: "0.05em", textTransform: "uppercase" }}>ถัดไปใน</p>
          {urgent[0] ? (
            <>
              <p style={{ fontSize: "1.625rem", fontWeight: 700, color: E.inkDark, letterSpacing: "-0.02em" }} className="mt-2">
                {Math.max(0, daysUntil(urgent[0].nextBillingDate))} วัน
              </p>
              <p style={{ fontSize: "0.75rem", color: E.inkLight }} className="mt-1 truncate">{urgent[0].name}</p>
            </>
          ) : (
            <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: E.inkDark }} className="mt-2">ไม่มีรายการใกล้</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {(["all", "monthly", "yearly"] as FilterTab[]).map(f => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {{ all: "ทั้งหมด", monthly: "รายเดือน", yearly: "รายปี" }[f]}
          </Pill>
        ))}
      </div>
      <div className="space-y-2.5">
        {filtered.map(sub => (
          <SubCard key={sub.id} sub={sub}
            expanded={expandedId === sub.id}
            onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center rounded-2xl" style={{ backgroundColor: E.card, boxShadow: E.shadow }}>
            <p style={{ fontSize: "0.9375rem", color: E.inkLight }}>ไม่มีรายการ</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── History View ──────────────────────────────────────────────────────────────
function HistoryView({ entries }: { entries: HistoryEntry[] }) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const years = [...new Set(entries.map(e => new Date(e.paidDate).getFullYear()))].sort((a, b) => b - a);
  const filtered = selectedYear ? entries.filter(e => new Date(e.paidDate).getFullYear() === selectedYear) : entries;
  const grouped = groupByMonth(filtered);
  const total = filtered.reduce((s, e) => s + e.price, 0);
  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        <Pill active={selectedYear === null} onClick={() => setSelectedYear(null)}>ทั้งหมด</Pill>
        {years.map(y => (
          <Pill key={y} active={selectedYear === y} onClick={() => setSelectedYear(selectedYear === y ? null : y)}>{y}</Pill>
        ))}
      </div>
      {selectedYear === null && (
        <div className="grid grid-cols-2 gap-3">
          {years.map(y => {
            const yEntries = entries.filter(e => new Date(e.paidDate).getFullYear() === y);
            const yTotal = yEntries.reduce((s, e) => s + e.price, 0);
            return (
              <button key={y} onClick={() => setSelectedYear(y)} className="rounded-2xl p-4 text-left"
                style={{ backgroundColor: E.card, boxShadow: E.shadow, border: `1px solid ${E.divider}` }}>
                <p style={{ fontSize: "0.6875rem", color: E.inkLight, letterSpacing: "0.05em", textTransform: "uppercase" }}>{y}</p>
                <p style={{ fontSize: "1.375rem", fontWeight: 700, color: E.inkDark, letterSpacing: "-0.02em" }} className="mt-1">
                  ฿{yTotal.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span style={{ fontSize: "0.75rem", color: E.inkLight }}>{yEntries.length} รายการ</span>
                  <ChevronRight size={12} style={{ color: E.inkLight }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-between px-1">
        <p style={{ fontSize: "0.8125rem", color: E.inkMid }}>{grouped.length} เดือน · {filtered.length} รายการ</p>
        <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: E.inkDark }}>฿{total.toLocaleString()}</p>
      </div>
      <div className="space-y-2.5">
        {grouped.map(([key, entries], i) => (
          <MonthGroup key={key} monthKey={key} entries={entries} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export function SubsacipPage() {
  const [tab, setTab] = useState<MainTab>("subscriptions");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(mockHistory);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const active = subscriptions.filter(s => s.active);
  const urgent = active.filter(s => daysUntil(s.nextBillingDate) <= 7);

  useEffect(() => {
    let ignore = false;

    async function loadFromApi() {
      try {
        const [nextSubscriptions, nextPaymentMethods, nextHistory] = await Promise.all([
          apiRequest<Subscription[]>("/subscriptions"),
          apiRequest<PaymentMethod[]>("/payment-methods"),
          apiRequest<HistoryEntry[]>("/history"),
        ]);

        if (!ignore) {
          setSubscriptions(nextSubscriptions);
          setPaymentMethods(nextPaymentMethods);
          setHistoryEntries(nextHistory);
        }
      } catch (error) {
        console.warn("Using local mock data because the API is unavailable.", error);
      }
    }

    loadFromApi();
    return () => {
      ignore = true;
    };
  }, []);

  function handleAdd(sub: Subscription) {
    setSubscriptions(prev => [sub, ...prev]);
    apiRequest<Subscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(toSubscriptionPayload(sub)),
    })
      .then(saved => setSubscriptions(prev => prev.map(item => item.id === sub.id ? saved : item)))
      .catch(error => console.warn("Subscription was saved locally only.", error));
  }

  function handleAddPayment(pm: PaymentMethod) {
    setPaymentMethods(prev => [...prev, pm]);
    apiRequest<PaymentMethod>("/payment-methods", {
      method: "POST",
      body: JSON.stringify(toPaymentMethodPayload(pm)),
    })
      .then(saved => setPaymentMethods(prev => prev.map(item => item.id === pm.id ? saved : item)))
      .catch(error => console.warn("Payment method was saved locally only.", error));
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: E.bg }}>
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      {/* Header */}
      <div style={{ backgroundColor: E.bg, position: "sticky", top: 0, zIndex: 20, paddingTop: 8 }}>
        <div className="max-w-lg mx-auto px-5">
          <div className="flex items-center justify-between py-3">
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: E.inkDark, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {tab === "subscriptions" ? "Subscriptions" : "ประวัติ"}
              </h1>
              {tab === "subscriptions" && (
                <p style={{ fontSize: "0.8125rem", color: E.inkMid, marginTop: 2 }}>
                  {active.length} บริการ
                  {urgent.length > 0 && <> · <span style={{ color: E.urgSoon.text }}>{urgent.length} ใกล้ครบกำหนด</span></>}
                </p>
              )}
            </div>
            {tab === "subscriptions" && (
              <button onClick={() => setShowAdd(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{ backgroundColor: E.primary, boxShadow: E.shadowDark }}>
                <Plus size={20} color={E.pillActiveTxt} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 pb-28">
        {tab === "subscriptions"
          ? <SubscriptionsView subscriptions={subscriptions} />
          : <HistoryView entries={historyEntries} />}
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30"
        style={{
          backgroundColor: "rgba(240,234,224,0.94)", backdropFilter: "blur(20px)",
          borderTop: `1px solid ${E.divider}`, paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}>
        <div className="max-w-lg mx-auto flex">
          {([
            { key: "subscriptions" as MainTab, label: "Subscriptions", Icon: LayoutGrid },
            { key: "history" as MainTab, label: "ประวัติ", Icon: History },
          ]).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-all"
              style={{ color: tab === key ? E.inkDark : E.inkLight }}>
              <Icon size={22} strokeWidth={tab === key ? 2.2 : 1.8} />
              <span style={{ fontSize: "0.625rem", fontWeight: tab === key ? 600 : 400, letterSpacing: "0.02em" }}>
                {label}
              </span>
              {key === "subscriptions" && urgent.length > 0 && tab !== key && (
                <div style={{ position: "absolute", top: 10, left: "50%", marginLeft: 6, width: 6, height: 6, borderRadius: "50%", backgroundColor: E.urgSoon.text }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add Subscription Sheet */}
      {showAdd && (
        <AddSubscriptionSheet
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          paymentMethods={paymentMethods}
          onAddPayment={() => {
            setShowAdd(false);
            setShowAddPayment(true);
          }}
        />
      )}

      {/* Add Payment Sheet */}
      {showAddPayment && (
        <AddPaymentSheet
          onClose={() => {
            setShowAddPayment(false);
            setShowAdd(true);
          }}
          onAdd={(pm) => {
            handleAddPayment(pm);
            setShowAddPayment(false);
            setShowAdd(true);
          }}
        />
      )}
    </div>
  );
}
