import { useState } from "react";
import { Activity, MapPin } from "lucide-react";
import { tripApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { useDebounce } from "../../hooks/useDebounce";
import { SearchInput, Table, THead, TRow, TD, TFoot, Pagination, Badge, PageLoader, EmptyState } from "../../components/ui";
import { C, TRIP_STATUS_MAP } from "../../constants";

export default function DriverHistory() {
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);
  const dSearch = useDebounce(search, 400);

  const { data, loading } = useAsync(
    () => tripApi.driverHistory({ page, limit:15 }),
    [page]
  );

  const allTrips   = data?.trips       || [];
  const total      = data?.total       || 0;
  // Fix: use server-calculated total across ALL trips, not just current page
  const totalEarned = data?.totalEarned ?? null;
  const pages      = Math.ceil(total / 15) || 1;

  // Client-side search only filters the loaded page for name display
  const trips = allTrips.filter(t =>
    !dSearch || t.customer?.name?.toLowerCase().includes(dSearch.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div style={{ padding:"28px 30px" }}>
      <div style={{ display:"flex", gap:10, marginBottom:18, alignItems:"center", justifyContent:"space-between", flexWrap:"wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by customer…" />
        <div style={{ fontSize:12.5, color:C.sub, fontWeight:500 }}>
          {total} trip{total !== 1 ? "s" : ""} · Total earned:{" "}
          <span style={{ fontWeight:800, color:C.green }}>
            {totalEarned !== null ? `₹${totalEarned}` : "—"}
          </span>
        </div>
      </div>

      {trips.length === 0
        ? <EmptyState icon={<Activity size={40}/>} title="No trip history" desc="Completed trips will appear here." />
        : (
          <>
            <Table>
              <THead cols={["Trip ID","Customer","Address","Tanks","Date","Amount","Status"]} />
              <tbody>
                {trips.map((t, i) => (
                  <TRow key={t._id} i={i}>
                    <TD style={{ fontSize:11.5, fontWeight:700, color:C.blue }}>
                      T-{String(t.tripNumber||0).padStart(3,"0")}
                    </TD>
                    <TD style={{ fontWeight:600 }}>{t.customer?.name}</TD>
                    <TD style={{ color:C.mute, fontSize:12.5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:3 }}><MapPin size={10}/>{t.address}</div>
                    </TD>
                    <TD style={{ fontWeight:700, textAlign:"center" }}>{t.tanks}</TD>
                    <TD style={{ color:C.mute, fontSize:12 }}>{new Date(t.createdAt).toLocaleDateString("en-IN")}</TD>
                    <TD style={{ fontWeight:800, color:C.green }}>₹{t.amount}</TD>
                    <TD><Badge type={t.status} map={TRIP_STATUS_MAP} /></TD>
                  </TRow>
                ))}
              </tbody>
            </Table>
            <TFoot
              left={`Showing ${trips.length} of ${total}`}
              right={<Pagination page={page} pages={pages} onPage={setPage} />}
            />
          </>
        )
      }
    </div>
  );
}
