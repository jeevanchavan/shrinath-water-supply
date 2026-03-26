import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { C, TRIP_STATUS_MAP, DRIVER_STATUS_MAP } from "../../constants";

/* ── Badge ─────────────────────────────────────────────────── */
export function Badge({ type, map = TRIP_STATUS_MAP }) {
  const s = map[type] || { label: type, bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"2px 10px", borderRadius:99,
      fontSize:11.5, fontWeight:600,
      background:s.bg, color:s.color, whiteSpace:"nowrap",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot||s.color, flexShrink:0 }} />
      {s.label}
    </span>
  );
}

/* ── Avatar ─────────────────────────────────────────────────── */
export function Avatar({ name = "", size = 34, color = C.blue }) {
  const init = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:color+"22", border:`1.5px solid ${color}33`,
      color, display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.33, fontWeight:700, flexShrink:0,
    }}>{init}</div>
  );
}

/* ── Spinner ─────────────────────────────────────────────────── */
export function Spinner({ size = 20, color = C.blue }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      border:`2.5px solid ${color}33`,
      borderTopColor:color,
      animation:"spin 0.7s linear infinite", flexShrink:0,
    }} />
  );
}

/* ── PageLoader ─────────────────────────────────────────────── */
export function PageLoader() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0" }}>
      <Spinner size={32} />
    </div>
  );
}

/* ── Button ─────────────────────────────────────────────────── */
export function Btn({ children, onClick, type="button", variant="primary", size="md", disabled=false, full=false, style={} }) {
  const sizes = {
    sm:{ padding:"5px 12px", fontSize:12 },
    md:{ padding:"9px 18px", fontSize:13 },
    lg:{ padding:"12px 24px",fontSize:14 },
  };
  const variants = {
    primary: { background:C.blue,   color:"#fff", border:"none", boxShadow:`0 2px 8px ${C.blue}33` },
    success: { background:C.green,  color:"#fff", border:"none" },
    danger:  { background:C.red,    color:"#fff", border:"none" },
    ghost:   { background:"transparent", color:C.sub, border:`1px solid ${C.border}` },
    outline: { background:"transparent", color:C.blue, border:`1px solid ${C.blue}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display:"inline-flex", alignItems:"center", gap:6,
        borderRadius:9, cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit", fontWeight:600, transition:"opacity 0.13s",
        opacity:disabled?0.6:1, width:full?"100%":undefined,
        justifyContent:full?"center":undefined,
        ...sizes[size], ...variants[variant], ...style,
      }}
    >{children}</button>
  );
}

/* ── Input ─────────────────────────────────────────────────── */
export function Input({ label, name, value, onChange, type="text", placeholder, required, error }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && (
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.sub, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>
          {label}{required && <span style={{ color:C.red }}> *</span>}
        </label>
      )}
      <input
        name={name} value={value} onChange={onChange}
        type={type} placeholder={placeholder} required={required}
        style={{
          width:"100%", padding:"10px 13px", borderRadius:9,
          border:`1px solid ${error ? C.red : C.border}`,
          fontSize:13.5, color:C.text, outline:"none",
          background:"#FAFBFD", fontFamily:"inherit",
        }}
        onFocus={e => (e.target.style.borderColor = C.blue)}
        onBlur={e  => (e.target.style.borderColor = error ? C.red : C.border)}
      />
      {error && <p style={{ fontSize:11.5, color:C.red, marginTop:3 }}>{error}</p>}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────────── */
export function Select({ label, name, value, onChange, options=[], required, placeholder="Select…" }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && (
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.sub, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>
          {label}{required && <span style={{ color:C.red }}> *</span>}
        </label>
      )}
      <select
        name={name} value={value} onChange={onChange} required={required}
        style={{
          width:"100%", padding:"10px 13px", borderRadius:9,
          border:`1px solid ${C.border}`, fontSize:13.5, color:C.text,
          outline:"none", background:"#FAFBFD", fontFamily:"inherit", cursor:"pointer",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ── Modal ─────────────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, width=440 }) {
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:999,
        background:"rgba(9,18,43,0.5)", backdropFilter:"blur(2px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:16,
      }}
    >
      <div
        className="modal-enter"
        onClick={e => e.stopPropagation()}
        style={{
          background:C.card, borderRadius:18, padding:30,
          width:"100%", maxWidth:width,
          boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
          border:`1px solid ${C.border}`,
          maxHeight:"90vh", overflowY:"auto",
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontSize:17, fontWeight:800, color:C.text }}>{title}</h3>
          <button onClick={onClose} style={{ border:"none", background:C.bg, cursor:"pointer", width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:C.sub }}>
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── SearchInput ─────────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder="Search…" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"0 14px", minWidth:220 }}>
      <Search size={13} color={C.mute} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ border:"none", outline:"none", background:"transparent", fontSize:13, color:C.text, padding:"9px 0", fontFamily:"inherit", width:"100%" }}
      />
      {value && (
        <button onClick={() => onChange("")} style={{ border:"none", background:"none", cursor:"pointer", color:C.mute, padding:0, display:"flex" }}>
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────── */
export function Card({ children, style={} }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  );
}

export function CardHeader({ title, right }) {
  return (
    <div style={{ padding:"16px 22px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{title}</span>
      {right && right}
    </div>
  );
}

/* ── KPICard ─────────────────────────────────────────────────── */
export function KPICard({ label, value, delta, icon, color=C.blue, prefix="" }) {
  const pos = typeof delta === "number" ? delta >= 0 : null;
  return (
    <div style={{ background:C.card, borderRadius:14, padding:"20px 22px", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:14, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:38, height:38, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center", color }}>
          {icon}
        </div>
        {pos !== null && (
          <span style={{ fontSize:11.5, fontWeight:600, color:pos ? C.green : C.red }}>
            {pos ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:-0.5, lineHeight:1 }}>{prefix}{value ?? "—"}</div>
        <div style={{ fontSize:12.5, color:C.sub, marginTop:5, fontWeight:500 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Pill filter ─────────────────────────────────────────────── */
export function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${active ? C.blue : C.border}`, background:active ? C.blueL : C.card, color:active ? C.blue : C.sub, fontSize:12.5, fontWeight:500, cursor:"pointer" }}>
      {label}
    </button>
  );
}

