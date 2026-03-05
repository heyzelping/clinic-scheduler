5 Mar 2026, 3:06 pm
import React, { useState, useEffect, useMemo, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️ CONFIG — paste your Apps Script Web App URL here
// ─────────────────────────────────────────────────────────────────────────────
const APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE";
const isConfigured = () => APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE";

async function apiGet(action) {
if (!isConfigured()) return null;
try { const r = await fetch(`${APPS_SCRIPT_URL}?action=${action}`); return r.json(); } catch { return null; }
}
async function apiPost(body) {
if (!isConfigured()) return null;
try { const r = await fetch(APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(body) }); return r.json(); } catch { return null; }
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_STAFF = [
{ id: "DR01", name: "Dr. Sarah Chen", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "2018-03-01", active: true },
{ id: "DR02", name: "Dr. Marcus Lim", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "2019-07-15", active: true },
{ id: "DR03", name: "Dr. Priya Nair", role: "Doctor", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "Junior", regDate: "2024-01-10", active: true },
{ id: "DR04", name: "Dr. James Tan", role: "Doctor", branch: "B", contract: "4-day", offDays: ["Sunday", "Wednesday"], seniority: "Senior", regDate: "2017-05-20", active: true },
{ id: "DR05", name: "Dr. Aisha Malik", role: "Doctor", branch: "Float", contract: "5-day", offDays: ["Sunday"], seniority: "Junior", regDate: "2024-06-01", active: true },
{ id: "NR01", name: "Nurse Linda Goh", role: "Nurse", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "", active: true },
{ id: "NR02", name: "Nurse Ben Ong", role: "Nurse", branch: "A", contract: "4-day", offDays: ["Sunday", "Thursday"], seniority: "-", regDate: "", active: true },
{ id: "NR03", name: "Nurse Fatimah R.", role: "Nurse", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "", active: true },
{ id: "NR04", name: "Nurse Kevin Wu", role: "Nurse", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "", active: true },
{ id: "NR05", name: "Nurse Mei Tan", role: "Nurse", branch: "Float", contract: "4-day", offDays: ["Sunday", "Friday"], seniority: "-", regDate: "", active: true },
];
const DEMO_LEAVE = [
{ id: "LV001", staffId: "DR03", leaveType: "AL", startDate: "2025-07-07", endDate: "2025-07-09", status: "Approved", approvedBy: "Manager" },
{ id: "LV002", staffId: "NR01", leaveType: "MC", startDate: "2025-07-14", endDate: "2025-07-14", status: "Approved", approvedBy: "Manager" },
{ id: "LV003", staffId: "DR05", leaveType: "AL", startDate: "2025-07-21", endDate: "2025-07-23", status: "Pending", approvedBy: "" },
];

const LEAVE_TYPES = ["AL", "MC", "OIL", "Emergency", "Maternity"];
const LEAVE_COLORS = { AL: "#4ade80", MC: "#fb923c", OIL: "#a78bfa", Emergency: "#f87171", Maternity: "#f9a8d4" };
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const BRANCH_NAME = { A: "Orchard", B: "Katong" };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const dateStr = (y, m, d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const dayName = (y, m, d) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(y,m,d).getDay()];
const fullDay = (y, m, d) => ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(y,m,d).getDay()];
const branchLabel = (b) => BRANCH_NAME[b] || b;

function isSeniorOnDate(s, date) {
if (s.seniority === "Senior") return true;
if (!s.regDate) return false;
const auto = new Date(s.regDate);
auto.setFullYear(auto.getFullYear() + 2);
return new Date(date) >= auto;
}

function getStatus(s, ds, leave) {
const l = leave.find(x => x.staffId === s.id && x.status === "Approved" && ds >= x.startDate && ds <= x.endDate);
if (l) return l.leaveType;
const [y, m, d] = ds.split("-").map(Number);
if ((s.offDays || []).includes(fullDay(y, m-1, d))) return "OFF";
return s.branch === "Float" ? "Float" : `BR-${s.branch}`;
}

const isWorking = (s, ds, leave) => !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(getStatus(s, ds, leave));

