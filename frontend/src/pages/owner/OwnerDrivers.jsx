import { useState } from "react";
import { Plus, Users, Phone, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { driverApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { useForm } from "../../hooks/useForm";
import { Btn, Modal, Input, Avatar, Badge, Card, Table, THead, TRow, TD, PageLoader, EmptyState, Spinner } from "../../components/ui";
import { C, DRIVER_STATUS_MAP } from "../../constants";

export default function OwnerDrivers() {
  const [modal,  setModal]  = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm({ name:"", phone:"", password:"", vehicle:"", license:"", address:"" });

  const { data, loading, reload } = useAsync(() => driverApi.getAll(), []);
  const drivers = data?.drivers || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.values.name || !form.values.phone || !form.values.password || !form.values.vehicle) {
      toast.error("Name, phone, password and vehicle are required"); return;
    }
    setSaving(true);
    try {
      await driverApi.create(form.values);
      toast.success("Driver registered!");
      setModal(false); form.reset(); reload();
    } catch (err) {
      toast.error(err.message || "Failed to register");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Deactivate this driver?")) return;
    try {
      await driverApi.remove(id);
      toast.success("Driver deactivated");
      reload();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div style={{ padding:"28px 30px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h2 style={{ fontSize:15, fontWeight:700, color:C.text }}>All Drivers</h2>
          <p style={{ fontSize:12, color:C.mute, marginTop:2 }}>{drivers.length} registered</p>
        </div>
        <Btn onClick={() => setModal(true)}><Plus size={14}/>Add Driver</Btn>
      </div>

      {drivers.length === 0
        ? <EmptyState icon={<Users size={40}/>} title="No drivers yet" desc="Add your first driver." action={<Btn onClick={() => setModal(true)}><Plus size={14}/>Add Driver</Btn>} />
        : (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:22 }}>
              {drivers.map(d => (
                <Card key={d._id} style={{ padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Avatar name={d.name} size={48} />
                      <div>
                        <div style={{ fontWeight:700, fontSize:15, color:C.text }}>{d.name}</div>
                        <div style={{ fontSize:12, color:C.mute, marginTop:2, display:"flex", alignItems:"center", gap:3 }}><Phone size={10}/>{d.phone}</div>
                      </div>
                    </div>
                    <Badge type={d.status} map={DRIVER_STATUS_MAP} />
                  </div>

                  {/* Stars */}
                  <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:14 }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ fontSize:14, color:n<=Math.floor(d.rating||0)?"#F59E0B":"#E2E8F0" }}>★</span>
                    ))}
                    <span style={{ fontSize:12.5, fontWeight:700, color:C.text, marginLeft:3 }}>{(d.rating||0).toFixed(1)}</span>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                    {[
                      { l:"Total Trips", v:d.totalTrips ?? 0, c:C.blue  },
                      { l:"This Month",  v:d.monthTrips ?? 0, c:C.teal  },
                    ].map(s => (
                      <div key={s.l} style={{ background:C.bg, borderRadius:9, padding:"10px 12px" }}>
                        <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.v}</div>
                        <div style={{ fontSize:10.5, color:C.mute, marginTop:2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 10px", background:C.bg, borderRadius:8, marginBottom:14 }}>
                    <Truck size={11} color={C.mute}/>
                    <span style={{ fontSize:11.5, color:C.sub }}>{d.vehicle || "—"}</span>
                  </div>

                  <Btn size="sm" variant="danger" full onClick={() => handleRemove(d._id)}>Deactivate</Btn>
                </Card>
              ))}
            </div>

            <Table>
              <THead cols={["Driver","Vehicle","Status","Rating"]} />
              <tbody>
                {drivers.map((d, i) => (
                  <TRow key={d._id} i={i}>
                    <TD>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <Avatar name={d.name} size={28}/>
                        <div>
                          <div style={{ fontWeight:600 }}>{d.name}</div>
                          <div style={{ fontSize:11, color:C.mute }}>{d.phone}</div>
                        </div>
                      </div>
                    </TD>
                    <TD style={{ color:C.sub }}>{d.vehicle || "—"}</TD>
                    <TD><Badge type={d.status} map={DRIVER_STATUS_MAP} /></TD>
                    <TD><span style={{ fontWeight:700, color:"#F59E0B" }}>★ {(d.rating||0).toFixed(1)}</span></TD>
                  </TRow>
                ))}
              </tbody>
            </Table>
          </>
        )
      }

      <Modal isOpen={modal} onClose={() => { setModal(false); form.reset(); }} title="Add New Driver">
        <form onSubmit={handleCreate}>
          <Input label="Full Name *"     name="name"     value={form.values.name}     onChange={form.handleChange} required placeholder="e.g. Suresh Kumar" />
          <Input label="Phone Number *"  name="phone"    value={form.values.phone}    onChange={form.handleChange} required type="tel" placeholder="e.g. 98765 43210" />
          <Input label="Password *"      name="password" value={form.values.password} onChange={form.handleChange} required type="password" placeholder="Min 6 characters" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Vehicle No. *" name="vehicle"  value={form.values.vehicle}  onChange={form.handleChange} required placeholder="MH-10 AB 1234" />
            <Input label="License No."   name="license"  value={form.values.license}  onChange={form.handleChange} placeholder="MH-1234567" />
          </div>
          <Input label="Address" name="address" value={form.values.address} onChange={form.handleChange} placeholder="Residential address" />
          <Btn type="submit" full disabled={saving}>
            {saving ? <><Spinner size={14} color="#fff"/>Saving…</> : <><Users size={14}/>Register Driver</>}
          </Btn>
        </form>
      </Modal>
    </div>
  );
}
