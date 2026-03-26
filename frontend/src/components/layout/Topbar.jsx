import { Calendar } from "lucide-react";
import { C } from "../../constants";

export default function Topbar({ title, subtitle }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday:"short", year:"numeric", month:"short", day:"numeric",
  });

  return (
    <header style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:200 }}>
      <div>
        <h1 style={{ fontSize:18, fontWeight:800, color:C.text, letterSpacing:-0.3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize:12, color:C.mute, marginTop:2 }}>{subtitle}</p>}
      </div>
      <div style={{ fontSize:12, color:C.sub, background:C.bg, padding:"6px 12px", borderRadius:8, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:5 }}>
        <Calendar size={12} />{today}
      </div>
    </header>
  );
}