function statusStyle(st) {
const m = {
"BR-A":{ bg:"rgba(91,141,238,0.18)", c:"#7ba7f0" },
"BR-B":{ bg:"rgba(56,217,169,0.18)", c:"#38d9a9" },
AL:{ bg:"rgba(74,222,128,0.18)", c:"#4ade80" },
MC:{ bg:"rgba(251,146,60,0.18)", c:"#fb923c" },
OIL:{ bg:"rgba(167,139,250,0.18)", c:"#a78bfa" },
Emergency:{ bg:"rgba(248,113,113,0.18)", c:"#f87171" },
Maternity:{ bg:"rgba(249,168,212,0.18)", c:"#f9a8d4" },
OFF:{ bg:"rgba(148,163,184,0.08)", c:"#4a5568" },
Float:{ bg:"rgba(148,163,184,0.08)", c:"#64748b" },
};
return m[st] || { bg:"transparent", c:"#4a5568" };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0f1117;--s:#181c27;--s2:#1e2333;--b:#2a3045;--a:#5b8dee;--a2:#38d9a9;--w:#ffa94d;--d:#ff6b6b;--t:#e8eaf0;--t2:#8892a4;--t3:#4a5568;--serif:'DM Serif Display',serif;--sans:'DM Sans',sans-serif}
body{background:var(--bg);color:var(--t);font-family:var(--sans);font-size:13px}
.app{display:flex;height:100vh;overflow:hidden}
.sidebar{width:220px;min-width:220px;background:var(--s);border-right:1px solid var(--b);display:flex;flex-direction:column;overflow:hidden}
.logo{padding:24px 20px 20px;border-bottom:1px solid var(--b)}
.logo h1{font-family:var(--serif);font-size:18px;line-height:1.2}
.logo span{font-size:11px;color:var(--t2);letter-spacing:.08em;text-transform:uppercase}
.snav{padding:12px 0;flex:1;overflow-y:auto}
.nsec{padding:8px 20px 4px;font-size:10px;color:var(--t3);letter-spacing:.12em;text-transform:uppercase;font-weight:600}
.ni{display:flex;align-items:center;gap:10px;padding:9px 20px;cursor:pointer;color:var(--t2);font-size:13px;border-left:2px solid transparent;transition:all .15s}
.ni:hover{color:var(--t);background:rgba(91,141,238,.06)}
.ni.active{color:var(--a);border-left-color:var(--a);background:rgba(91,141,238,.1);font-weight:500}
.badge{margin-left:auto;background:var(--d);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px}
.badge.w{background:var(--w);color:#1a1a1a}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:56px;background:var(--s);border-bottom:1px solid var(--b);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}
.topbar h2{font-family:var(--serif);font-size:20px;flex:1}
.content{flex:1;overflow-y:auto;padding:24px 28px}
.btn{padding:7px 14px;border-radius:6px;border:none;cursor:pointer;font-family:var(--sans);font-size:12px;font-weight:500;transition:all .15s}
.btn-p{background:var(--a);color:#fff}.btn-p:hover{background:#4a7dd4}
.btn-g{background:transparent;color:var(--t2);border:1px solid var(--b)}.btn-g:hover{color:var(--t);border-color:var(--t2)}
.btn-d{background:rgba(255,107,107,.15);color:var(--d);border:1px solid rgba(255,107,107,.3)}
.btn-ok{background:rgba(56,217,169,.15);color:var(--a2);border:1px solid rgba(56,217,169,.3)}
.btn-sm{padding:4px 10px;font-size:11px}
.card{background:var(--s);border:1px solid var(--b);border-radius:10px}
.ch{padding:16px 20px 12px;border-bottom:1px solid var(--b);display:flex;align-items:center;gap:10px}
.ch h3{font-family:var(--serif);font-size:15px;flex:1}
.cb{padding:16px 20px}
.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.sc{background:var(--s);border:1px solid var(--b);border-radius:10px;padding:16px 20px;position:relative;overflow:hidden}
.sc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.sc.bl::before{background:var(--a)}.sc.gr::before{background:var(--a2)}.sc.or::before{background:var(--w)}.sc.rd::before{background:var(--d)}
.sl{font-size:11px;color:var(--t2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
.sv{font-family:var(--serif);font-size:28px}.ss{font-size:11px;color:var(--t3);margin-top:4px}
.alist{display:flex;flex-direction:column;gap:8px}
.ai{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-radius:8px;border:1px solid}
.ai.danger{background:rgba(255,107,107,.08);border-color:rgba(255,107,107,.25)}
.ai.warn{background:rgba(255,169,77,.08);border-color:rgba(255,169,77,.25)}
.ai.info{background:rgba(91,141,238,.08);border-color:rgba(91,141,238,.25)}
.adot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px}
.adot.danger{background:var(--d)}.adot.warn{background:var(--w)}.adot.info{background:var(--a)}
.at{font-weight:500;font-size:12px}.ad{font-size:11px;color:var(--t2);margin-top:2px}
.mnav{display:flex;align-items:center;gap:8px}
.mnav button{background:var(--s2);border:1px solid var(--b);color:var(--t2);width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:14px}
.mlabel{font-family:var(--serif);font-size:16px;min-width:160px;text-align:center}
.stw{overflow-x:auto;border-radius:10px;border:1px solid var(--b)}
.st{border-collapse:collapse;width:100%;min-width:900px}
.st th{background:var(--s2);padding:8px 6px;text-align:center;font-size:10px;font-weight:600;color:var(--t2);border-bottom:1px solid var(--b);border-right:1px solid var(--b);white-space:nowrap}
.st th.nc{text-align:left;padding-left:14px;min-width:160px}
.st td{padding:5px 4px;text-align:center;border-bottom:1px solid var(--b);border-right:1px solid var(--b);font-size:10px;font-weight:500;min-width:38px}
.st td.nmc{text-align:left;padding-left:14px;background:var(--s);font-size:12px;cursor:default;white-space:nowrap;min-width:160px}
.st tr:last-child td{border-bottom:none}
.sbadge{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:4px}
.sbadge.sr{background:var(--a2)}.sbadge.jr{background:var(--w)}
.rtag{font-size:10px;color:var(--t3);margin-left:4px}
.bdc{background:var(--s);border:1px solid var(--b);border-radius:8px;padding:14px 16px}
.brow{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--b)}
.brow:last-child{border-bottom:none}
.vbanner{background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);border-radius:6px;padding:6px 10px;font-size:11px;color:var(--d);margin-bottom:8px}
.tw{overflow-x:auto;border-radius:10px;border:1px solid var(--b)}
table.dt{width:100%;border-collapse:collapse}
table.dt th{background:var(--s2);padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--t2);letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid var(--b)}
table.dt td{padding:10px 14px;border-bottom:1px solid var(--b);font-size:12px}
table.dt tr:last-child td{border-bottom:none}
table.dt tr:hover td{background:rgba(255,255,255,.02)}
.sp{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;text-transform:uppercase}
.sp.Approved{background:rgba(56,217,169,.15);color:var(--a2)}
.sp.Pending{background:rgba(255,169,77,.15);color:var(--w)}
.sp.Rejected{background:rgba(255,107,107,.15);color:var(--d)}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(2px)}
.md{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:24px;min-width:400px;max-width:480px;width:100%}
.md h3{font-family:var(--serif);font-size:18px;margin-bottom:16px}
.fg{margin-bottom:14px}
.fl{display:block;font-size:11px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.fi,.fs{width:100%;padding:8px 12px;background:var(--s2);border:1px solid var(--b);border-radius:6px;color:var(--t);font-family:var(--sans);font-size:13px;outline:none;transition:border-color .15s}
.fi:focus,.fs:focus{border-color:var(--a)}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ma{display:flex;gap:8px;justify-content:flex-end;margin-top:20px}
.cg{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.cc{border-radius:6px;padding:8px 6px;text-align:center;font-size:10px;font-weight:600}
.cc.ok{background:rgba(56,217,169,.12);color:var(--a2);border:1px solid rgba(56,217,169,.2)}
.cc.violation{background:rgba(255,107,107,.12);color:var(--d);border:1px solid rgba(255,107,107,.3)}
.cc.na{background:var(--s2);color:var(--t3);border:1px solid var(--b)}
.cd{font-size:14px;font-weight:700;display:block;margin-bottom:2px}
.stg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.stc{background:var(--s);border:1px solid var(--b);border-radius:10px;padding:16px}
.sth{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:14px;font-weight:600;flex-shrink:0}
.av.doctor{background:rgba(91,141,238,.2);color:var(--a)}.av.nurse{background:rgba(56,217,169,.2);color:var(--a2)}
.sm{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.smi{font-size:11px;color:var(--t2)}.smi span{color:var(--t3);display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.empty{text-align:center;padding:40px 20px;color:var(--t3);font-size:13px}
.bt{display:flex;background:var(--s2);border:1px solid var(--b);border-radius:6px;overflow:hidden}
.bt button{padding:6px 16px;background:transparent;border:none;color:var(--t2);font-family:var(--sans);font-size:12px;cursor:pointer;font-weight:500;transition:all .15s}
.bt button.active{background:var(--a);color:#fff}
.syncbar{display:flex;align-items:center;gap:8px;padding:5px 12px;border-radius:6px;font-size:11px}
.syncbar.connected{background:rgba(56,217,169,.1);color:var(--a2);border:1px solid rgba(56,217,169,.2)}
.syncbar.demo{background:rgba(255,169,77,.1);color:var(--w);border:1px solid rgba(255,169,77,.2)}
.syncbar.saving,.syncbar.loading{background:rgba(91,141,238,.1);color:var(--a);border:1px solid rgba(91,141,238,.2)}
.sdot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.sdot.p{animation:pulse 1.2s infinite}
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
const now = new Date();
const [tab, setTab] = useState("dashboard");
const [staff, setStaff] = useState(DEMO_STAFF);
const [leave, setLeave] = useState(DEMO_LEAVE);
const [yr, setYr] = useState(now.getFullYear());
const [mo, setMo] = useState(now.getMonth());
const [leaveModal, setLeaveModal] = useState(false);
const [staffModal, setStaffModal] = useState(false);
const [editLeave, setEditLeave] = useState(null);
const [sync, setSync] = useState(isConfigured() ? "loading" : "demo");
const [saving, setSaving] = useState(false);

useEffect(() => {
if (!isConfigured()) return;
setSync("loading");
Promise.all([apiGet("getStaff"), apiGet("getLeave")]).then(([s, l]) => {
if (s && !s.error && s.length) {
setStaff(s.map(x => ({ ...x, offDays: Array.isArray(x.offDays) ? x.offDays : (x.offDays || "").split(",").map(d => d.trim()).filter(Boolean) })));
}
if (l && !l.error) setLeave(l);
setSync("connected");
}).catch(() => setSync("demo"));
}, []);

const save = async (fn) => { setSaving(true); await fn(); setSaving(false); };

const addStaff = useCallback(async (m) => {
setStaff(s => [...s, m]);
await save(() => apiPost({ action: "saveStaff", data: m }));
}, []);

const toggleStaff = useCallback(async (m) => {
const u = { ...m, active: !m.active };
setStaff(s => s.map(x => x.id === u.id ? u : x));
await save(() => apiPost({ action: "updateStaff", data: u }));
}, []);

const addLeave = useCallback(async (e) => {
setLeave(l => [...l, e]);
await save(() => apiPost({ action: "saveLeave", data: e }));
}, []);

const updLeave = useCallback(async (e) => {
setLeave(l => l.map(x => x.id === e.id ? e : x));
await save(() => apiPost({ action: "updateLeave", data: e }));
}, []);

const delLeave = useCallback(async (id) => {
setLeave(l => l.filter(x => x.id !== id));
await save(() => apiPost({ action: "deleteLeave", id }));
}, []);

const alerts = useMemo(() => {
const res = [];
const days = getDaysInMonth(yr, mo);
for (let d = 1; d <= days; d++) {
const ds = dateStr(yr, mo, d);
const dn = dayName(yr, mo, d);
if (dn === "Sun") continue;
["A", "B"].forEach(br => {
const onDuty = staff.filter(s => s.role === "Doctor" && s.active && (s.branch === br || s.branch === "Float") && isWorking(s, ds, leave));
const juniors = onDuty.filter(s => !isSeniorOnDate(s, ds));
const seniors = onDuty.filter(s => isSeniorOnDate(s, ds));
if (juniors.length > 0 && seniors.length === 0)
res.push({ type: "danger", date: ds, msg: `Supervision violation — ${branchLabel(br)}`, desc: `${juniors.map(j => j.name).join(", ")} without senior cover` });
if (onDuty.length === 0)
res.push({ type: "warn", date: ds, msg: `No doctor assigned — ${branchLabel(br)}`, desc: `${dn} ${d} ${MONTH_NAMES[mo]}` });
});
}
leave.filter(l => l.status === "Pending").forEach(l => {
const s = staff.find(x => x.id === l.staffId);
res.push({ type: "info", date: l.startDate, msg: "Pending leave approval", desc: `${s?.name} — ${l.leaveType} ${l.startDate} → ${l.endDate}` });
});
return res;
}, [staff, leave, yr, mo]);

const dc = alerts.filter(a => a.type === "danger").length;
const wc = alerts.filter(a => a.type === "warn").length;
const pc = leave.filter(l => l.status === "Pending").length;
const syncLabel = saving ? "Saving to Sheets…" : sync === "connected" ? "Connected to Sheets" : sync === "loading" ? "Connecting…" : "Demo mode";

return (
<React.Fragment>
<style>{css}</style>
<div className="app">
<Sidebar tab={tab} setTab={setTab} dc={dc} wc={wc} pc={pc} />
<div className="main">
<Topbar tab={tab} yr={yr} mo={mo} setYr={setYr} setMo={setMo}
onAddLeave={() => { setEditLeave(null); setLeaveModal(true); }}
onAddStaff={() => setStaffModal(true)}
syncLabel={syncLabel} sync={saving ? "saving" : sync}
/>
<div className="content">
{tab === "dashboard" && <Dashboard alerts={alerts} staff={staff} leave={leave} yr={yr} mo={mo} />}
{tab === "schedule" && <Schedule staff={staff} leave={leave} yr={yr} mo={mo} />}
{tab === "branch-a" && <BranchView branch="A" staff={staff} leave={leave} yr={yr} mo={mo} />}
{tab === "branch-b" && <BranchView branch="B" staff={staff} leave={leave} yr={yr} mo={mo} />}
{tab === "leave" && <LeaveLog leave={leave} staff={staff} onAdd={() => { setEditLeave(null); setLeaveModal(true); }} onEdit={l => { setEditLeave(l); setLeaveModal(true); }} onApprove={l => updLeave({ ...l, status: "Approved", approvedBy: "Manager" })} onReject={l => updLeave({ ...l, status: "Rejected" })} onDelete={delLeave} />}
{tab === "supervision" && <Supervision staff={staff} leave={leave} yr={yr} mo={mo} />}
{tab === "nurses" && <Nurses staff={staff} leave={leave} yr={yr} mo={mo} />}
{tab === "staffdb" && <StaffDB staff={staff} onToggle={toggleStaff} />}
</div>
</div>
</div>
{leaveModal && <LeaveModal staff={staff} leave={leave} editLeave={editLeave} onSave={async e => { editLeave ? await updLeave(e) : await addLeave(e); setLeaveModal(false); }} onClose={() => setLeaveModal(false)} />}
{staffModal && <StaffModal staff={staff} onSave={async m => { await addStaff(m); setStaffModal(false); }} onClose={() => setStaffModal(false)} />}
</React.Fragment>
);
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, dc, wc, pc }) {
const ni = (id, label, icon, badge, bw) => (
<div key={id} className={`ni${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
<span>{icon}</span>{label}
{badge > 0 && <span className={`badge${bw ? " w" : ""}`}>{badge}</span>}
</div>
);
return (
<div className="sidebar">
<div className="logo"><h1>Clinic<br />Scheduler</h1><span>Orchard &amp; Katong</span></div>
<div className="snav">
<div className="nsec">Overview</div>
{ni("dashboard", "Dashboard", "◈", dc + wc)}
{ni("schedule", "Monthly Schedule", "▦")}
<div className="nsec">Branch Views</div>
{ni("branch-a", "Orchard", "⬡")}
{ni("branch-b", "Katong", "⬡")}
<div className="nsec">Management</div>
{ni("leave", "Leave Log", "◷", pc, true)}
{ni("supervision", "MOH Compliance", "⬕", dc)}
{ni("nurses", "Nurse Assignments", "⊕")}
<div className="nsec">Admin</div>
{ni("staffdb", "Staff Database", "≡")}
</div>
</div>
);
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ tab, yr, mo, setYr, setMo, onAddLeave, onAddStaff, syncLabel, sync }) {
const titles = {
dashboard: "Dashboard", schedule: "Monthly Schedule",
"branch-a": "Orchard — Daily View", "branch-b": "Katong — Daily View",
leave: "Leave Log", supervision: "MOH Supervision Compliance",
staffdb: "Staff Database", nurses: "Nurse Assignments"
};
const prev = () => mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1);
const next = () => mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1);
const showNav = ["schedule", "branch-a", "branch-b", "supervision", "nurses"].includes(tab);
return (
<div className="topbar">
<h2>{titles[tab] || tab}</h2>
{showNav && <div className="mnav"><button onClick={prev}>‹</button><span className="mlabel">{MONTH_NAMES[mo]} {yr}</span><button onClick={next}>›</button></div>}
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
<div className={`syncbar ${sync}`}><div className={`sdot${sync === "saving" || sync === "loading" ? " p" : ""}`} />{syncLabel}</div>
{tab === "leave" && <button className="btn btn-p" onClick={onAddLeave}>+ Add Leave</button>}
{tab === "staffdb" && <button className="btn btn-p" onClick={onAddStaff}>+ Add Staff</button>}
</div>
</div>
);
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ alerts, staff, leave, yr, mo }) {
const active = staff.filter(s => s.active);
const drs = active.filter(s => s.role === "Doctor");
const nrs = active.filter(s => s.role === "Nurse");
const mLeave = leave.filter(l => l.startDate?.startsWith(`${yr}-${String(mo + 1).padStart(2, "0")}`));
const pend = leave.filter(l => l.status === "Pending");
const today = new Date(); const in7 = new Date(today); in7.setDate(today.getDate() + 7);
const upcoming = leave.filter(l => { const s = new Date(l.startDate); return s >= today && s <= in7 && l.status === "Approved"; });
return (
<div>
<div className="sg">
<div className="sc bl"><div className="sl">Doctors</div><div className="sv">{drs.length}</div><div className="ss">{drs.filter(d => d.seniority === "Senior").length} senior · {drs.filter(d => d.seniority === "Junior").length} junior</div></div>
<div className="sc gr"><div className="sl">Nurses</div><div className="sv">{nrs.length}</div><div className="ss">{nrs.filter(n => n.contract === "5-day").length} five-day · {nrs.filter(n => n.contract === "4-day").length} four-day</div></div>
<div className="sc or"><div className="sl">Leave This Month</div><div className="sv">{mLeave.length}</div><div className="ss">{pend.length} pending approval</div></div>
<div className="sc rd"><div className="sl">Active Alerts</div><div className="sv">{alerts.filter(a => a.type !== "info").length}</div><div className="ss">{alerts.filter(a => a.type === "danger").length} critical · {alerts.filter(a => a.type === "warn").length} warnings</div></div>
</div>
<div className="two">
<div className="card">
<div className="ch"><h3>Active Alerts</h3><span style={{ fontSize: 11, color: "var(--t3)" }}>{MONTH_NAMES[mo]} {yr}</span></div>
<div className="cb">
{alerts.length === 0 && <div className="empty">✓ No alerts this month</div>}
<div className="alist">{alerts.slice(0, 8).map((a, i) => <div key={i} className={`ai ${a.type}`}><div className={`adot ${a.type}`} /><div><div className="at">{a.msg}</div><div className="ad">{a.desc}</div></div></div>)}</div>
</div>
</div>
<div className="card">
<div className="ch"><h3>Upcoming Leave</h3><span style={{ fontSize: 11, color: "var(--t3)" }}>Next 7 days</span></div>
<div className="cb">
{upcoming.length === 0 && <div className="empty">No upcoming leave in next 7 days</div>}
<div className="alist">{upcoming.map((l, i) => { const s = staff.find(x => x.id === l.staffId); return <div key={i} className="ai info"><div className="adot info" /><div><div className="at">{s?.name}</div><div className="ad">{l.leaveType} · {l.startDate} → {l.endDate}</div></div></div>; })}</div>
</div>
</div>
</div>
</div>
);
}

// ─── MONTHLY SCHEDULE ─────────────────────────────────────────────────────────
function Schedule({ staff, leave, yr, mo }) {
const days = getDaysInMonth(yr, mo);
const drs = staff.filter(s => s.active && s.role === "Doctor");
const nrs = staff.filter(s => s.active && s.role === "Nurse");
const hdrs = Array.from({ length: days }, (_, i) => { const d = i + 1, dn = dayName(yr, mo, d); return { d, dn, sun: dn === "Sun" }; });
const legend = [["BR-A", "Orchard"], ["BR-B", "Katong"], ["AL", "Annual Leave"], ["MC", "Medical Leave"], ["OIL", "Off-in-lieu"], ["Emergency", "Emergency"], ["Maternity", "Maternity"], ["OFF", "Day Off"]];
const groups = [{ label: "DOCTORS", items: drs }, { label: "NURSES", items: nrs }];
return (
<div>
<div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
{legend.map(([k, label]) => { const st = statusStyle(k); return <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--t2)" }}><div style={{ width: 10, height: 10, borderRadius: 2, background: st.bg, border: `1px solid ${st.c}` }} />{label}</div>; })}
</div>
<div className="stw">
<table className="st">
<thead>
<tr>
<th className="nc">Staff</th>
{hdrs.map(({ d, dn, sun }) => <th key={d} style={{ color: sun ? "var(--d)" : undefined }}><div>{dn}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{d}</div></th>)}
</tr>
</thead>
<tbody>
{groups.map(({ label, items }) => (
<React.Fragment key={label}>
<tr><td colSpan={days + 1} style={{ background: "var(--s2)", color: "var(--t3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 14px" }}>{label}</td></tr>
{items.map(s => (
<tr key={s.id}>
<td className="nmc">
{s.role === "Doctor" && <span className={`sbadge ${isSeniorOnDate(s, dateStr(yr, mo, 1)) ? "sr" : "jr"}`} />}
{s.name.replace("Dr. ", "").replace("Nurse ", "")}
<span className="rtag">{branchLabel(s.branch)}</span>
</td>
{hdrs.map(({ d }) => {
const ds = dateStr(yr, mo, d);
const st = getStatus(s, ds, leave);
const ss = statusStyle(st);
return <td key={d} style={{ background: ss.bg, color: ss.c }}>{st !== `BR-${s.branch}` && st !== "Float" ? <span style={{ color: ss.c, fontSize: 10, fontWeight: 600 }}>{st.slice(0, 3)}</span> : <span style={{ opacity: .5 }}>✓</span>}</td>;
})}
</tr>
))}
</React.Fragment>
))}
</tbody>
</table>
</div>
</div>
);
}

// ─── BRANCH VIEW ──────────────────────────────────────────────────────────────
function BranchView({ branch, staff, leave, yr, mo }) {
const days = getDaysInMonth(yr, mo);
const todayStr = dateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const cards = [];
for (let d = 1; d <= days; d++) {
const ds = dateStr(yr, mo, d), dn = dayName(yr, mo, d);
if (dn === "Sun") continue;
const drs = staff.filter(s => s.role === "Doctor" && s.active && (s.branch === branch || s.branch === "Float") && isWorking(s, ds, leave));
const nrs = staff.filter(s => s.role === "Nurse" && s.active && (s.branch === branch || s.branch === "Float") && isWorking(s, ds, leave));
const juniors = drs.filter(s => !isSeniorOnDate(s, ds));
const seniors = drs.filter(s => isSeniorOnDate(s, ds));
cards.push({ d, ds, dn, drs, nrs, violation: juniors.length > 0 && seniors.length === 0, isToday: ds === todayStr });
}
return (
<div>
<div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 16 }}>All working days — {MONTH_NAMES[mo]} {yr}</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
{cards.map(({ d, ds, dn, drs, nrs, violation, isToday }) => (
<div key={d} className="bdc" style={isToday ? { border: "1px solid var(--a)" } : {}}>
{violation && <div className="vbanner">⚠ No senior doctor — supervision violation</div>}
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
<div><div style={{ fontFamily: "var(--serif)", fontSize: 22 }}>{d}</div><div style={{ fontSize: 11, color: "var(--t2)" }}>{dn}, {MONTH_NAMES[mo]}</div></div>
{isToday && <span style={{ marginLeft: "auto", background: "var(--a)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>TODAY</span>}
</div>
<div style={{ marginBottom: 8 }}>
<div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5, fontWeight: 600 }}>Doctors ({drs.length})</div>
{drs.length === 0 && <div style={{ fontSize: 11, color: "var(--d)" }}>⚠ None assigned</div>}
{drs.map(s => <div key={s.id} className="brow"><span className={`sbadge ${isSeniorOnDate(s, ds) ? "sr" : "jr"}`} /><span style={{ fontSize: 12 }}>{s.name}</span><span style={{ marginLeft: "auto", fontSize: 10, color: isSeniorOnDate(s, ds) ? "var(--a2)" : "var(--w)" }}>{isSeniorOnDate(s, ds) ? "Senior" : "Junior"}</span></div>)}
</div>
<div>
<div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 5, fontWeight: 600 }}>Nurses ({nrs.length})</div>
{nrs.length === 0 && <div style={{ fontSize: 11, color: "var(--w)" }}>— None assigned</div>}
{nrs.map(s => <div key={s.id} className="brow"><span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--a2)", display: "inline-block", marginRight: 4 }} /><span style={{ fontSize: 12 }}>{s.name}</span></div>)}
</div>
</div>
))}
</div>
</div>
);
}

// ─── LEAVE LOG ────────────────────────────────────────────────────────────────
function LeaveLog({ leave, staff, onAdd, onEdit, onApprove, onReject, onDelete }) {
const [filter, setFilter] = useState("All");
const rows = [...leave].sort((a, b) => (b.startDate || "").localeCompare(a.startDate || "")).filter(l => filter === "All" || l.status === filter);
return (
<div>
<div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
{["All", "Approved", "Pending", "Rejected"].map(f => <button key={f} className={`btn btn-sm ${filter === f ? "btn-p" : "btn-g"}`} onClick={() => setFilter(f)}>{f}</button>)}
</div>
<div className="tw">
<table className="dt">
<thead><tr><th>Staff</th><th>Role</th><th>Type</th><th>Start</th><th>End</th><th>Branch</th><th>Status</th><th>Actions</th></tr></thead>
<tbody>
{rows.map(l => {
const s = staff.find(x => x.id === l.staffId);
return (
<tr key={l.id}>
<td style={{ fontWeight: 500 }}>{s?.name || l.staffId}</td>
<td style={{ color: "var(--t2)" }}>{s?.role}</td>
<td><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${LEAVE_COLORS[l.leaveType] || "#888"}22`, color: LEAVE_COLORS[l.leaveType] || "#888" }}>{l.leaveType}</span></td>
<td style={{ color: "var(--t2)" }}>{l.startDate}</td>
<td style={{ color: "var(--t2)" }}>{l.endDate}</td>
<td style={{ color: "var(--t2)" }}>{branchLabel(s?.branch)}</td>
<td><span className={`sp ${l.status}`}>{l.status}</span></td>
<td>
<div style={{ display: "flex", gap: 6 }}>
{l.status === "Pending" && <React.Fragment><button className="btn btn-ok btn-sm" onClick={() => onApprove(l)}>Approve</button><button className="btn btn-d btn-sm" onClick={() => onReject(l)}>Reject</button></React.Fragment>}
<button className="btn btn-g btn-sm" onClick={() => onEdit(l)}>Edit</button>
<button className="btn btn-d btn-sm" onClick={() => onDelete(l.id)}>✕</button>
</div>
</td>
</tr>
);
})}
</tbody>
</table>
</div>
</div>
);
}

