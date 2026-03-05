5 Mar 2026, 3:15 pm
import React, { useState, useEffect, useMemo, useCallback } from "react";

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

const BRANCH = { A: "Orchard", B: "Katong" };
const branchName = (b) => BRANCH[b] || b;

const DEMO_STAFF = [
{ id: "DR01", name: "Dr. Sarah Chen", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "2018-03-01", active: true },
{ id: "DR02", name: "Dr. Marcus Lim", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "2019-07-15", active: true },
{ id: "DR03", name: "Dr. Priya Nair", role: "Doctor", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "Junior", regDate: "2024-01-10", active: true },
{ id: "DR04", name: "Dr. James Tan", role: "Doctor", branch: "B", contract: "4-day", offDays: ["Sunday","Wednesday"],seniority: "Senior", regDate: "2017-05-20", active: true },
{ id: "DR05", name: "Dr. Aisha Malik", role: "Doctor", branch: "Float", contract: "5-day", offDays: ["Sunday"], seniority: "Junior", regDate: "2024-06-01", active: true },
{ id: "NR01", name: "Nurse Linda Goh", role: "Nurse", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "", active: true },
{ id: "NR02", name: "Nurse Ben Ong", role: "Nurse", branch: "A", contract: "4-day", offDays: ["Sunday","Thursday"], seniority: "-", regDate: "", active: true },
{ id: "NR03", name: "Nurse Fatimah R.", role: "Nurse", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "", active: true },
{ id: "NR04", name: "Nurse Kevin Wu", role: "Nurse", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "", active: true },
{ id: "NR05", name: "Nurse Mei Tan", role: "Nurse", branch: "Float", contract: "4-day", offDays: ["Sunday","Friday"], seniority: "-", regDate: "", active: true },
];

const DEMO_LEAVE = [
{ id: "LV001", staffId: "DR03", leaveType: "AL", startDate: "2025-07-07", endDate: "2025-07-09", status: "Approved", approvedBy: "Manager" },
{ id: "LV002", staffId: "NR01", leaveType: "MC", startDate: "2025-07-14", endDate: "2025-07-14", status: "Approved", approvedBy: "Manager" },
{ id: "LV003", staffId: "DR05", leaveType: "AL", startDate: "2025-07-21", endDate: "2025-07-23", status: "Pending", approvedBy: "" },
];

const LEAVE_TYPES = ["AL","MC","OIL","Emergency","Maternity"];
const LEAVE_COLORS = { AL:"#4ade80", MC:"#fb923c", OIL:"#a78bfa", Emergency:"#f87171", Maternity:"#f9a8d4" };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function fmtDate(y, m, d) { return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
function shortDay(y, m, d) { return DAYS_SHORT[new Date(y,m,d).getDay()]; }
function fullDay(y, m, d) { return DAYS_FULL[new Date(y,m,d).getDay()]; }

function isSenior(s, dateStr) {
if (s.seniority === "Senior") return true;
if (!s.regDate) return false;
const cutoff = new Date(s.regDate);
cutoff.setFullYear(cutoff.getFullYear() + 2);
return new Date(dateStr) >= cutoff;
}

function getDayStatus(s, ds, leaveList) {
const leave = leaveList.find(l =>
l.staffId === s.id && l.status === "Approved" && ds >= l.startDate && ds <= l.endDate
);
if (leave) return leave.leaveType;
const [y, m, d] = ds.split("-").map(Number);
if ((s.offDays || []).includes(fullDay(y, m - 1, d))) return "OFF";
return s.branch === "Float" ? "Float" : "BR-" + s.branch;
}

function isOnDuty(s, ds, leaveList) {
const st = getDayStatus(s, ds, leaveList);
return !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st);
}

function cellStyle(status) {
const map = {
"BR-A": { bg: "rgba(91,141,238,0.18)", color: "#7ba7f0" },
"BR-B": { bg: "rgba(56,217,169,0.18)", color: "#38d9a9" },
AL: { bg: "rgba(74,222,128,0.18)", color: "#4ade80" },
MC: { bg: "rgba(251,146,60,0.18)", color: "#fb923c" },
OIL: { bg: "rgba(167,139,250,0.18)", color: "#a78bfa" },
Emergency: { bg: "rgba(248,113,113,0.18)", color: "#f87171" },
Maternity: { bg: "rgba(249,168,212,0.18)", color: "#f9a8d4" },
OFF: { bg: "rgba(148,163,184,0.08)", color: "#4a5568" },
Float: { bg: "rgba(148,163,184,0.08)", color: "#64748b" },
};
return map[status] || { bg: "transparent", color: "#4a5568" };
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
--bg:#0f1117; --sur:#181c27; --sur2:#1e2333; --bdr:#2a3045;
--acc:#5b8dee; --grn:#38d9a9; --org:#ffa94d; --red:#ff6b6b;
--txt:#e8eaf0; --txt2:#8892a4; --txt3:#4a5568;
--serif:'DM Serif Display',serif; --sans:'DM Sans',sans-serif;
}
body { background:var(--bg); color:var(--txt); font-family:var(--sans); font-size:13px; }
.app { display:flex; height:100vh; overflow:hidden; }

