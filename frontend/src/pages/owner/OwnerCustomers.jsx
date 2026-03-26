import { useState } from "react";
import { Plus, MapPin, Phone, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { customerApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { useForm } from "../../hooks/useForm";
import { useDebounce } from "../../hooks/useDebounce";
import { Btn, SearchInput, Modal, Input, Select, Avatar, Card, Table, THead, TRow, TD, TFoot, PageLoader, EmptyState, Spinner } from "../../components/ui";
import { C, TANK_SIZES } from "../../constants";

export default function OwnerCustomers() {
  const [search, setSearch] = useState("");
  const [view,   setView]   = useState("grid");
  const [modal,  setModal]  = useState(false);
  const [saving, setSaving] = useState(false);
  const form    = useForm({ name:"", phone:"", address:"", tankSize:"1000 Litre", preferredTime:"" });
  const dSearch = useDebounce(search, 400);

  const { data, loading, reload } = useAsync(
    () => customerApi.getAll({ search: dSearch }),
    [dSearch]
  );
  const customers = data?.customers || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.values.name || !form.values.phone || !form.values.address) {
      toast.error("Name, phone and address are required"); return;
    }
    setSaving(true);
    try {
      await customerApi.create(form.values);
      toast.success("Customer added!");
      setModal(false); form.reset(); reload();
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this customer?")) return;
    try {
      await customerApi.remove(id);
      toast.success("Customer removed");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div style={{ padding:"28px 30px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, gap:12, flexWrap:"wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or address…" />
        <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
          <div style={{ display:"flex", border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
            {["grid","list"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding:"7px 13px", border:"none", cursor:"pointer", background:view===v?C.blue:C.card, color:view===v?"#fff":C.mute, fontSize:12, fontWeight:600 }}>
                {v === "grid" ? "⊞ Grid" : "☰ List"}
              </button>
            ))}
          </div>
          <Btn onClick={() => setModal(true)}><Plus size={14}/>Add Customer</Btn>
        </div>
      </div>

      {customers.length === 0
        ? <EmptyState icon={<ClipboardList size={40}/>} title="No customers yet" action={<Btn onClick={() => setModal(true)}><Plus size={14}/>Add Customer</Btn>} />
        : view === "grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
            {customers.map(c => (
              <Card key={c._id} style={{ padding:20 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
                  <Avatar name={c.name} size={44} color="#475569" />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{c.name}</div>
                    <div style={{ fontSize:12, color:C.mute, marginTop:2, display:"flex", alignItems:"center", gap:3 }}><MapPin size={10}/>{c.address}</div>
                    <div style={{ fontSize:12, color:C.mute, marginTop:1, display:"flex", alignItems:"center", gap:3 }}><Phone size={10}/>{c.phone}</div>
                  </div>
                  {c.totalDue > 0 && (
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:99, background:C.amberBg, color:C.amber, whiteSpace:"nowrap" }}>₹{c.totalDue} Due</span>
                  )}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                  {[
                    { l:"Orders",  v:c.orderCount ?? 0,         cl:C.blue  },
                    { l:"Billed",  v:`₹${c.totalBilled ?? 0}`,  cl:C.text  },
                    { l:"Balance", v:c.totalDue>0?`₹${c.totalDue}`:"Clear", cl:c.totalDue>0?C.amber:C.green },
                  ].map(s => (
                    <div key={s.l} style={{ background:C.bg, borderRadius:8, padding:"9px 10px" }}>
                      <div style={{ fontSize:14.5, fontWeight:800, color:s.cl }}>{s.v}</div>
                      <div style={{ fontSize:10.5, color:C.mute, marginTop:2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <Btn size="sm" variant="danger" onClick={() => handleRemove(c._id)}>Remove</Btn>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <Table>
              <THead cols={["Customer","Address","Phone","Orders","Billed","Due","Action"]} />
              <tbody>
                {customers.map((c, i) => (
                  <TRow key={c._id} i={i}>
                    <TD><div style={{ display:"flex", alignItems:"center", gap:9 }}><Avatar name={c.name} size={28} color="#475569"/><span style={{ fontWeight:600 }}>{c.name}</span></div></TD>
                    <TD style={{ color:C.sub, fontSize:12.5 }}>{c.address}</TD>
                    <TD style={{ color:C.sub, fontSize:12.5 }}>{c.phone}</TD>
                    <TD style={{ fontWeight:700 }}>{c.orderCount ?? 0}</TD>
                    <TD style={{ fontWeight:700 }}>₹{c.totalBilled ?? 0}</TD>
                    <TD><span style={{ fontWeight:800, color:c.totalDue>0?C.red:C.green }}>{c.totalDue>0?`₹${c.totalDue}`:"Clear"}</span></TD>
                    <TD><Btn size="sm" variant="danger" onClick={() => handleRemove(c._id)}>Remove</Btn></TD>
                  </TRow>
                ))}
              </tbody>
            </Table>
            <TFoot left={`${customers.length} customer${customers.length!==1?"s":""}`} />
          </>
        )
      }

      <Modal isOpen={modal} onClose={() => { setModal(false); form.reset(); }} title="Add New Customer">
        <form onSubmit={handleCreate}>
          <Input label="Customer Name *" name="name"    value={form.values.name}    onChange={form.handleChange} required placeholder="e.g. Ramesh Patil" />
          <Input label="Phone Number *"  name="phone"   value={form.values.phone}   onChange={form.handleChange} required type="tel" placeholder="e.g. 99001 12345" />
          <Input label="Address *"       name="address" value={form.values.address} onChange={form.handleChange} required placeholder="Delivery address" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Select label="Tank Size" name="tankSize"      value={form.values.tankSize}      onChange={form.handleChange} options={TANK_SIZES} />
            <Input  label="Preferred Time" name="preferredTime" value={form.values.preferredTime} onChange={form.handleChange} type="time" />
          </div>
          <Btn type="submit" full disabled={saving}>
            {saving ? <><Spinner size={14} color="#fff"/>Saving…</> : <><ClipboardList size={14}/>Add Customer</>}
          </Btn>
        </form>
      </Modal>
    </div>
  );
}
