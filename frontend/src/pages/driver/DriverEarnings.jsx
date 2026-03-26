import { DollarSign, TrendingUp, Star } from "lucide-react";
import { dashboardApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { KPICard, BarChart, Card, CardHeader, PageLoader } from "../../components/ui";
import { C } from "../../constants";

const WEEK_COLORS = [C.blue, C.teal, C.green, C.violet];

export default function DriverEarnings() {
  const { data, loading } = useAsync(() => dashboardApi.driverStats(), []);

  if (loading) return <PageLoader />;

  const kpi           = data?.kpi           || {};
  const dailyEarnings = data?.dailyEarnings || [];
  const chartData     = dailyEarnings.map(d => ({ label:d.day, value:d.amount }));

  // Build real weekly breakdown from daily earnings (Sun=0…Sat=6 → 4 weeks in month context)
  // Here we split the 7 daily values into a summary card using real percentages
  const maxDaily = Math.max(...dailyEarnings.map(d => d.amount), 1);
  const weeklyBreakdown = dailyEarnings.map((d, i) => ({
    label: d.day,
    pct:   Math.round((d.amount / maxDaily) * 100),
    color: WEEK_COLORS[i % WEEK_COLORS.length],
    amount: d.amount,
  }));

  return (
    <div style={{ padding:"28px 30px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
        <KPICard icon={<DollarSign size={18}/>}  label="This Week Trips" value={kpi.weekTrips     ?? 0} delta={12} color={C.green}  />
        <KPICard icon={<TrendingUp size={18}/>}  label="This Month"      value={kpi.monthEarnings ?? 0} delta={8}  color={C.blue}   prefix="₹"/>
        <KPICard icon={<Star size={18}/>}        label="Total Trips"     value={kpi.totalTrips    ?? 0}            color={C.violet} />
      </div>

      <Card style={{ padding:24, marginBottom:18 }}>
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Daily Earnings — This Week</div>
          <div style={{ fontSize:12, color:C.mute, marginTop:2 }}>On-time rate: {kpi.onTimeRate ?? 0}%</div>
        </div>
        <BarChart data={chartData} color={C.green} prefix="₹" height={150} />
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {/* Real daily breakdown replacing hardcoded fake data */}
        <Card>
          <CardHeader title="This Week by Day" />
          <div style={{ padding:"8px 0" }}>
            {weeklyBreakdown.map((d, i) => (
              <div key={d.label} style={{ padding:"12px 22px", borderBottom: i < weeklyBreakdown.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{d.label}</span>
                  <span style={{ fontSize:12, color:C.mute }}>
                    {d.amount > 0 ? `₹${d.amount}` : "—"}
                  </span>
                </div>
                <div style={{ height:4, background:C.border, borderRadius:99 }}>
                  <div style={{ height:"100%", width:`${d.pct}%`, background:d.color, borderRadius:99, transition:"width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Performance Stats" />
          <div style={{ padding:"16px 22px" }}>
            {[
              { l:"Total Trips",  v:kpi.totalTrips     ?? 0,                  c:C.blue   },
              { l:"On-time Rate", v:`${kpi.onTimeRate  ?? 0}%`,               c:C.green  },
              { l:"Total Earned", v:`₹${kpi.totalEarnings  ?? 0}`,           c:C.violet },
              { l:"This Month",   v:`₹${kpi.monthEarnings  ?? 0}`,           c:C.teal   },
            ].map((s, i) => (
              <div key={s.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize:12.5, color:C.sub }}>{s.l}</span>
                <span style={{ fontSize:14, fontWeight:800, color:s.c }}>{s.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
