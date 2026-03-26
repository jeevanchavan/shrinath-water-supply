import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Droplets, Users, Truck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/ui";
import { C } from "../../constants";

const DEMO = {
  owner:  { phone:"9999999999", password:"owner123"  },
  driver: { phone:"9876543210", password:"driver123" },
};

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate         = useNavigate();
  const isDev            = import.meta.env.DEV;

  const [role,    setRole]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Sign In — Shrinath Water Distributors";
  }, []);

  if (user) return <Navigate to={user.role === "owner" ? "/owner" : "/driver"} replace />;

  const fillDemo = (r) => {
    setRole(r);
    setPhone(DEMO[r].phone);
    setPass(DEMO[r].password);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role)  { setError("Please select your role."); return; }
    if (!phone) { setError("Phone number is required."); return; }
    if (!pass)  { setError("Password is required."); return; }
    setError("");
    setLoading(true);
    try {
      const u = await login(phone, pass);
      navigate(u.role === "owner" ? "/owner" : "/driver", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width:"100%", padding:"11px 15px", borderRadius:10,
    border:`1px solid ${C.border}`, fontSize:14, color:C.text,
    outline:"none", background:"#FAFBFD", fontFamily:"inherit",
    boxSizing:"border-box",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:`linear-gradient(135deg,#0C1A35 0%,#1e3a6e 55%,#2563EB 120%)` }}>

      {/* ── Left hero ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"64px 80px", color:"#fff", position:"relative", overflow:"hidden" }}>
        {[280,170,80].map((s,i) => (
          <div key={i} style={{ position:"absolute", right:-s/3, top:"18%", width:s, height:s, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.05)", pointerEvents:"none" }} />
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:52 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Droplets size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:800, lineHeight:1.2 }}>Shrinath Water</div>
            <div style={{ fontSize:11, fontWeight:800, lineHeight:1.2 }}>Distributors</div>
            <div style={{ fontSize:10, opacity:0.4, letterSpacing:1.2, textTransform:"uppercase", marginTop:2 }}>Management System</div>
          </div>
        </div>
        <h1 style={{ fontSize:44, fontWeight:800, lineHeight:1.12, margin:"0 0 18px", letterSpacing:-1.5, maxWidth:420 }}>
          Water Delivery,<br />
          <span style={{ color:"#60A5FA" }}>Simplified.</span>
        </h1>
        <p style={{ fontSize:15, opacity:0.6, lineHeight:1.8, maxWidth:360 }}>
          Manage trips, track drivers, collect payments — all from one dashboard.
        </p>
        <div style={{ display:"flex", gap:32, marginTop:52 }}>
          {[["134","Trips/Month"],["₹22k","Revenue"],["3","Drivers"],["6","Customers"]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize:28, fontWeight:900, letterSpacing:-0.5 }}>{v}</div>
              <div style={{ fontSize:11.5, opacity:0.45, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div style={{ width:472, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div style={{ width:"100%", background:C.card, borderRadius:20, padding:36, boxShadow:"0 24px 60px rgba(0,0,0,0.3)", border:`1px solid ${C.border}` }}>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.text, margin:"0 0 4px" }}>Sign In</h2>
          <p style={{ fontSize:13, color:C.mute, margin:"0 0 24px" }}>Choose your role and enter credentials</p>

          {/* Role selector */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
            {[
              { key:"owner",  Icon:Users, label:"Owner",  desc:"Full access"         },
              { key:"driver", Icon:Truck, label:"Driver", desc:"My trips & earnings" },
            ].map(r => {
              const on = role === r.key;
              return (
                <button key={r.key} type="button" onClick={() => { setRole(r.key); setError(""); }}
                  style={{ padding:"14px 12px", borderRadius:12, border:`2px solid ${on ? C.blue : C.border}`, background:on ? C.blueL : "#FAFBFD", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:on ? C.blue : C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <r.Icon size={17} color={on ? "#fff" : C.mute} />
                  </div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:on ? C.blue : C.text }}>{r.label}</div>
                  <div style={{ fontSize:11, color:C.mute }}>{r.desc}</div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.sub, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="e.g. 9999999999" style={inp}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e  => (e.target.style.borderColor = C.border)}
              />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.sub, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>Password</label>
              <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="Enter password" style={inp}
                onFocus={e => (e.target.style.borderColor = C.blue)}
                onBlur={e  => (e.target.style.borderColor = C.border)}
              />
            </div>

            {error && (
              <div style={{ fontSize:12.5, color:C.red, marginBottom:12, padding:"8px 12px", background:C.redBg, borderRadius:8, fontWeight:500 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"12px", borderRadius:11, border:"none", background:`linear-gradient(135deg,${C.blue},${C.blueM})`, color:"#fff", fontSize:14.5, fontWeight:700, cursor:loading?"not-allowed":"pointer", marginTop:4, opacity:loading?0.8:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:`0 4px 16px ${C.blue}44` }}>
              {loading ? <><Spinner size={16} color="#fff" /> Signing in…</> : "Sign In →"}
            </button>
          </form>

          {/* Demo fill — only visible in development */}
          {isDev && (
            <div style={{ marginTop:18, padding:14, background:C.bg, borderRadius:11, border:`1px dashed ${C.border}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.mute, letterSpacing:0.8, textTransform:"uppercase", marginBottom:8 }}>Dev — Quick Demo Fill</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                {[["owner",C.blue,"Owner Access"],["driver",C.green,"Driver Access"]].map(([r,c,lbl]) => (
                  <button key={r} type="button" onClick={() => fillDemo(r)}
                    style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.card, color:c, fontSize:12.5, fontWeight:700, cursor:"pointer" }}>
                    {lbl}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:11.5, color:C.mute, lineHeight:1.8 }}>
                Owner: 9999999999 / owner123<br />
                Driver: 9876543210 / driver123
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
