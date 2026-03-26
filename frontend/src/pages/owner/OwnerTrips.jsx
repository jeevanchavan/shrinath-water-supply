import { useState } from "react";
import { Plus, Truck, CheckCircle, AlertCircle, Package, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { tripApi, customerApi, driverApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { useForm } from "../../hooks/useForm";
import { useDebounce } from "../../hooks/useDebounce";
import { Btn, SearchInput, Pill, Modal, Input, Select, Table, THead, TRow, TD, TFoot, Badge, Avatar, Pagination, PageLoader, EmptyState, Spinner } from "../../components/ui";
import { C, TRIP_STATUS_MAP } from "../../constants";

const STATUS_FILTERS = [
  { k:"all",       l:"All"        },
  { k:"pending",   l:"Pending"    },
  { k:"on-way",    l:"On the Way" },
  { k:"delivered", l:"Delivered"  },
  { k:"cancelled", l:"Cancelled"  },
];

export default function OwnerTrips() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);
  const [modal,  setModal]  = useState(false);
  const [saving, setSaving] = useState(false);
  const dSearch = useDebounce(search, 400);

  const form = useForm({ customer:"", driver:"", tanks:"1", amount:"", scheduledTime:"", note:"" });

  // Fix: pass search to server so all pages are searched, not just current page
  const { data: tripsData, loading, reload } = useAsync(
    () => tripApi.getAll({ status: filter !== "all" ? filter : undefined, page, limit:15, search: dSearch || undefined }),
    [filter, page, dSearch]
  );
  const { data: custData } = useAsync(() => customerApi.getAll(), []);
  const { data: drvData  } = useAsync(() => driverApi.getAll(),   []);

  const trips     = tripsData?.trips     || [];
  const total     = tripsData?.total     || 0;
  const pages     = Math.ceil(total / 15) || 1;
  const customers = custData?.customers  || [];
  const drivers   = drvData?.drivers     || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.values.customer) { toast.error("Select a customer"); return; }
    if (!form.values.driver)   { toast.error("Select a driver");   return; }
    if (!form.values.amount)   { toast.error("Enter amount");      return; }
    setSaving(true);
    try {
      await tripApi.create({
        customer:      form.values.customer,
        driver:        form.values.driver,
        tanks:         Number(form.values.tanks),
        amount:        Number(form.values.amount),
        scheduledTime: form.values.scheduledTime,
        note:          form.values.note,
      });
      toast.success("Trip assigned!");
      setModal(false);
      form.reset();
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to create trip");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await tripApi.updateStatus(id, status);
      toast.success("Status updated");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await tripApi.remove(id);
      toast.success("Trip deleted");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const counts = trips.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  return (
    <div style={{ padding:"28px 30px" }}>
      {/* Mini KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {[
          { l:"Total",      v:total,                  c:C.blue,  icon:<Package size={16}/>      },
          { l:"Delivered",  v:counts.delivered   || 0, c:C.green, icon:<CheckCircle size={16}/> },
          { l:"On the Way", v:counts["on-way"]   || 0, c:C.teal,  icon:<Truck size={16}/>       },
          { l:"Pending",    v:counts.pending     || 0, c:C.amber, icon:<AlertCircle size={16}/> },
        ].map(k => (
          <div key={k.l} style={{ background:C.card, borderRadius:12, padding:"14px 18px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:k.c+"18", display:"flex", alignItems:"center", justifyContent:"center", color:k.c }}>{k.icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:C.text, lineHeight:1 }}>{k.v}</div>
              <div style={{ fontSize:11, color:C.mute, marginTop:2 }}>{k.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search trip ID (e.g. T-001)…" />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {STATUS_FILTERS.map(({ k, l }) => (
            <Pill key={k} label={l} active={filter===k} onClick={() => { setFilter(k); setPage(1); }} />
          ))}
        </div>
        <div style={{ marginLeft:"auto" }}>
          <Btn onClick={() => setModal(true)}><Plus size={14}/>New Trip</Btn>
        </div>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : (
        <>
          <Table>
            <THead cols={["ID","Customer & Address","Driver","Tanks","Date","Amount","Paid","Status","Action"]} />
            <tbody>
              {trips.length === 0
                ? <tr><td colSpan={9}><EmptyState icon={<Truck size={36}/>} title="No trips found" desc="Adjust filters or create a new trip." /></td></tr>
                : trips.map((t, i) => (
                  <TRow key={t._id} i={i}>
                    <TD style={{ fontSize:11.5, fontWeight:700, color:C.blue }}>
                      T-{String(t.tripNumber||0).padStart(3,"0")}
                    </TD>
                    <TD>
                      <div style={{ fontWeight:600 }}>{t.customer?.name}</div>
                      <div style={{ fontSize:11, color:C.mute, marginTop:2, display:"flex", alignItems:"center", gap:3 }}>
                        <MapPin size={9}/>{t.address}
                      </div>
                    </TD>
                    <TD>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Avatar name={t.driver?.name || ""} size={26} />
                        <span style={{ fontSize:12.5, color:C.sub }}>{t.driver?.name}</span>
                      </div>
                    </TD>
                    <TD style={{ fontWeight:700, textAlign:"center" }}>{t.tanks}</TD>
                    <TD style={{ color:C.mute, fontSize:12 }}>{new Date(t.createdAt).toLocaleDateString("en-IN")}</TD>
                    <TD style={{ fontWeight:700 }}>₹{t.amount}</TD>
                    <TD>
                      <span style={{ padding:"2px 9px", borderRadius:99, fontSize:11.5, fontWeight:600, background:t.isPaid?C.greenBg:C.amberBg, color:t.isPaid?C.green:C.amber }}>
                        {t.isPaid ? "✓ Paid" : "Due"}
                      </span>
                    </TD>
                    <TD><Badge type={t.status} map={TRIP_STATUS_MAP} /></TD>
                    <TD>
                      <div style={{ display:"flex", gap:5 }}>
                        {t.status === "pending" && (
                          <Btn size="sm" variant="outline" onClick={() => handleStatusUpdate(t._id, "on-way")}>Start</Btn>
                        )}
                        {t.status === "on-way" && (
                          <Btn size="sm" variant="success" onClick={() => handleStatusUpdate(t._id, "delivered")}>Done</Btn>
                        )}
                        {(t.status === "pending" || t.status === "on-way") && (
                          <Btn size="sm" variant="danger" onClick={() => handleDelete(t._id)}>✕</Btn>
                        )}
                      </div>
                    </TD>
                  </TRow>
                ))
              }
            </tbody>
          </Table>
          <TFoot left={`Showing ${trips.length} of ${total}`} right={<Pagination page={page} pages={pages} onPage={setPage} />} />
        </>
      )}

      {/* New Trip Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); form.reset(); }} title="Assign New Trip">
        <form onSubmit={handleCreate}>
          <Select label="Customer *" name="customer" value={form.values.customer} onChange={form.handleChange} required
            options={customers.map(c => ({ value:c._id, label:`${c.name} — ${c.address}` }))} />
          <Select label="Assign Driver *" name="driver" value={form.values.driver} onChange={form.handleChange} required
            options={drivers.map(d => ({ value:d._id, label:`${d.name} (${d.status})` }))} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="No. of Tanks *" name="tanks"  value={form.values.tanks}  onChange={form.handleChange} type="number" required />
            <Input label="Amount (₹) *"   name="amount" value={form.values.amount} onChange={form.handleChange} type="number" required />
          </div>
          <Input label="Scheduled Time" name="scheduledTime" value={form.values.scheduledTime} onChange={form.handleChange} type="time" />
          <Input label="Note (optional)" name="note" value={form.values.note} onChange={form.handleChange} placeholder="Special instructions…" />
          <Btn type="submit" full disabled={saving}>
            {saving ? <><Spinner size={14} color="#fff"/>Assigning…</> : <><Truck size={14}/>Assign Trip</>}
          </Btn>
        </form>
      </Modal>
    </div>
  );
}