/* ── Table ─────────────────────────────────────────────────── */
export function Table({ children }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>{children}</table>
    </div>
  );
}
export function THead({ cols }) {
  return (
    <thead>
      <tr>
        {cols.map(c => (
          <th key={c} style={{ padding:"10px 18px", textAlign:"left", fontSize:11, fontWeight:700, color:C.mute, borderBottom:`1px solid ${C.border}`, background:"#F8FAFC", letterSpacing:0.5, textTransform:"uppercase", whiteSpace:"nowrap" }}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}
export function TRow({ children, i=0 }) {
  return <tr style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?"#fff":"#FAFBFD" }}>{children}</tr>;
}
export function TD({ children, style={} }) {
  return <td style={{ padding:"12px 18px", fontSize:13.5, color:C.text, ...style }}>{children}</td>;
}
export function TFoot({ left, right }) {
  return (
    <div style={{ padding:"10px 18px", background:"#F8FAFC", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:12, color:C.mute }}>{left}</span>
      {right && right}
    </div>
  );
}

/* ── EmptyState ─────────────────────────────────────────────── */
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", gap:12, textAlign:"center" }}>
      <div style={{ opacity:0.3 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:700, color:C.sub }}>{title}</div>
      {desc && <div style={{ fontSize:13, color:C.mute, maxWidth:280 }}>{desc}</div>}
      {action && <div style={{ marginTop:8 }}>{action}</div>}
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────────── */
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const btn = (label, target, disabled) => (
    <button
      key={label}
      onClick={() => !disabled && onPage(target)}
      disabled={disabled}
      style={{ minWidth:30, height:30, borderRadius:7, border:`1px solid ${C.border}`, background:C.card, color:disabled?C.mute:C.sub, cursor:disabled?"not-allowed":"pointer", fontSize:12.5, opacity:disabled?0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}
    >{label}</button>
  );
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      {btn(<ChevronLeft size={14}/>, page-1, page===1)}
      {Array.from({length:pages},(_,i)=>i+1).map(p => (
        <button key={p} onClick={() => onPage(p)} style={{ minWidth:30, height:30, borderRadius:7, border:`1px solid ${p===page?C.blue:C.border}`, background:p===page?C.blueL:C.card, color:p===page?C.blue:C.sub, fontWeight:p===page?700:400, cursor:"pointer", fontSize:12.5 }}>
          {p}
        </button>
      ))}
      {btn(<ChevronRight size={14}/>, page+1, page===pages)}
    </div>
  );
}

/* ── BarChart ─────────────────────────────────────────────── */
export function BarChart({ data=[], color=C.blue, prefix="", height=140 }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:10, height, position:"relative" }}>
      {[25,50,75,100].map(pct => (
        <div key={pct} style={{ position:"absolute", left:0, right:0, bottom:`${(pct/100)*(height-24)+24}px`, borderTop:`1px dashed ${C.border}`, zIndex:0 }} />
      ))}
      {data.map((d,i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, zIndex:1 }}>
          <div style={{ fontSize:10.5, fontWeight:700, color }}>{prefix}{d.value>=1000?`${(d.value/1000).toFixed(1)}k`:d.value}</div>
          <div style={{ width:"100%", borderRadius:"5px 5px 0 0", background:`linear-gradient(to top,${color},${color}88)`, height:`${(d.value/max)*(height-32)}px`, transition:"height 0.5s ease" }} />
          <div style={{ fontSize:10, color:C.mute, position:"absolute", bottom:0 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}