.sidebar { width:220px; min-width:220px; background:var(--sur); border-right:1px solid var(--bdr); display:flex; flex-direction:column; }
.logo { padding:24px 20px 20px; border-bottom:1px solid var(--bdr); }
.logo h1 { font-family:var(--serif); font-size:18px; line-height:1.3; }
.logo span { font-size:11px; color:var(--txt2); letter-spacing:.08em; text-transform:uppercase; }
.nav { padding:12px 0; flex:1; overflow-y:auto; }
.nav-sec { padding:8px 20px 4px; font-size:10px; color:var(--txt3); letter-spacing:.12em; text-transform:uppercase; font-weight:600; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 20px; cursor:pointer; color:var(--txt2); font-size:13px; border-left:2px solid transparent; transition:all .15s; }
.nav-item:hover { color:var(--txt); background:rgba(91,141,238,.06); }
.nav-item.on { color:var(--acc); border-left-color:var(--acc); background:rgba(91,141,238,.1); font-weight:500; }
.badge { margin-left:auto; background:var(--red); color:#fff; font-size:10px; font-weight:700; padding:1px 6px; border-radius:10px; }
.badge.w { background:var(--org); color:#111; }

.main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.topbar { height:56px; background:var(--sur); border-bottom:1px solid var(--bdr); display:flex; align-items:center; padding:0 28px; gap:16px; flex-shrink:0; }
.topbar h2 { font-family:var(--serif); font-size:20px; flex:1; }
.content { flex:1; overflow-y:auto; padding:24px 28px; }

.btn { padding:7px 14px; border-radius:6px; border:none; cursor:pointer; font-family:var(--sans); font-size:12px; font-weight:500; transition:all .15s; }
.btn-p { background:var(--acc); color:#fff; }
.btn-p:hover { background:#4a7dd4; }
.btn-g { background:transparent; color:var(--txt2); border:1px solid var(--bdr); }
.btn-g:hover { color:var(--txt); border-color:var(--txt2); }
.btn-ok { background:rgba(56,217,169,.15); color:var(--grn); border:1px solid rgba(56,217,169,.3); }
.btn-del { background:rgba(255,107,107,.15); color:var(--red); border:1px solid rgba(255,107,107,.3); }
.btn-sm { padding:4px 10px; font-size:11px; }

.card { background:var(--sur); border:1px solid var(--bdr); border-radius:10px; }
.card-h { padding:16px 20px 12px; border-bottom:1px solid var(--bdr); display:flex; align-items:center; gap:10px; }
.card-h h3 { font-family:var(--serif); font-size:15px; flex:1; }
.card-b { padding:16px 20px; }

.stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
.stat { background:var(--sur); border:1px solid var(--bdr); border-radius:10px; padding:16px 20px; position:relative; overflow:hidden; }
.stat::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
.stat.b::before { background:var(--acc); }
.stat.g::before { background:var(--grn); }
.stat.o::before { background:var(--org); }
.stat.r::before { background:var(--red); }
.stat-lbl { font-size:11px; color:var(--txt2); text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px; }
.stat-val { font-family:var(--serif); font-size:28px; }
.stat-sub { font-size:11px; color:var(--txt3); margin-top:4px; }

.alerts { display:flex; flex-direction:column; gap:8px; }
.alert { display:flex; align-items:flex-start; gap:12px; padding:12px 16px; border-radius:8px; border:1px solid; }
.alert.danger { background:rgba(255,107,107,.08); border-color:rgba(255,107,107,.25); }
.alert.warn { background:rgba(255,169,77,.08); border-color:rgba(255,169,77,.25); }
.alert.info { background:rgba(91,141,238,.08); border-color:rgba(91,141,238,.25); }
.alert-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
.alert-dot.danger { background:var(--red); }
.alert-dot.warn { background:var(--org); }
.alert-dot.info { background:var(--acc); }
.alert-title { font-weight:500; font-size:12px; }
.alert-desc { font-size:11px; color:var(--txt2); margin-top:2px; }

.mnav { display:flex; align-items:center; gap:8px; }
.mnav button { background:var(--sur2); border:1px solid var(--bdr); color:var(--txt2); width:28px; height:28px; border-radius:6px; cursor:pointer; font-size:16px; line-height:1; }
.mlbl { font-family:var(--serif); font-size:16px; min-width:160px; text-align:center; }

.tbl-wrap { overflow-x:auto; border-radius:10px; border:1px solid var(--bdr); }
table { width:100%; border-collapse:collapse; }
table th { background:var(--sur2); padding:8px 10px; text-align:left; font-size:11px; font-weight:600; color:var(--txt2); letter-spacing:.06em; text-transform:uppercase; border-bottom:1px solid var(--bdr); white-space:nowrap; }
table td { padding:9px 10px; border-bottom:1px solid var(--bdr); font-size:12px; }
table tr:last-child td { border-bottom:none; }
table tr:hover td { background:rgba(255,255,255,.02); }
table th.center, table td.center { text-align:center; }

.sched-wrap { overflow-x:auto; border-radius:10px; border:1px solid var(--bdr); }
.sched { border-collapse:collapse; min-width:900px; }
.sched th { background:var(--sur2); padding:7px 5px; text-align:center; font-size:10px; font-weight:600; color:var(--txt2); border-bottom:1px solid var(--bdr); border-right:1px solid var(--bdr); white-space:nowrap; min-width:36px; }
.sched th.name-col { text-align:left; padding-left:14px; min-width:160px; }
.sched td { padding:4px 3px; text-align:center; border-bottom:1px solid var(--bdr); border-right:1px solid var(--bdr); font-size:10px; font-weight:500; min-width:36px; }
.sched td.name-col { text-align:left; padding-left:14px; background:var(--sur); font-size:12px; white-space:nowrap; min-width:160px; }
.sched tr:last-child td { border-bottom:none; }
.sched .group-row td { background:var(--sur2); color:var(--txt3); font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; padding:5px 14px; }

.dot { display:inline-block; width:6px; height:6px; border-radius:50%; margin-right:4px; }
.dot-sr { background:var(--grn); }
.dot-jr { background:var(--org); }
.branch-tag { font-size:10px; color:var(--txt3); margin-left:4px; }

.pill { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:600; text-transform:uppercase; }
.pill-Approved { background:rgba(56,217,169,.15); color:var(--grn); }
.pill-Pending { background:rgba(255,169,77,.15); color:var(--org); }
.pill-Rejected { background:rgba(255,107,107,.15); color:var(--red); }

.day-card { background:var(--sur); border:1px solid var(--bdr); border-radius:8px; padding:14px 16px; }
.day-card.today { border-color:var(--acc); }
.day-num { font-family:var(--serif); font-size:22px; }
.day-name { font-size:11px; color:var(--txt2); }
.viol-bar { background:rgba(255,107,107,.12); border:1px solid rgba(255,107,107,.3); border-radius:6px; padding:6px 10px; font-size:11px; color:var(--red); margin-bottom:8px; }
.staff-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--bdr); }
.staff-row:last-child { border-bottom:none; }
.sec-lbl { font-size:10px; color:var(--txt3); text-transform:uppercase; letter-spacing:.08em; margin-bottom:5px; font-weight:600; }

.comp-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
.comp-cell { border-radius:6px; padding:8px 6px; text-align:center; font-size:10px; font-weight:600; border:1px solid; }
.comp-cell.ok { background:rgba(56,217,169,.12); color:var(--grn); border-color:rgba(56,217,169,.2); }
.comp-cell.bad { background:rgba(255,107,107,.12); color:var(--red); border-color:rgba(255,107,107,.3); }
.comp-cell.na { background:var(--sur2); color:var(--txt3); border-color:var(--bdr); }
.comp-d { font-size:14px; font-weight:700; display:block; margin-bottom:2px; }

.staff-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:12px; }
.staff-card { background:var(--sur); border:1px solid var(--bdr); border-radius:10px; padding:16px; }
.staff-card.off { opacity:.5; }
.staff-head { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:var(--serif); font-size:14px; font-weight:600; flex-shrink:0; }
.avatar.dr { background:rgba(91,141,238,.2); color:var(--acc); }
.avatar.nr { background:rgba(56,217,169,.2); color:var(--grn); }
.staff-meta { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.meta-item { font-size:11px; color:var(--txt2); }
.meta-item span { color:var(--txt3); display:block; font-size:10px; text-transform:uppercase; letter-spacing:.06em; }

.modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:100; backdrop-filter:blur(2px); }
.modal { background:var(--sur); border:1px solid var(--bdr); border-radius:12px; padding:24px; width:100%; max-width:480px; }
.modal h3 { font-family:var(--serif); font-size:18px; margin-bottom:16px; }
.field { margin-bottom:14px; }
.field label { display:block; font-size:11px; font-weight:600; color:var(--txt2); text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
.field input, .field select { width:100%; padding:8px 12px; background:var(--sur2); border:1px solid var(--bdr); border-radius:6px; color:var(--txt); font-family:var(--sans); font-size:13px; outline:none; }
.field input:focus, .field select:focus { border-color:var(--acc); }
.field-hint { font-size:11px; color:var(--txt3); margin-top:4px; }
.field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.modal-foot { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }

.two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.seg { display:flex; background:var(--sur2); border:1px solid var(--bdr); border-radius:6px; overflow:hidden; }
.seg button { padding:6px 16px; background:transparent; border:none; color:var(--txt2); font-family:var(--sans); font-size:12px; cursor:pointer; font-weight:500; }
.seg button.on { background:var(--acc); color:#fff; }
.empty { text-align:center; padding:40px; color:var(--txt3); }
.sync { display:flex; align-items:center; gap:8px; padding:5px 12px; border-radius:6px; font-size:11px; border:1px solid; }
.sync.ok { background:rgba(56,217,169,.1); color:var(--grn); border-color:rgba(56,217,169,.2); }
.sync.demo { background:rgba(255,169,77,.1); color:var(--org); border-color:rgba(255,169,77,.2); }
.sync.busy { background:rgba(91,141,238,.1); color:var(--acc); border-color:rgba(91,141,238,.2); }
.sync-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
.sync-dot.spin { animation:pulse 1.2s infinite; }
::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-thumb { background:var(--bdr); border-radius:2px; }
`;

export default function App() {
const now = new Date();
const [tab, setTab] = useState("dashboard");
const [staff, setStaff] = useState(DEMO_STAFF);
const [leaves, setLeaves] = useState(DEMO_LEAVE);
const [yr, setYr] = useState(now.getFullYear());
const [mo, setMo] = useState(now.getMonth());
const [sync, setSync] = useState(isConfigured() ? "busy" : "demo");
const [busy, setBusy] = useState(false);
const [leaveModal, setLeaveModal] = useState(false);
const [staffModal, setStaffModal] = useState(false);
const [editLeave, setEditLeave] = useState(null);

useEffect(() => {
if (!isConfigured()) return;
Promise.all([apiGet("getStaff"), apiGet("getLeave")]).then(([s, l]) => {
if (s && !s.error && s.length) {
setStaff(s.map(x => ({
...x,
offDays: Array.isArray(x.offDays) ? x.offDays : String(x.offDays || "").split(",").map(d => d.trim()).filter(Boolean),
active: x.active === true || x.active === "TRUE" || x.active === "true",
})));
}
if (l && !l.error) setLeaves(l);
setSync("ok");
}).catch(() => setSync("demo"));
}, []);

async function run(fn) { setBusy(true); await fn(); setBusy(false); }

const addStaff = useCallback(async m => { setStaff(s => [...s, m]); await run(() => apiPost({ action: "saveStaff", data: m })); }, []);
const saveStaff = useCallback(async m => { setStaff(s => s.map(x => x.id === m.id ? m : x)); await run(() => apiPost({ action: "updateStaff", data: m })); }, []);
const addLeave = useCallback(async l => { setLeaves(v => [...v, l]); await run(() => apiPost({ action: "saveLeave", data: l })); }, []);
const saveLeave = useCallback(async l => { setLeaves(v => v.map(x => x.id === l.id ? l : x)); await run(() => apiPost({ action: "updateLeave", data: l })); }, []);
const removeLeave = useCallback(async id => { setLeaves(v => v.filter(x => x.id !== id)); await run(() => apiPost({ action: "deleteLeave", id })); }, []);

const alerts = useMemo(() => {
const res = [];
const days = daysInMonth(yr, mo);
for (let d = 1; d <= days; d++) {
const ds = fmtDate(yr, mo, d);
const dn = shortDay(yr, mo, d);
if (dn === "Sun") continue;
["A","B"].forEach(br => {
const duty = staff.filter(s => s.role === "Doctor" && s.active && (s.branch === br || s.branch === "Float") && isOnDuty(s, ds, leaves));
const jrs = duty.filter(s => !isSenior(s, ds));
const srs = duty.filter(s => isSenior(s, ds));
if (jrs.length > 0 && srs.length === 0) res.push({ type:"danger", msg:`Supervision violation — ${branchName(br)}`, desc: jrs.map(j => j.name).join(", ") + " without senior cover" });
if (duty.length === 0) res.push({ type:"warn", msg:`No doctor — ${branchName(br)}`, desc:`${dn} ${d} ${MONTHS[mo]}` });
});
}
leaves.filter(l => l.status === "Pending").forEach(l => {
const s = staff.find(x => x.id === l.staffId);
res.push({ type:"info", msg:"Pending leave approval", desc:`${s ? s.name : l.staffId} — ${l.leaveType} ${l.startDate} to ${l.endDate}` });
});
return res;
}, [staff, leaves, yr, mo]);

const dc = alerts.filter(a => a.type === "danger").length;
const wc = alerts.filter(a => a.type === "warn").length;
const pc = leaves.filter(l => l.status === "Pending").length;
const syncClass = busy ? "busy" : sync;
const syncText = busy ? "Saving…" : sync === "ok" ? "Connected to Sheets" : sync === "busy" ? "Connecting…" : "Demo mode";

function openAddLeave() { setEditLeave(null); setLeaveModal(true); }
function openEditLeave(l){ setEditLeave(l); setLeaveModal(true); }

return (
<React.Fragment>
<style>{CSS}</style>
<div className="app">
<Sidebar tab={tab} setTab={setTab} dc={dc} wc={wc} pc={pc} />
<div className="main">
<Topbar tab={tab} yr={yr} mo={mo} setYr={setYr} setMo={setMo}
onAddLeave={openAddLeave} onAddStaff={() => setStaffModal(true)}
syncClass={syncClass} syncText={syncText} busy={busy} />
<div className="content">
{tab === "dashboard" && <TabDashboard alerts={alerts} staff={staff} leaves={leaves} yr={yr} mo={mo} />}
{tab === "schedule" && <TabSchedule staff={staff} leaves={leaves} yr={yr} mo={mo} />}
{tab === "branch-a" && <TabBranch branch="A" staff={staff} leaves={leaves} yr={yr} mo={mo} />}
{tab === "branch-b" && <TabBranch branch="B" staff={staff} leaves={leaves} yr={yr} mo={mo} />}
{tab === "leave" && <TabLeave leaves={leaves} staff={staff} onAdd={openAddLeave} onEdit={openEditLeave} onApprove={l => saveLeave({...l, status:"Approved", approvedBy:"Manager"})} onReject={l => saveLeave({...l, status:"Rejected"})} onDelete={removeLeave} />}
{tab === "supervision" && <TabSupervision staff={staff} leaves={leaves} yr={yr} mo={mo} />}
{tab === "nurses" && <TabNurses staff={staff} leaves={leaves} yr={yr} mo={mo} />}
{tab === "staffdb" && <TabStaffDB staff={staff} onToggle={m => saveStaff({...m, active:!m.active})} />}
</div>
</div>
</div>
{leaveModal && (
<LeaveModal staff={staff} leaves={leaves} editLeave={editLeave}
onSave={async entry => { editLeave ? await saveLeave(entry) : await addLeave(entry); setLeaveModal(false); }}
onClose={() => setLeaveModal(false)} />
)}
{staffModal && (
<StaffModal staff={staff}
onSave={async m => { await addStaff(m); setStaffModal(false); }}
onClose={() => setStaffModal(false)} />
)}
</React.Fragment>
);
}

function Sidebar({ tab, setTab, dc, wc, pc }) {
function Item({ id, icon, label, badge, warn }) {
return (
<div className={"nav-item" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>
<span>{icon}</span>{label}
{badge > 0 && <span className={"badge" + (warn ? " w" : "")}>{badge}</span>}
</div>
);
}
return (
<div className="sidebar">
<div className="logo">
<h1>Clinic<br/>Scheduler</h1>
<span>Orchard &amp; Katong</span>
</div>
<div className="nav">
<div className="nav-sec">Overview</div>
<Item id="dashboard" icon="◈" label="Dashboard" badge={dc + wc} />
<Item id="schedule" icon="▦" label="Monthly Schedule" />
<div className="nav-sec">Branch Views</div>
<Item id="branch-a" icon="⬡" label="Orchard" />
<Item id="branch-b" icon="⬡" label="Katong" />
<div className="nav-sec">Management</div>
<Item id="leave" icon="◷" label="Leave Log" badge={pc} warn />
<Item id="supervision" icon="⬕" label="MOH Compliance" badge={dc} />
<Item id="nurses" icon="⊕" label="Nurse Assignments" />
<div className="nav-sec">Admin</div>
<Item id="staffdb" icon="≡" label="Staff Database" />
</div>
</div>
);
}

function Topbar({ tab, yr, mo, setYr, setMo, onAddLeave, onAddStaff, syncClass, syncText, busy }) {
const TITLES = {
dashboard:"Dashboard", schedule:"Monthly Schedule",
"branch-a": "Orchard — Daily View", "branch-b": "Katong — Daily View",
leave:"Leave Log", supervision:"MOH Supervision Compliance",
nurses:"Nurse Assignments", staffdb:"Staff Database",
};
const showNav = ["schedule","branch-a","branch-b","supervision","nurses"].includes(tab);
function prev() { mo === 0 ? (setMo(11), setYr(y => y - 1)) : setMo(m => m - 1); }
function next() { mo === 11 ? (setMo(0), setYr(y => y + 1)) : setMo(m => m + 1); }
return (
<div className="topbar">
<h2>{TITLES[tab] || tab}</h2>
{showNav && (
<div className="mnav">
<button onClick={prev}>‹</button>
<span className="mlbl">{MONTHS[mo]} {yr}</span>
<button onClick={next}>›</button>
</div>
)}
<div style={{display:"flex", gap:8, alignItems:"center"}}>
<div className={"sync " + syncClass}>
<div className={"sync-dot" + (busy ? " spin" : "")} />
{syncText}
</div>
{tab === "leave" && <button className="btn btn-p" onClick={onAddLeave}>+ Add Leave</button>}
{tab === "staffdb" && <button className="btn btn-p" onClick={onAddStaff}>+ Add Staff</button>}
</div>
</div>
);
}

function TabDashboard({ alerts, staff, leaves, yr, mo }) {
const active = staff.filter(s => s.active);
const drs = active.filter(s => s.role === "Doctor");
const nrs = active.filter(s => s.role === "Nurse");
const mLeaves = leaves.filter(l => l.startDate && l.startDate.startsWith(yr + "-" + String(mo + 1).padStart(2,"0")));
const pending = leaves.filter(l => l.status === "Pending");
const today = new Date();
const in7 = new Date(today); in7.setDate(today.getDate() + 7);
const upcoming = leaves.filter(l => { const d = new Date(l.startDate); return d >= today && d <= in7 && l.status === "Approved"; });
return (
<div>
<div className="stats">
<div className="stat b"><div className="stat-lbl">Doctors</div><div className="stat-val">{drs.length}</div><div className="stat-sub">{drs.filter(d=>d.seniority==="Senior").length} senior · {drs.filter(d=>d.seniority==="Junior").length} junior</div></div>
<div className="stat g"><div className="stat-lbl">Nurses</div><div className="stat-val">{nrs.length}</div><div className="stat-sub">{nrs.filter(n=>n.contract==="5-day").length} five-day · {nrs.filter(n=>n.contract==="4-day").length} four-day</div></div>
<div className="stat o"><div className="stat-lbl">Leave This Month</div><div className="stat-val">{mLeaves.length}</div><div className="stat-sub">{pending.length} pending approval</div></div>
<div className="stat r"><div className="stat-lbl">Alerts</div><div className="stat-val">{alerts.filter(a=>a.type!=="info").length}</div><div className="stat-sub">{alerts.filter(a=>a.type==="danger").length} critical · {alerts.filter(a=>a.type==="warn").length} warnings</div></div>
</div>
<div className="two-col">
<div className="card">
<div className="card-h"><h3>Active Alerts</h3><span style={{fontSize:11,color:"var(--txt3)"}}>{MONTHS[mo]} {yr}</span></div>
<div className="card-b">
{alerts.length === 0 && <div className="empty">✓ No alerts this month</div>}
<div className="alerts">
{alerts.slice(0,8).map((a,i) => (
<div key={i} className={"alert " + a.type}>
<div className={"alert-dot " + a.type} />
<div><div className="alert-title">{a.msg}</div><div className="alert-desc">{a.desc}</div></div>
</div>
))}
</div>
</div>
</div>
<div className="card">
<div className="card-h"><h3>Upcoming Leave</h3><span style={{fontSize:11,color:"var(--txt3)"}}>Next 7 days</span></div>
<div className="card-b">
{upcoming.length === 0 && <div className="empty">No upcoming leave</div>}
<div className="alerts">
{upcoming.map((l,i) => {
const s = staff.find(x => x.id === l.staffId);
return (
<div key={i} className="alert info">
<div className="alert-dot info" />
<div><div className="alert-title">{s ? s.name : l.staffId}</div><div className="alert-desc">{l.leaveType} · {l.startDate} → {l.endDate}</div></div>
</div>
);
})}
</div>
</div>
</div>
</div>
</div>
);
}

function TabSchedule({ staff, leaves, yr, mo }) {
const days = daysInMonth(yr, mo);
const hdrs = Array.from({length: days}, (_, i) => { const d = i+1; return { d, dn: shortDay(yr,mo,d) }; });
const drs = staff.filter(s => s.active && s.role === "Doctor");
const nrs = staff.filter(s => s.active && s.role === "Nurse");
const LEGEND = [["BR-A","Orchard"],["BR-B","Katong"],["AL","Annual Leave"],["MC","Medical Leave"],["OIL","Off-in-lieu"],["Emergency","Emergency"],["Maternity","Maternity"],["OFF","Day Off"]];
return (
<div>
<div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
{LEGEND.map(([k,label]) => {
const s = cellStyle(k);
return <div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--txt2)"}}><div style={{width:10,height:10,borderRadius:2,background:s.bg,border:"1px solid "+s.color}}/>{label}</div>;
})}
</div>
<div className="sched-wrap">
<table className="sched">
<thead>
<tr>
<th className="name-col">Staff</th>
{hdrs.map(({d,dn}) => <th key={d} style={{color: dn==="Sun" ? "var(--red)" : undefined}}><div>{dn}</div><div style={{fontSize:12,fontWeight:700}}>{d}</div></th>)}
</tr>
</thead>
<tbody>
{[{label:"DOCTORS",items:drs},{label:"NURSES",items:nrs}].map(({label,items}) => (
<React.Fragment key={label}>
<tr className="group-row"><td colSpan={days+1}>{label}</td></tr>
{items.map(s => (
<tr key={s.id}>
<td className="name-col">
{s.role === "Doctor" && <span className={"dot " + (isSenior(s, fmtDate(yr,mo,1)) ? "dot-sr" : "dot-jr")} />}
{s.name.replace("Dr. ","").replace("Nurse ","")}
<span className="branch-tag">{branchName(s.branch)}</span>
</td>
{hdrs.map(({d}) => {
const ds = fmtDate(yr, mo, d);
const st = getDayStatus(s, ds, leaves);
const sty = cellStyle(st);
const working = st === "BR-"+s.branch || st === "Float";
return (
<td key={d} style={{background:sty.bg, color:sty.color}}>
{working ? <span style={{opacity:.5}}>✓</span> : <span style={{fontSize:10,fontWeight:600}}>{st.slice(0,3)}</span>}
</td>
);
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

function TabBranch({ branch, staff, leaves, yr, mo }) {
const days = daysInMonth(yr, mo);
const todayDs = fmtDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const cards = [];
for (let d = 1; d <= days; d++) {
const ds = fmtDate(yr, mo, d);
const dn = shortDay(yr, mo, d);
if (dn === "Sun") continue;
const drs = staff.filter(s => s.role==="Doctor" && s.active && (s.branch===branch||s.branch==="Float") && isOnDuty(s,ds,leaves));
const nrs = staff.filter(s => s.role==="Nurse" && s.active && (s.branch===branch||s.branch==="Float") && isOnDuty(s,ds,leaves));
const jrs = drs.filter(s => !isSenior(s, ds));
const srs = drs.filter(s => isSenior(s, ds));
cards.push({ d, ds, dn, drs, nrs, violation: jrs.length > 0 && srs.length === 0, isToday: ds === todayDs });
}
return (
<div>
<div style={{fontSize:12,color:"var(--txt2)",marginBottom:16}}>All working days — {MONTHS[mo]} {yr}</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
{cards.map(({d,ds,dn,drs,nrs,violation,isToday}) => (
<div key={d} className={"day-card" + (isToday ? " today" : "")}>
{violation && <div className="viol-bar">⚠ No senior doctor — supervision violation</div>}
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
<div><div className="day-num">{d}</div><div className="day-name">{dn}, {MONTHS[mo]}</div></div>
{isToday && <span style={{marginLeft:"auto",background:"var(--acc)",color:"#fff",fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:600}}>TODAY</span>}
</div>
<div style={{marginBottom:8}}>
<div className="sec-lbl">Doctors ({drs.length})</div>
{drs.length === 0 && <div style={{fontSize:11,color:"var(--red)"}}>⚠ None assigned</div>}
{drs.map(s => (
<div key={s.id} className="staff-row">
<span className={"dot " + (isSenior(s,ds) ? "dot-sr" : "dot-jr")} />
<span style={{fontSize:12}}>{s.name}</span>
<span style={{marginLeft:"auto",fontSize:10,color:isSenior(s,ds)?"var(--grn)":"var(--org)"}}>{isSenior(s,ds)?"Senior":"Junior"}</span>
</div>
))}
</div>
<div>
<div className="sec-lbl">Nurses ({nrs.length})</div>
{nrs.length === 0 && <div style={{fontSize:11,color:"var(--org)"}}>— None assigned</div>}
{nrs.map(s => (
<div key={s.id} className="staff-row">
<span className="dot" style={{background:"var(--grn)"}} />
<span style={{fontSize:12}}>{s.name}</span>
</div>
))}
</div>
</div>
))}
</div>
</div>
);
}

function TabLeave({ leaves, staff, onAdd, onEdit, onApprove, onReject, onDelete }) {
const [filter, setFilter] = useState("All");
const rows = [...leaves]
.sort((a,b) => (b.startDate||"").localeCompare(a.startDate||""))
.filter(l => filter === "All" || l.status === filter);
return (
<div>
<div style={{display:"flex",gap:4,marginBottom:16}}>
{["All","Approved","Pending","Rejected"].map(f => (
<button key={f} className={"btn btn-sm " + (filter===f ? "btn-p" : "btn-g")} onClick={() => setFilter(f)}>{f}</button>
))}
</div>
<div className="tbl-wrap">
<table>
<thead>
<tr>
<th>Staff</th><th>Role</th><th>Type</th><th>Start</th><th>End</th><th>Branch</th><th>Status</th><th>Actions</th>
</tr>
</thead>
<tbody>
{rows.map(l => {
const s = staff.find(x => x.id === l.staffId);
const color = LEAVE_COLORS[l.leaveType] || "#888";
return (
<tr key={l.id}>
<td style={{fontWeight:500}}>{s ? s.name : l.staffId}</td>
<td style={{color:"var(--txt2)"}}>{s ? s.role : "—"}</td>
<td><span style={{padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,background:color+"22",color:color}}>{l.leaveType}</span></td>
<td style={{color:"var(--txt2)"}}>{l.startDate}</td>
<td style={{color:"var(--txt2)"}}>{l.endDate}</td>
<td style={{color:"var(--txt2)"}}>{s ? branchName(s.branch) : "—"}</td>
<td><span className={"pill pill-"+l.status}>{l.status}</span></td>
<td>
<div style={{display:"flex",gap:6}}>
{l.status === "Pending" && (
<React.Fragment>
<button className="btn btn-ok btn-sm" onClick={() => onApprove(l)}>Approve</button>
<button className="btn btn-del btn-sm" onClick={() => onReject(l)}>Reject</button>
</React.Fragment>
)}
<button className="btn btn-g btn-sm" onClick={() => onEdit(l)}>Edit</button>
<button className="btn btn-del btn-sm" onClick={() => onDelete(l.id)}>✕</button>
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

function TabSupervision({ staff, leaves, yr, mo }) {
const days = daysInMonth(yr, mo);
return (
<div>
{["A","B"].map(br => {
const cells = [];
for (let d = 1; d <= days; d++) {
const ds = fmtDate(yr, mo, d);
const dn = shortDay(yr, mo, d);
if (dn === "Sun") { cells.push({d, dn, cls:"na", lbl:"—"}); continue; }
const duty = staff.filter(s => s.role==="Doctor" && s.active && (s.branch===br||s.branch==="Float") && isOnDuty(s,ds,leaves));
const jrs = duty.filter(s => !isSenior(s, ds));
const srs = duty.filter(s => isSenior(s, ds));
if (jrs.length === 0) { cells.push({d, dn, cls:"na", lbl:"N/A"}); continue; }
cells.push({d, dn, cls: srs.length > 0 ? "ok" : "bad", lbl: srs.length > 0 ? "✓" : "!"});
}
const viol = cells.filter(c => c.cls === "bad").length;
const ok = cells.filter(c => c.cls === "ok").length;
return (
<div key={br} className="card" style={{marginBottom:20}}>
<div className="card-h">
<h3>{branchName(br)} — Supervision Compliance</h3>
<span style={{fontSize:11, color: viol > 0 ? "var(--red)" : "var(--grn)"}}>
{viol > 0 ? "⚠ "+viol+" violation"+(viol>1?"s":"") : "✓ Fully compliant"}
</span>
</div>
<div className="card-b">
<div className="comp-grid">
{cells.map((c,i) => (
<div key={i} className={"comp-cell "+c.cls}>
<span className="comp-d">{c.d}</span>
<span style={{fontSize:9,display:"block",opacity:.7}}>{c.dn}</span>
{c.lbl}
</div>
))}
</div>
<div style={{display:"flex",gap:16,marginTop:14,fontSize:11,color:"var(--txt2)"}}>
<span>✅ Compliant: {ok}</span>
<span>❌ Violation: {viol}</span>
<span>⚪ No junior: {cells.filter(c=>c.cls==="na").length}</span>
</div>
</div>
</div>
);
})}
</div>
);
}

function TabNurses({ staff, leaves, yr, mo }) {
const [br, setBr] = useState("A");
const days = daysInMonth(yr, mo);
const rows = [];
for (let d = 1; d <= days; d++) {
const ds = fmtDate(yr, mo, d);
const dn = shortDay(yr, mo, d);
if (dn === "Sun") continue;
const drs = staff.filter(s => s.role==="Doctor" && s.active && (s.branch===br||s.branch==="Float") && isOnDuty(s,ds,leaves));
const nrs = staff.filter(s => s.role==="Nurse" && s.active && (s.branch===br||s.branch==="Float") && isOnDuty(s,ds,leaves));
rows.push({ d, ds, dn, drs, nrs });
}
return (
<div>
<div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center"}}>
<div className="seg">
<button className={br==="A"?"on":""} onClick={() => setBr("A")}>Orchard</button>
<button className={br==="B"?"on":""} onClick={() => setBr("B")}>Katong</button>
</div>
<span style={{fontSize:11,color:"var(--txt2)"}}>Based on approved leave only</span>
</div>
<div className="tbl-wrap">
<table>
<thead>
<tr><th>Date</th><th>Day</th><th>Doctors On Duty</th><th>Nurses Available</th><th>Ratio</th></tr>
</thead>
<tbody>
{rows.map(({d,ds,dn,drs,nrs}) => (
<tr key={d}>
<td style={{fontWeight:600}}>{d} {MONTHS[mo].slice(0,3)}</td>
<td style={{color:"var(--txt2)"}}>{dn}</td>
<td>
{drs.length === 0
? <span style={{color:"var(--red)",fontSize:11}}>None</span>
: drs.map(s => <div key={s.id} style={{fontSize:11}}>{isSenior(s,ds)?"🔵":"🟡"} {s.name}</div>)
}
</td>
<td>
{nrs.length === 0
? <span style={{color:"var(--red)",fontSize:11}}>None</span>
: nrs.map(s => <div key={s.id} style={{fontSize:11}}>● {s.name} <span style={{color:"var(--txt3)"}}>({s.contract})</span></div>)
}
</td>
<td>
<span style={{padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,
background: nrs.length>=drs.length ? "rgba(56,217,169,.12)" : "rgba(255,107,107,.12)",
color: nrs.length>=drs.length ? "var(--grn)" : "var(--red)"}}>
{nrs.length}/{drs.length}
</span>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}

function TabStaffDB({ staff, onToggle }) {
const today = new Date().toISOString().slice(0,10);
return (
<div className="staff-grid">
{staff.map(s => {
const ini = s.name.replace("Dr. ","").replace("Nurse ","").split(" ").map(w => w[0]).slice(0,2).join("");
return (
<div key={s.id} className={"staff-card" + (s.active ? "" : " off")}>
<div className="staff-head">
<div className={"avatar " + (s.role==="Doctor" ? "dr" : "nr")}>{ini}</div>
<div>
<div style={{fontSize:13,fontWeight:500}}>{s.name}</div>
<div style={{fontSize:11,color:"var(--txt3)"}}>{s.id} · {branchName(s.branch)}</div>
</div>
<button className="btn btn-g btn-sm" style={{marginLeft:"auto"}} onClick={() => onToggle(s)}>
{s.active ? "Deactivate" : "Activate"}
</button>
</div>
<div className="staff-meta">
<div className="meta-item"><span>Contract</span>{s.contract}</div>
<div className="meta-item"><span>Off Days</span>{Array.isArray(s.offDays) ? s.offDays.join(", ") : s.offDays}</div>
{s.role === "Doctor" && (
<React.Fragment>
<div className="meta-item">
<span>Seniority</span>
<span style={{color: isSenior(s,today) ? "var(--grn)" : "var(--org)"}}>{isSenior(s,today) ? "Senior" : "Junior"}</span>
</div>
<div className="meta-item"><span>SDC/SMC Reg.</span>{s.regDate || "—"}</div>
</React.Fragment>
)}
</div>
</div>
);
})}
</div>
);
}

function LeaveModal({ staff, leaves, editLeave, onSave, onClose }) {
const blank = { staffId:"", leaveType:"AL", startDate:"", endDate:"", status:"Pending", approvedBy:"" };
const [form, setForm] = useState(editLeave || blank);
const [busy, setBusy] = useState(false);
const set = (k, v) => setForm(f => ({...f, [k]:v}));

async function save() {
if (!form.staffId || !form.startDate || !form.endDate) return;
setBusy(true);
const entry = editLeave ? {...form} : {...form, id:"LV"+String(leaves.length+1).padStart(3,"0")};
await onSave(entry);
setBusy(false);
}

return (
<div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}>
<div className="modal">
<h3>{editLeave ? "Edit Leave" : "Add Leave Application"}</h3>
<div className="field">
<label>Staff Member</label>
<select value={form.staffId} onChange={e => set("staffId", e.target.value)}>
<option value="">Select staff…</option>
{staff.filter(s=>s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>
</div>
<div className="field">
<label>Leave Type</label>
<select value={form.leaveType} onChange={e => set("leaveType", e.target.value)}>
{LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
</select>
</div>
<div className="field-row">
<div className="field"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} /></div>
<div className="field"><label>End Date</label><input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} /></div>
</div>
<div className="field">
<label>Status</label>
<select value={form.status} onChange={e => set("status", e.target.value)}>
<option>Pending</option><option>Approved</option><option>Rejected</option>
</select>
</div>
<div className="modal-foot">
<button className="btn btn-g" onClick={onClose}>Cancel</button>
<button className="btn btn-p" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button>
</div>
</div>
</div>
);
}

function StaffModal({ staff, onSave, onClose }) {
const blank = { name:"", role:"Doctor", branch:"A", contract:"5-day", offDays:["Sunday"], seniority:"Senior", regDate:"", active:true };
const [form, setForm] = useState(blank);
const [busy, setBusy] = useState(false);
const set = (k, v) => setForm(f => ({...f, [k]:v}));

async function save() {
if (!form.name) return;
if (form.role === "Doctor" && !form.regDate) return;
setBusy(true);
const prefix = form.role === "Doctor" ? "DR" : "NR";
const count = staff.filter(s => s.role === form.role).length + 1;
await onSave({...form, id: prefix + String(count).padStart(2,"0")});
setBusy(false);
}

return (
<div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}>
<div className="modal">
<h3>Add Staff Member</h3>
<div className="field"><label>Full Name</label><input placeholder="e.g. Dr. Jane Smith" value={form.name} onChange={e => set("name", e.target.value)} /></div>
<div className="field-row">
<div className="field">
<label>Role</label>
<select value={form.role} onChange={e => set("role", e.target.value)}>
<option>Doctor</option><option>Nurse</option>
</select>
</div>
<div className="field">
<label>Primary Branch</label>
<select value={form.branch} onChange={e => set("branch", e.target.value)}>
<option value="A">Orchard</option><option value="B">Katong</option><option value="Float">Float</option>
</select>
</div>
</div>
<div className="field-row">
<div className="field">
<label>Contract</label>
<select value={form.contract} onChange={e => set("contract", e.target.value)}>
<option value="5-day">5-day week</option><option value="4-day">4-day week</option>
</select>
</div>
{form.role === "Doctor" && (
<div className="field">
<label>Seniority</label>
<select value={form.seniority} onChange={e => set("seniority", e.target.value)}>
<option>Senior</option><option>Junior</option>
</select>
</div>
)}
</div>
{form.role === "Doctor" && (
<div className="field">
<label>SDC/SMC Registration Date</label>
<input type="date" value={form.regDate} onChange={e => set("regDate", e.target.value)} />
<div className="field-hint">Determines junior/senior status — 2-year threshold from this date</div>
</div>
)}
<div className="modal-foot">
<button className="btn btn-g" onClick={onClose}>Cancel</button>
<button className="btn btn-p" onClick={save} disabled={busy}>{busy ? "Saving…" : "Add Staff"}</button>
</div>
</div>
</div>
);
}

