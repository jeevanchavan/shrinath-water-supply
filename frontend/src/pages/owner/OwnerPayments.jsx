import { useState } from "react";
import { CheckCircle, AlertCircle, DollarSign, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { paymentApi, customerApi } from "../../api/services";
import { useAsync } from "../../hooks/useAsync";
import { KPICard, Modal, Btn, Spinner, Table, THead, TRow, TD, Avatar, PageLoader, EmptyState } from "../../components/ui";
import { C, PAYMENT_MODES } from "../../constants";

export default function OwnerPayments() {
  const [modal,   setModal]  = useState(false);
  const [selCust, setSelCust]= useState(null);
  const [amount,  setAmount] = useState("");
  const [mode,    setMode]   = useState("cash");
  const [note,    setNote]   = useState("");
  const [saving,  setSaving] = useState(false);

  const { data: sumData,  loading: l1, reload: reloadSum  } = useAsync(() => paymentApi.summary(), []);
  const { data: custData, loading: l2, reload: reloadCust } = useAsync(() => customerApi.getAll(), []);

  const summary   = sumData?.summary    || {};
  const customers = custData?.customers || [];

  const openCollect = (c) => {
    setSelCust(c);
    setAmount(String(c.totalDue));
    setMode("cash");
    setNote("");
    setModal(true);
  };

  const handleCollect = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setSaving(true);
    try {
      await paymentApi.collect({ customerId: selCust._id, amount: Number(amount), mode, note });
      toast.success("Payment collected!");
      setModal(false);
      // Fix: reload BOTH the customer list AND the summary KPI cards
      reloadCust();
      reloadSum();
    } catch (err) {
      toast.error(err.message || "Failed to collect payment");
    } finally {
      setSaving(false);
    }
  };

  const inp = { width:"100%", padding:"10px 13px", borderRadius:9, border:`1px solid ${C.border}`, fontSize:13.5, color:C.text, outline:"none", background:"#FAFBFD", fontFamily:"inherit", boxSizing:"border-box" };

  if (l1 || l2) return <PageLoader />;

  return (
    <div style={{ padding:"28px 30px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:26 }}>
        <KPICard icon={<CheckCircle size={18}/>} label="Collected This Month" value={summary.collectedThisMonth ?? 0} delta={9}  color={C.green}  prefix="₹"/>
        <KPICard icon={<AlertCircle size={18}/>} label="Total Pending"        value={summary.totalPending      ?? 0} delta={-4} color={C.amber}  prefix="₹"/>
        <KPICard icon={<DollarSign  size={18}/>} label="Total Billed"         value={summary.totalBilled       ?? 0} delta={7}  color={C.violet} prefix="₹"/>
      </div>

      <Table>
        <THead cols={["Customer","Phone","Orders","Total Billed","Due","Action"]} />
        <tbody>
          {customers.length === 0
            ? <tr><td colSpan={6}><EmptyState icon={<DollarSign size={36}/>} title="No customers found" /></td></tr>
            : customers.map((c, i) => (
              <TRow key={c._id} i={i}>
                <TD>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <Avatar name={c.name} size={30} color="#475569" />
                    <div>
                      <div style={{ fontWeight:600 }}>{c.name}</div>
                      <div style={{ fontSize:11, color:C.mute }}>{new Date(c.createdAt).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</div>
                    </div>
                  </div>
                </TD>
                <TD style={{ fontSize:12.5, color:C.sub }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}><Phone size={10}/>{c.phone}</div>
                </TD>
                <TD style={{ fontWeight:700 }}>{c.orderCount ?? 0}</TD>
                <TD style={{ fontWeight:700 }}>₹{c.totalBilled ?? 0}</TD>
                <TD><span style={{ fontWeight:800, fontSize:14, color:c.totalDue>0?C.red:C.green }}>{c.totalDue>0?`₹${c.totalDue}`:"✓ Clear"}</span></TD>
                <TD>
                  {c.totalDue > 0
                    ? <Btn size="sm" onClick={() => openCollect(c)}>Collect</Btn>
                    : <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Up to date</span>
                  }
                </TD>
              </TRow>
            ))
          }
        </tbody>
      </Table>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Collect Payment" width={400}>
        {selCust && (
          <form onSubmit={handleCollect}>
            <div style={{ background:C.amberBg, border:`1px solid #FDE68A`, borderRadius:12, padding:"14px 16px", marginBottom:18 }}>
              <div style={{ fontSize:11, color:C.amber, fontWeight:700, letterSpacing:0.5, marginBottom:4 }}>OUTSTANDING</div>
              <div style={{ fontSize:30, fontWeight:800, color:C.text }}>₹{selCust.totalDue}</div>
              <div style={{ fontSize:12.5, color:C.sub, marginTop:2 }}>{selCust.name}</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.sub, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>Payment Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)} style={{ ...inp, cursor:"pointer" }}>
                {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.sub, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={1} max={selCust.totalDue} style={inp} />
            </div>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.sub, marginBottom:6, letterSpacing:0.5, textTransform:"uppercase" }}>Note (optional)</label>
              <input placeholder="e.g. Partial payment" value={note} onChange={e => setNote(e.target.value)} style={inp} />
            </div>
            <Btn type="submit" variant="success" full disabled={saving}>
              {saving ? <><Spinner size={14} color="#fff"/>Saving…</> : <><CheckCircle size={14}/>Confirm Payment</>}
            </Btn>
          </form>
        )}
      </Modal>
    </div>
  );
}
