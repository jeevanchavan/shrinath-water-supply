import { NavLink, useNavigate } from "react-router-dom";
import { Droplets, Home, Truck, Wallet, Users, ClipboardList, BarChart2, DollarSign, Activity, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui";
import { C, APP_NAME } from "../../constants";

const OWNER_NAV = [
  { to:"/owner",           end:true,  Icon:Home,          label:"Overview"    },
  { to:"/owner/trips",     end:false, Icon:Truck,         label:"Trips"       },
  { to:"/owner/payments",  end:false, Icon:Wallet,        label:"Payments"    },
  { to:"/owner/drivers",   end:false, Icon:Users,         label:"Drivers"     },
  { to:"/owner/customers", end:false, Icon:ClipboardList, label:"Customers"   },
  { to:"/owner/reports",   end:false, Icon:BarChart2,     label:"Reports"     },
];
const DRIVER_NAV = [
  { to:"/driver",          end:true,  Icon:Truck,      label:"Today's Trips" },
  { to:"/driver/earnings", end:false, Icon:DollarSign, label:"My Earnings"   },
  { to:"/driver/history",  end:false, Icon:Activity,   label:"Trip History"  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const nav               = user?.role === "owner" ? OWNER_NAV : DRIVER_NAV;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside style={{ width:230, minHeight:"100vh", background:C.side, display:"flex", flexDirection:"column", position:"fixed", left:0, top:0, bottom:0, zIndex:300 }}>
      {/* Logo */}
      <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#3B82F6,#1D4ED8)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(59,130,246,0.35)", flexShrink:0 }}>
            <Droplets size={18} color="#fff" />
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ color:"#fff", fontWeight:800, fontSize:12.5, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              Shrinath Water
            </div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:9.5, letterSpacing:0.4, textTransform:"uppercase", marginTop:1 }}>
              {user?.role === "owner" ? "Owner Portal" : "Driver Portal"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:2 }}>
        <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.2)", letterSpacing:0.7, textTransform:"uppercase", padding:"8px 12px 4px" }}>
          Menu
        </div>
        {nav.map(({ to, end, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 13px", borderRadius:9, textDecoration:"none",
              background:isActive ? "rgba(37,99,235,0.22)" : "transparent",
              color:isActive ? "#fff" : "rgba(255,255,255,0.45)",
              fontSize:13.5, fontWeight:isActive ? 600 : 400,
              borderLeft:isActive ? "3px solid #3B82F6" : "3px solid transparent",
              transition:"all 0.13s",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile + logout */}
      <div style={{ padding:"12px 10px 16px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px", borderRadius:9, background:"rgba(255,255,255,0.05)", marginBottom:6 }}>
          <Avatar name={user?.name || ""} size={32} color="#3B82F6" />
          <div style={{ minWidth:0 }}>
            <div style={{ color:"#fff", fontSize:12.5, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name}</div>
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10.5, textTransform:"capitalize" }}>{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:9, border:"none", cursor:"pointer", background:"transparent", color:"rgba(255,255,255,0.35)", fontSize:12.5, width:"100%" }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