// ─── SUPERVISION ──────────────────────────────────────────────────────────────
function Supervision({ staff, leave, yr, mo }) {
const days = getDaysInMonth(yr, mo);
return (
<div>
{["A", "B"].map(br => {
const cells = [];
for (let d = 1; d <= days; d++) {
const ds = dateStr(yr, mo, d), dn = dayName(yr, mo, d);
if (dn === "Sun") { cells.push({ d, dn, s: "na", label: "—" }); continue; }
const onDuty = staff.filter(s => s.role === "Doctor" && s.active && (s.branch === br || s.branch === "Float") && isWorking(s, ds, leave));
const juniors = onDuty.filter(s => !isSeniorOnDate(s, ds));
const seniors = onDuty.filter(s => isSeniorOnDate(s, ds));
if (juniors.length === 0) { cells.push({ d, dn, s: "na", label: "N/A" }); continue; }
cells.push({ d, dn, s: seniors.length > 0 ? "ok" : "violation", label: seniors.length > 0 ? "✓" : "!" });
}
const vio = cells.filter(c => c.s === "violation").length;
const ok = cells.filter(c => c.s === "ok").length;
return (
<div key={br} className="card" style={{ marginBottom: 20 }}>
<div className="ch">
<h3>{branchLabel(br)} — Supervision Compliance</h3>
<span style={{ fontSize: 11, color: vio > 0 ? "var(--d)" : "var(--a2)" }}>{vio > 0 ? `⚠ ${vio} violation${vio > 1 ? "s" : ""}` : "✓ Fully compliant"}</span>
</div>
<div className="cb">
<div className="cg">{cells.map((c, i) => <div key={i} className={`cc ${c.s}`}><span className="cd">{c.d}</span><span style={{ fontSize: 9, display: "block", opacity: .7 }}>{c.dn}</span>{c.label}</div>)}</div>
<div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 11, color: "var(--t2)" }}><span>✅ Compliant: {ok}</span><span>❌ Violation: {vio}</span><span>⚪ No junior: {cells.filter(c => c.s === "na").length}</span></div>
</div>
</div>
);
})}
</div>
);
}

