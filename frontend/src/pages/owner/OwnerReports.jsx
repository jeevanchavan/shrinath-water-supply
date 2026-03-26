import { Truck, DollarSign, AlertCircle, Users } from "lucide-react";
import { dashboardApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { BarChart, Card, CardHeader, Avatar, PageLoader, EmptyState } from "../../components/ui";
import { C } from "../../constants";

export default function OwnerReports() {
  const { data, loading } = useAsync(() => dashboardApi.ownerReports(), []);

  if (loading) return <PageLoader />;

  const weeklyData   = data?.weeklyData   || [];
  const topCustomers = data?.topCustomers || [];
  const driverPerf   = data?.driverPerf   || [];
  const summary      = data?.summary      || {};

  const revChart  = weeklyData.map(w => ({ label:w.label, value:w.revenue }));
  const tripChart = weeklyData.map(w => ({ label:w.label, value:w.trips   }));

  return (
    <div style={{ padding:"28px 30px" }}>
      {/* Summary row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {[
          { l:"Total Trips",       v:summary.monthTrips      ?? 0,  c:C.blue,   icon:<Truck size={16}/>        },
          { l:"Total Revenue",     v:`₹${summary.monthRevenue ?? 0}`, c:C.green,  icon:<DollarSign size={16}/>   },
          { l:"Pending Dues",      v:`₹${summary.monthPending ?? 0}`, c:C.amber,  icon:<AlertCircle size={16}/>  },
          { l:"Active Customers",  v:summary.activeCustomers ?? 0,  c:C.violet, icon:<Users size={16}/>        },
        ].map(k => (
          <div key={k.l} style={{ background:C.card, borderRadius:12, padding:"14px 18px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:k.c+"18", display:"flex", alignItems:"center", justifyContent:"center", color:k.c }}>{k.icon}</div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:C.text }}>{k.v}</div>
              <div style={{ fontSize:11, color:C.mute, marginTop:2 }}>{k.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <Card style={{ padding:24 }}>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Revenue by Week</div>
            <div style={{ fontSize:12, color:C.mute, marginTop:2 }}>Current month</div>
          </div>
          {revChart.length === 0
            ? <EmptyState icon={null} title="No data yet" />
            : <BarChart data={revChart} color={C.blue} prefix="₹" height={150} />
          }
        </Card>
        <Card style={{ padding:24 }}>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Trips by Week</div>
            <div style={{ fontSize:12, color:C.mute, marginTop:2 }}>Current month</div>
          </div>
          {tripChart.length === 0
            ? <EmptyState icon={null} title="No data yet" />
            : <BarChart data={tripChart} color={C.green} height={150} />
          }
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <Card>
          <CardHeader title="Top Customers" />
          {topCustomers.length === 0
            ? <EmptyState icon={null} title="No data yet" />
            : topCustomers.map((c, i) => (
              <div key={c._id || i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom: i < topCustomers.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width:24, height:24, borderRadius:6, background:C.blueL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.blue }}>{i+1}</div>
                <Avatar name={c.name} size={30} color="#475569" />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</div>
                  <div style={{ fontSize:11, color:C.mute }}>{c.orderCount} orders</div>
                </div>
                <span style={{ fontSize:14, fontWeight:800, color:C.blue }}>₹{c.totalAmount}</span>
              </div>
            ))
          }
        </Card>
        <Card>
          <CardHeader title="Driver Performance" />
          {driverPerf.length === 0
            ? <EmptyState icon={null} title="No data yet" />
            : driverPerf.map((d, i) => (
              <div key={d._id || i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom: i < driverPerf.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <Avatar name={d.name} size={34} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{d.name}</div>
                  <div style={{ display:"flex", gap:3, marginTop:2 }}>
                    {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:10, color:n<=(d.rating||0)?"#F59E0B":"#E2E8F0" }}>★</span>)}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{d.totalTrips} trips</div>
                  <div style={{ fontSize:11, color:C.green, fontWeight:600 }}>{d.delivered} delivered</div>
                </div>
              </div>
            ))
          }
        </Card>
      </div>
    </div>
  );
}
