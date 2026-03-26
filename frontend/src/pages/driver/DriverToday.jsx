import { useState } from "react";
import { Package, CheckCircle, DollarSign, MapPin, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { tripApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { KPICard, Badge, Btn, Card, PageLoader, EmptyState, Spinner } from "../../components/ui";
import { C, TRIP_STATUS_MAP } from "../../constants";

const NEXT  = { pending:"on-way", "on-way":"delivered" };
const LABEL = { pending:"▶  Start Trip", "on-way":"✓  Mark Delivered" };

export default function DriverToday() {
  const [updating, setUpdating] = useState(null);
  const { data, loading, reload } = useAsync(() => tripApi.driverToday(), []);
  const trips = data?.trips || [];

  const advance = async (id, curStatus) => {
    const next = NEXT[curStatus];
    if (!next) return;
    setUpdating(id);
    try {
      await tripApi.updateStatus(id, next);
      toast.success(next === "delivered" ? "Trip delivered! 🎉" : "Trip started!");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <PageLoader />;

  const done   = trips.filter(t => t.status === "delivered").length;
  const earned = trips.filter(t => t.status === "delivered").reduce((s, t) => s + t.amount, 0);
  const active = trips.find(t => t.status === "on-way");

  return (
    <div style={{ padding:"28px 30px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
        <KPICard icon={<Package size={18}/>}     label="Assigned Today" value={trips.length} color={C.blue}   />
        <KPICard icon={<CheckCircle size={18}/>} label="Completed"      value={done}          color={C.green}  />
        <KPICard icon={<DollarSign size={18}/>}  label="Earned Today"   value={earned}        color={C.violet} prefix="₹"/>
      </div>

      {/* Active banner */}
      {active && (
        <div style={{ background:`linear-gradient(135deg,#0C1A35,#1D4ED8)`, borderRadius:14, padding:"18px 22px", marginBottom:20, display:"flex", alignItems:"center", gap:14, boxShadow:"0 4px 20px rgba(37,99,235,0.25)" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Navigation size={20} color="#fff" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontWeight:600, letterSpacing:0.5 }}>EN ROUTE</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff", marginTop:2 }}>{active.customer?.name}</div>
            <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.6)", marginTop:2, display:"flex", alignItems:"center", gap:4 }}>
              <MapPin size={11}/>{active.address}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff" }}>₹{active.amount}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:2 }}>{active.tanks} tanks</div>
          </div>
        </div>
      )}

      {trips.length === 0
        ? <EmptyState icon={<Package size={40}/>} title="No trips today" desc="You have no assigned trips for today." />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {trips.map((t, idx) => {
              const isActive = t.status === "on-way";
              const isDone   = t.status === "delivered";
              return (
                <Card key={t._id} style={{ border:`1px solid ${isActive ? C.blue+"55" : isDone ? C.greenBg : C.border}`, boxShadow:isActive?`0 0 0 3px ${C.blue}18`:"0 1px 3px rgba(0,0,0,0.04)", opacity:isDone?0.72:1 }}>
                  <div style={{ padding:"18px 22px", display:"flex", alignItems:"flex-start", gap:14 }}>
                    <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:isDone?C.greenBg:isActive?C.blueL:C.bg, display:"flex", alignItems:"center", justifyContent:"center", color:isDone?C.green:isActive?C.blue:C.mute, fontSize:16, fontWeight:800 }}>
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:16, color:C.text }}>{t.customer?.name}</div>
                          <div style={{ fontSize:12.5, color:C.mute, marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                            <MapPin size={12}/>{t.address}
                          </div>
                          <div style={{ display:"flex", gap:16, marginTop:10 }}>
                            <span style={{ fontSize:12, color:C.sub }}>🕐 {t.scheduledTime || "—"}</span>
                            <span style={{ fontSize:12, color:C.sub }}>🪣 {t.tanks} tank{t.tanks>1?"s":""}</span>
                            <span style={{ fontSize:13.5, fontWeight:700, color:C.text }}>₹{t.amount}</span>
                          </div>
                          {t.note && (
                            <div style={{ marginTop:8, fontSize:12, color:C.amber, background:C.amberBg, padding:"5px 10px", borderRadius:7, display:"inline-block" }}>
                              📝 {t.note}
                            </div>
                          )}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
                          <Badge type={t.status} map={TRIP_STATUS_MAP} />
                          {!isDone && (
                            <Btn
                              variant={isActive ? "success" : "primary"}
                              size="sm"
                              onClick={() => advance(t._id, t.status)}
                              disabled={updating === t._id}
                            >
                              {updating === t._id ? <Spinner size={12} color="#fff"/> : LABEL[t.status]}
                            </Btn>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
