import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar  from "./Topbar";
import { APP_NAME } from "../../constants";

const META = {
  "/owner":           { title:"Dashboard",           subtitle:"Welcome back! Here's your business snapshot." },
  "/owner/trips":     { title:"Trip Management",     subtitle:"Assign and track all water deliveries."       },
  "/owner/payments":  { title:"Payments",            subtitle:"Track dues and collect payments."             },
  "/owner/drivers":   { title:"Driver Management",   subtitle:"Manage your delivery team."                  },
  "/owner/customers": { title:"Customers",           subtitle:"Manage all customer accounts."               },
  "/owner/reports":   { title:"Reports & Analytics", subtitle:"Monthly performance insights."               },
  "/driver":          { title:"Today's Trips",       subtitle:"Your delivery schedule for today."           },
  "/driver/earnings": { title:"My Earnings",         subtitle:"Weekly and monthly earning breakdown."       },
  "/driver/history":  { title:"Trip History",        subtitle:"All your completed deliveries."              },
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const meta = META[pathname] || { title: APP_NAME, subtitle: "" };

  // Dynamic document title per page
  useEffect(() => {
    document.title = `${meta.title} — Shrinath Water Distributors`;
  }, [meta.title]);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F4F6FB" }}>
      <Sidebar />
      <main style={{ marginLeft:230, flex:1, minWidth:0 }}>
        <Topbar title={meta.title} subtitle={meta.subtitle} />
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
