import { Truck, CheckCircle, AlertCircle, DollarSign, MapPin } from "lucide-react";
import { dashboardApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { KPICard, Badge, Avatar, Card, CardHeader, PageLoader, EmptyState } from "../../components/ui";
import { C, TRIP_STATUS_MAP, DRIVER_STATUS_MAP } from "../../constants";

export default function OwnerOverview() {
  const { data, loading } = useAsync(() => dashboardApi.ownerStats(), []);

  if (loading) return <PageLoader />;

  const kpi          = data?.kpi          || {};
  const recentTrips  = data?.recentTrips  || [];
  const drivers      = data?.drivers      || [];

  return (
    <div style={{ padding:"28px 30px" }}>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:26 }}>
        <KPICard icon={<Truck size={18}/>}       label="Trips Today"   value={kpi.todayTrips    ?? 0} delta={8}  color={C.blue}   />
        <KPICard icon={<CheckCircle size={18}/>} label="Delivered"     value={kpi.deliveredToday?? 0} delta={12} color={C.green}  />
        <KPICard icon={<DollarSign size={18}/>}  label="Month Revenue" value={kpi.monthRevenue  ?? 0} delta={5}  color={C.violet} prefix="₹"/>
        <KPICard icon={<AlertCircle size={18}/>} label="Pending Dues"  value={kpi.pendingDue    ?? 0} delta={-3} color={C.amber}  prefix="₹"/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:18 }}>
        {/* Recent trips */}
        <Card>
          <CardHeader title="Today's Trips" right={<span style={{ fontSize:12, color:C.blue, fontWeight:600 }}>See all →</span>} />
          {recentTrips.length === 0
            ? <EmptyState icon={<Truck size={36}/>} title="No trips today" desc="Assign a trip to get started." />
            : recentTrips.map((t, i) => (
              <div key={t._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 22px", borderBottom: i < recentTrips.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width:34, height:34, borderRadius:8, background:C.blueL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9.5, fontWeight:800, color:C.blue, flexShrink:0 }}>
                  T-{String(t.tripNumber||0).padStart(3,"0")}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13.5, color:C.text }}>{t.customer?.name}</div>
                  <div style={{ fontSize:11.5, color:C.mute, marginTop:1, display:"flex", alignItems:"center", gap:3, overflow:"hidden" }}>
                    <MapPin size={10}/><span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.address}</span>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:C.text }}>₹{t.amount}</div>
                  <div style={{ fontSize:11, color:t.isPaid ? C.green : C.amber, fontWeight:600, marginTop:1 }}>{t.isPaid ? "Paid" : "Due"}</div>
                </div>
                <Badge type={t.status} map={TRIP_STATUS_MAP} />
              </div>
            ))
          }
        </Card>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <CardHeader title="Drivers" />
            {drivers.length === 0
              ? <EmptyState icon={<Truck size={28}/>} title="No drivers" />
              : drivers.map((d, i) => (
                <div key={d._id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 20px", borderBottom: i < drivers.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <Avatar name={d.name} size={34} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{d.name}</div>
                    <div style={{ fontSize:11, color:C.mute, marginTop:1 }}>{d.vehicle || "—"}</div>
                  </div>
                  <Badge type={d.status} map={DRIVER_STATUS_MAP} />
                </div>
              ))
            }
          </Card>

          <Card style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.mute, letterSpacing:0.5, textTransform:"uppercase", marginBottom:12 }}>At a Glance</div>
            {[
              { l:"Active Drivers",  v:kpi.totalDrivers    ?? 0,  c:C.blue   },
              { l:"Customers",       v:kpi.totalCustomers  ?? 0,  c:C.green  },
              { l:"Month Revenue",   v:`₹${kpi.monthRevenue ?? 0}`, c:C.violet },
              { l:"Pending Dues",    v:`₹${kpi.pendingDue  ?? 0}`, c:C.amber  },
            ].map(s => (
              <div key={s.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:12.5, color:C.sub }}>{s.l}</span>
                <span style={{ fontSize:13.5, fontWeight:700, color:s.c }}>{s.v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