// ─── NURSES ───────────────────────────────────────────────────────────────────
function Nurses({ staff, leave, yr, mo }) {
const [br, setBr] = useState("A");
const days = getDaysInMonth(yr, mo);
const rows = [];
for (let d = 1; d <= days; d++) {
const ds = dateStr(yr, mo, d), dn = dayName(yr, mo, d);
if (dn === "Sun") continue;
rows.push({
d, ds, dn,
drs: staff.filter(s => s.role === "Doctor" && s.active && (s.branch === br || s.branch === "Float") && isWorking(s, ds, leave)),
nrs: staff.filter(s => s.role === "Nurse" && s.active && (s.branch === br || s.branch === "Float") && isWorking(s, ds, leave))
});
}
return (
<div>
<div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
<div className="bt">
<button className={br === "A" ? "active" : ""} onClick={() => setBr("A")}>Orchard</button>
<button className={br === "B" ? "active" : ""} onClick={() => setBr("B")}>Katong</button>
</div>
<span style={{ fontSize: 11, color: "var(--t2)" }}>Based on approved leave only</span>
</div>
<div className="tw">
<table className="dt">
<thead><tr><th>Date</th><th>Day</th><th>Doctors On Duty</th><th>Nurses Available</th><th>Ratio</th></tr></thead>
<tbody>
{rows.map(({ d, ds, dn, drs, nrs }) => (
<tr key={d}>
<td style={{ fontWeight: 600 }}>{d} {MONTH_NAMES[mo].slice(0, 3)}</td>
<td style={{ color: "var(--t2)" }}>{dn}</td>
<td>{drs.length === 0 ? <span style={{ color: "var(--d)", fontSize: 11 }}>None</span> : drs.map(s => <div key={s.id} style={{ fontSize: 11 }}>{isSeniorOnDate(s, ds) ? "🔵" : "🟡"} {s.name}</div>)}</td>
<td>{nrs.length === 0 ? <span style={{ color: "var(--d)", fontSize: 11 }}>None</span> : nrs.map(s => <div key={s.id} style={{ fontSize: 11 }}>● {s.name} <span style={{ color: "var(--t3)" }}>({s.contract})</span></div>)}</td>
<td><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: nrs.length >= drs.length ? "rgba(56,217,169,.12)" : "rgba(255,107,107,.12)", color: nrs.length >= drs.length ? "var(--a2)" : "var(--d)" }}>{nrs.length}/{drs.length}</span></td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}

// ─── STAFF DATABASE ───────────────────────────────────────────────────────────
function StaffDB({ staff, onToggle }) {
const today = new Date().toISOString().slice(0, 10);
return (
<div className="stg">
{staff.map(s => {
const ini = s.name.replace("Dr. ", "").replace("Nurse ", "").split(" ").map(w => w[0]).slice(0, 2).join("");
return (
<div key={s.id} className="stc" style={{ opacity: s.active ? 1 : .5 }}>
<div className="sth">
<div className={`av ${s.role.toLowerCase()}`}>{ini}</div>
<div><div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div><div style={{ fontSize: 11, color: "var(--t3)" }}>{s.id} · {branchLabel(s.branch)}</div></div>
<button className="btn btn-g btn-sm" style={{ marginLeft: "auto" }} onClick={() => onToggle(s)}>{s.active ? "Deactivate" : "Activate"}</button>
</div>
<div className="sm">
<div className="smi"><span>Contract</span>{s.contract}</div>
<div className="smi"><span>Off Days</span>{Array.isArray(s.offDays) ? s.offDays.join(", ") : s.offDays}</div>
{s.role === "Doctor" && <React.Fragment>
<div className="smi"><span>Seniority</span><span style={{ color: isSeniorOnDate(s, today) ? "var(--a2)" : "var(--w)" }}>{isSeniorOnDate(s, today) ? "Senior" : "Junior"}</span></div>
<div className="smi"><span>SDC/SMC Reg.</span>{s.regDate || "—"}</div>
</React.Fragment>}
</div>
</div>
);
})}
</div>
);
}

// ─── LEAVE MODAL ──────────────────────────────────────────────────────────────
function LeaveModal({ staff, leave, editLeave, onSave, onClose }) {
const [form, setForm] = useState(editLeave || { staffId: "", leaveType: "AL", startDate: "", endDate: "", status: "Pending", approvedBy: "" });
const [saving, setSaving] = useState(false);
async function save() {
if (!form.staffId || !form.startDate || !form.endDate) return;
setSaving(true);
await onSave(editLeave ? { ...form } : { ...form, id: "LV" + String(leave.length + 1).padStart(3, "0") });
setSaving(false);
}
return (
<div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
<div className="md">
<h3>{editLeave ? "Edit Leave" : "Add Leave Application"}</h3>
<div className="fg"><label className="fl">Staff Member</label>
<select className="fs" value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}>
<option value="">Select staff...</option>
{staff.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>
</div>
<div className="fg"><label className="fl">Leave Type</label>
<select className="fs" value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
{LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
</select>
</div>
<div className="fr">
<div className="fg"><label className="fl">Start Date</label><input type="date" className="fi" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
<div className="fg"><label className="fl">End Date</label><input type="date" className="fi" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
</div>
<div className="fg"><label className="fl">Status</label>
<select className="fs" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
<option>Pending</option><option>Approved</option><option>Rejected</option>
</select>
</div>
<div className="ma"><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button></div>
</div>
</div>
);
}

// ─── STAFF MODAL ──────────────────────────────────────────────────────────────
function StaffModal({ staff, onSave, onClose }) {
const [form, setForm] = useState({ name: "", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "", active: true });
const [saving, setSaving] = useState(false);
async function save() {
if (!form.name || (form.role === "Doctor" && !form.regDate)) return;
setSaving(true);
const rc = form.role === "Doctor" ? "DR" : "NR";
const cnt = staff.filter(s => s.role === form.role).length + 1;
await onSave({ ...form, id: `${rc}${String(cnt).padStart(2, "0")}` });
setSaving(false);
}
return (
<div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
<div className="md">
<h3>Add Staff Member</h3>
<div className="fg"><label className="fl">Full Name</label><input className="fi" placeholder="e.g. Dr. Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
<div className="fr">
<div className="fg"><label className="fl">Role</label>
<select className="fs" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
<option>Doctor</option><option>Nurse</option>
</select>
</div>
<div className="fg"><label className="fl">Branch</label>
<select className="fs" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
<option value="A">Orchard</option><option value="B">Katong</option><option value="Float">Float</option>
</select>
</div>
</div>
<div className="fr">
<div className="fg"><label className="fl">Contract</label>
<select className="fs" value={form.contract} onChange={e => setForm(f => ({ ...f, contract: e.target.value }))}>
<option value="5-day">5-day week</option><option value="4-day">4-day week</option>
</select>
</div>
{form.role === "Doctor" && <div className="fg"><label className="fl">Seniority</label>
<select className="fs" value={form.seniority} onChange={e => setForm(f => ({ ...f, seniority: e.target.value }))}>
<option>Senior</option><option>Junior</option>
</select>
</div>}
</div>
{form.role === "Doctor" && <div className="fg">
<label className="fl">SDC/SMC Registration Date</label>
<input type="date" className="fi" value={form.regDate} onChange={e => setForm(f => ({ ...f, regDate: e.target.value }))} />
<div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>Determines junior/senior status (2-year threshold)</div>
</div>}
<div className="ma"><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={save} disabled={saving}>{saving ? "Saving…" : "Add Staff"}</button></div>
</div>
</div>
);
}

