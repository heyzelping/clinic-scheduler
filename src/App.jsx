5 Mar 2026, 3:22 pm
import { useState, useEffect, useMemo } from "react";

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const INITIAL_STAFF = [
{ id: "DR01", name: "Dr. Sarah Chen", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "2018-03-01", active: true },
{ id: "DR02", name: "Dr. Marcus Lim", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "2019-07-15", active: true },
{ id: "DR03", name: "Dr. Priya Nair", role: "Doctor", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "Junior", regDate: "2024-01-10", active: true },
{ id: "DR04", name: "Dr. James Tan", role: "Doctor", branch: "B", contract: "4-day", offDays: ["Sunday", "Wednesday"], seniority: "Senior", regDate: "2017-05-20", active: true },
{ id: "DR05", name: "Dr. Aisha Malik", role: "Doctor", branch: "Float", contract: "5-day", offDays: ["Sunday"], seniority: "Junior", regDate: "2024-06-01", active: true },
{ id: "NR01", name: "Nurse Linda Goh", role: "Nurse", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "2020-01-01", active: true },
{ id: "NR02", name: "Nurse Ben Ong", role: "Nurse", branch: "A", contract: "4-day", offDays: ["Sunday", "Thursday"], seniority: "-", regDate: "2021-03-15", active: true },
{ id: "NR03", name: "Nurse Fatimah R.", role: "Nurse", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "2022-06-01", active: true },
{ id: "NR04", name: "Nurse Kevin Wu", role: "Nurse", branch: "B", contract: "5-day", offDays: ["Sunday"], seniority: "-", regDate: "2023-02-10", active: true },
{ id: "NR05", name: "Nurse Mei Tan", role: "Nurse", branch: "Float", contract: "4-day", offDays: ["Sunday", "Friday"], seniority: "-", regDate: "2021-11-20", active: true },
];

const INITIAL_LEAVE = [
{ id: "LV001", staffId: "DR03", leaveType: "AL", startDate: "2025-07-07", endDate: "2025-07-09", status: "Approved", approvedBy: "Manager" },
{ id: "LV002", staffId: "NR01", leaveType: "MC", startDate: "2025-07-14", endDate: "2025-07-14", status: "Approved", approvedBy: "Manager" },
{ id: "LV003", staffId: "DR05", leaveType: "AL", startDate: "2025-07-21", endDate: "2025-07-23", status: "Pending", approvedBy: "" },
{ id: "LV004", staffId: "DR04", leaveType: "OIL", startDate: "2025-07-10", endDate: "2025-07-10", status: "Approved", approvedBy: "Manager" },
{ id: "LV005", staffId: "NR03", leaveType: "AL", startDate: "2025-07-28", endDate: "2025-07-30", status: "Approved", approvedBy: "Manager" },
];

const LEAVE_TYPES = ["AL", "MC", "OIL", "Emergency", "Maternity"];
const LEAVE_COLORS = { AL: "#4ade80", MC: "#fb923c", OIL: "#a78bfa", Emergency: "#f87171", Maternity: "#f9a8d4", OFF: "#94a3b8" };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getDaysInMonth(year, month) {
return new Date(year, month + 1, 0).getDate();
}
function dateStr(y, m, d) {
return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function dayName(y, m, d) {
return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(y, m, d).getDay()];
}
function isSeniorOnDate(staff, date) {
if (staff.seniority === "Senior") return true;
const auto = new Date(staff.regDate);
auto.setFullYear(auto.getFullYear() + 2);
return new Date(date) >= auto;
}
function getStaffStatus(staffMember, dateStr, leaveLog) {
const approvedLeave = leaveLog.find(
l => l.staffId === staffMember.id && l.status === "Approved" &&
dateStr >= l.startDate && dateStr <= l.endDate
);
if (approvedLeave) return approvedLeave.leaveType;
const [y, m, d] = dateStr.split("-").map(Number);
const dn = dayName(y, m - 1, d);
if (staffMember.offDays.includes(["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][[0,1,2,3,4,5,6][new Date(y,m-1,d).getDay()]])) return "OFF";
return staffMember.branch === "Float" ? "Float" : `BR-${staffMember.branch}`;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
--bg: #0f1117;
--surface: #181c27;
--surface2: #1e2333;
--border: #2a3045;
--accent: #5b8dee;
--accent2: #38d9a9;
--warn: #ffa94d;
--danger: #ff6b6b;
--text: #e8eaf0;
--text2: #8892a4;
--text3: #4a5568;
--serif: 'DM Serif Display', serif;
--sans: 'DM Sans', sans-serif;
}

body { background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 13px; }

.app { display: flex; height: 100vh; overflow: hidden; }

/* SIDEBAR */
.sidebar {
width: 220px; min-width: 220px; background: var(--surface);
border-right: 1px solid var(--border); display: flex; flex-direction: column;
padding: 0; overflow: hidden;
}
.sidebar-logo {
padding: 24px 20px 20px;
border-bottom: 1px solid var(--border);
}
.sidebar-logo h1 { font-family: var(--serif); font-size: 18px; color: var(--text); line-height: 1.2; }
.sidebar-logo span { font-size: 11px; color: var(--text2); letter-spacing: 0.08em; text-transform: uppercase; }
.sidebar-nav { padding: 12px 0; flex: 1; overflow-y: auto; }
.nav-section { padding: 8px 20px 4px; font-size: 10px; color: var(--text3); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
.nav-item {
display: flex; align-items: center; gap: 10px; padding: 9px 20px;
cursor: pointer; color: var(--text2); font-size: 13px; font-weight: 400;
border-left: 2px solid transparent; transition: all 0.15s;
}
.nav-item:hover { color: var(--text); background: rgba(91,141,238,0.06); }
.nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(91,141,238,0.1); font-weight: 500; }
.nav-item .badge {
margin-left: auto; background: var(--danger); color: #fff;
font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px;
}
.nav-item .badge.warn { background: var(--warn); color: #1a1a1a; }

/* MAIN */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar {
height: 56px; background: var(--surface); border-bottom: 1px solid var(--border);
display: flex; align-items: center; padding: 0 28px; gap: 16px; flex-shrink: 0;
}
.topbar h2 { font-family: var(--serif); font-size: 20px; color: var(--text); flex: 1; }
.topbar-actions { display: flex; gap: 8px; align-items: center; }

.content { flex: 1; overflow-y: auto; padding: 24px 28px; }

/* BUTTONS */
.btn {
padding: 7px 14px; border-radius: 6px; border: none; cursor: pointer;
font-family: var(--sans); font-size: 12px; font-weight: 500; transition: all 0.15s;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: #4a7dd4; }
.btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border); }
.btn-ghost:hover { color: var(--text); border-color: var(--text2); }
.btn-danger { background: rgba(255,107,107,0.15); color: var(--danger); border: 1px solid rgba(255,107,107,0.3); }
.btn-success { background: rgba(56,217,169,0.15); color: var(--accent2); border: 1px solid rgba(56,217,169,0.3); }
.btn-sm { padding: 4px 10px; font-size: 11px; }

/* CARDS */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; }
.card-header { padding: 16px 20px 12px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
.card-header h3 { font-family: var(--serif); font-size: 15px; color: var(--text); flex: 1; }
.card-body { padding: 16px 20px; }

/* STAT CARDS */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.stat-card {
background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
padding: 16px 20px; position: relative; overflow: hidden;
}
.stat-card::before {
content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.stat-card.blue::before { background: var(--accent); }
.stat-card.green::before { background: var(--accent2); }
.stat-card.orange::before { background: var(--warn); }
.stat-card.red::before { background: var(--danger); }
.stat-label { font-size: 11px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.stat-value { font-family: var(--serif); font-size: 28px; color: var(--text); }
.stat-sub { font-size: 11px; color: var(--text3); margin-top: 4px; }

/* ALERTS */
.alert-list { display: flex; flex-direction: column; gap: 8px; }
.alert-item {
display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px;
border-radius: 8px; border: 1px solid;
}
.alert-item.danger { background: rgba(255,107,107,0.08); border-color: rgba(255,107,107,0.25); }
.alert-item.warn { background: rgba(255,169,77,0.08); border-color: rgba(255,169,77,0.25); }
.alert-item.info { background: rgba(91,141,238,0.08); border-color: rgba(91,141,238,0.25); }
.alert-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.alert-dot.danger { background: var(--danger); }
.alert-dot.warn { background: var(--warn); }
.alert-dot.info { background: var(--accent); }
.alert-title { font-weight: 500; font-size: 12px; color: var(--text); }
.alert-desc { font-size: 11px; color: var(--text2); margin-top: 2px; }

/* SCHEDULE GRID */
.schedule-controls { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.month-nav { display: flex; align-items: center; gap: 8px; }
.month-nav button { background: var(--surface2); border: 1px solid var(--border); color: var(--text2); width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.month-nav button:hover { color: var(--text); border-color: var(--text2); }
.month-label { font-family: var(--serif); font-size: 16px; color: var(--text); min-width: 160px; text-align: center; }

.schedule-table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); }
.schedule-table { border-collapse: collapse; width: 100%; min-width: 900px; }
.schedule-table th {
background: var(--surface2); padding: 8px 6px; text-align: center;
font-size: 10px; font-weight: 600; color: var(--text2); letter-spacing: 0.05em;
border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); white-space: nowrap;
}
.schedule-table th.name-col { text-align: left; padding-left: 14px; min-width: 160px; }
.schedule-table td {
padding: 5px 4px; text-align: center; border-bottom: 1px solid var(--border);
border-right: 1px solid var(--border); font-size: 10px; font-weight: 500;
cursor: pointer; transition: background 0.1s; min-width: 38px;
}
.schedule-table td:hover { filter: brightness(1.3); }
.schedule-table td.name-cell {
text-align: left; padding-left: 14px; background: var(--surface);
font-size: 12px; font-weight: 400; cursor: default; white-space: nowrap;
min-width: 160px;
}
.schedule-table tr:last-child td { border-bottom: none; }
.schedule-table .day-sun th { color: var(--danger) !important; }
.schedule-table .day-sat th { color: var(--warn) !important; }

.status-chip {
display: inline-block; padding: 2px 6px; border-radius: 4px;
font-size: 10px; font-weight: 600;
}

.role-tag { font-size: 10px; color: var(--text3); margin-left: 4px; }
.senior-badge { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent2); margin-right: 4px; }
.junior-badge { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--warn); margin-right: 4px; }

/* BRANCH VIEW */
.branch-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.branch-day-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
.branch-day-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.branch-day-header .date-badge { font-family: var(--serif); font-size: 22px; color: var(--text); }
.branch-day-header .day-name { font-size: 11px; color: var(--text2); }
.branch-staff-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid var(--border); }
.branch-staff-row:last-child { border-bottom: none; }
.violation-banner { background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.3); border-radius: 6px; padding: 6px 10px; font-size: 11px; color: var(--danger); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }

/* LEAVE LOG */
.table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); }
table.data-table { width: 100%; border-collapse: collapse; }
table.data-table th { background: var(--surface2); padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text2); letter-spacing: 0.06em; text-transform: uppercase; border-bottom: 1px solid var(--border); }
table.data-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); font-size: 12px; color: var(--text); }
table.data-table tr:last-child td { border-bottom: none; }
table.data-table tr:hover td { background: rgba(255,255,255,0.02); }

.status-pill { padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.status-pill.Approved { background: rgba(56,217,169,0.15); color: var(--accent2); }
.status-pill.Pending { background: rgba(255,169,77,0.15); color: var(--warn); }
.status-pill.Rejected { background: rgba(255,107,107,0.15); color: var(--danger); }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(2px); }
.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; min-width: 400px; max-width: 480px; width: 100%; }
.modal h3 { font-family: var(--serif); font-size: 18px; color: var(--text); margin-bottom: 16px; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 11px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.form-input, .form-select {
width: 100%; padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border);
border-radius: 6px; color: var(--text); font-family: var(--sans); font-size: 13px;
outline: none; transition: border-color 0.15s;
}
.form-input:focus, .form-select:focus { border-color: var(--accent); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

/* SUPERVISION */
.compliance-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.compliance-cell { border-radius: 6px; padding: 8px 6px; text-align: center; font-size: 10px; font-weight: 600; }
.compliance-cell.ok { background: rgba(56,217,169,0.12); color: var(--accent2); border: 1px solid rgba(56,217,169,0.2); }
.compliance-cell.violation { background: rgba(255,107,107,0.12); color: var(--danger); border: 1px solid rgba(255,107,107,0.3); }
.compliance-cell.na { background: var(--surface2); color: var(--text3); border: 1px solid var(--border); }
.compliance-cell .cell-date { font-size: 14px; font-weight: 700; display: block; margin-bottom: 2px; }

/* STAFF DB */
.staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.staff-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.staff-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.staff-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--serif); font-size: 14px; font-weight: 600; flex-shrink: 0; }
.staff-avatar.doctor { background: rgba(91,141,238,0.2); color: var(--accent); }
.staff-avatar.nurse { background: rgba(56,217,169,0.2); color: var(--accent2); }
.staff-card-name { font-size: 13px; font-weight: 500; color: var(--text); }
.staff-card-id { font-size: 11px; color: var(--text3); }
.staff-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.staff-meta-item { font-size: 11px; color: var(--text2); }
.staff-meta-item span { color: var(--text3); display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }

/* SCROLLBAR */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.section-title { font-family: var(--serif); font-size: 14px; color: var(--text); margin-bottom: 12px; }
.empty-state { text-align: center; padding: 40px 20px; color: var(--text3); font-size: 13px; }

.branch-toggle { display: flex; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.branch-toggle button { padding: 6px 16px; background: transparent; border: none; color: var(--text2); font-family: var(--sans); font-size: 12px; cursor: pointer; font-weight: 500; transition: all 0.15s; }
.branch-toggle button.active { background: var(--accent); color: #fff; }

.week-strip { display: flex; gap: 4px; margin-bottom: 16px; }
.week-day { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; padding: 6px 4px; text-align: center; }
.week-day.today { border-color: var(--accent); background: rgba(91,141,238,0.1); }
.week-day .wd-name { font-size: 10px; color: var(--text3); }
.week-day .wd-num { font-size: 16px; font-family: var(--serif); color: var(--text); }
`;

// ─── STATUS CELL COLORS ───────────────────────────────────────────────────────
function statusStyle(status) {
const map = {
"BR-A": { background: "rgba(91,141,238,0.18)", color: "#7ba7f0" },
"BR-B": { background: "rgba(56,217,169,0.18)", color: "#38d9a9" },
AL: { background: "rgba(74,222,128,0.18)", color: "#4ade80" },
MC: { background: "rgba(251,146,60,0.18)", color: "#fb923c" },
OIL: { background: "rgba(167,139,250,0.18)", color: "#a78bfa" },
Emergency: { background: "rgba(248,113,113,0.18)", color: "#f87171" },
Maternity: { background: "rgba(249,168,212,0.18)", color: "#f9a8d4" },
OFF: { background: "rgba(148,163,184,0.1)", color: "#4a5568" },
Float: { background: "rgba(148,163,184,0.1)", color: "#64748b" },
};
return map[status] || { background: "transparent", color: "#4a5568" };
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
const [tab, setTab] = useState("dashboard");
const [staff, setStaff] = useState(INITIAL_STAFF);
const [leaveLog, setLeaveLog] = useState(INITIAL_LEAVE);
const [viewYear, setViewYear] = useState(2025);
const [viewMonth, setViewMonth] = useState(6); // July
const [showLeaveModal, setShowLeaveModal] = useState(false);
const [showStaffModal, setShowStaffModal] = useState(false);
const [branchView, setBranchView] = useState("A");
const [editLeave, setEditLeave] = useState(null);

// ── Computed alerts ──────────────────────────────────────────────────────
const alerts = useMemo(() => {
const result = [];
const days = getDaysInMonth(viewYear, viewMonth);
for (let d = 1; d <= days; d++) {
const ds = dateStr(viewYear, viewMonth, d);
const dn = dayName(viewYear, viewMonth, d);
if (dn === "Sun") continue;
["A", "B"].forEach(branch => {
const workingDoctors = staff.filter(s => s.role === "Doctor" && s.active);
const onDuty = workingDoctors.filter(s => {
const st = getStaffStatus(s, ds, leaveLog);
return st === `BR-${branch}` || (s.branch === "Float" && st === "Float");
});
const juniors = onDuty.filter(s => !isSeniorOnDate(s, ds));
const seniors = onDuty.filter(s => isSeniorOnDate(s, ds) && (s.branch === branch || s.branch === "Float"));
if (juniors.length > 0 && seniors.length === 0) {
result.push({ type: "danger", date: ds, branch, msg: `Supervision violation — Branch ${branch}`, desc: `${juniors.map(j => j.name).join(", ")} working without senior cover` });
}
if (onDuty.length === 0) {
result.push({ type: "warn", date: ds, branch, msg: `No doctor assigned — Branch ${branch}`, desc: `${dn} ${d} ${MONTH_NAMES[viewMonth]}` });
}
});
}
const pending = leaveLog.filter(l => l.status === "Pending");
pending.forEach(l => {
const s = staff.find(x => x.id === l.staffId);
result.push({ type: "info", date: l.startDate, branch: "-", msg: `Pending leave approval`, desc: `${s?.name} — ${l.leaveType} from ${l.startDate} to ${l.endDate}` });
});
return result;
}, [staff, leaveLog, viewYear, viewMonth]);

const dangerCount = alerts.filter(a => a.type === "danger").length;
const warnCount = alerts.filter(a => a.type === "warn").length;
const pendingCount = leaveLog.filter(l => l.status === "Pending").length;

return (
<>
<style>{css}</style>
<div className="app">
<Sidebar tab={tab} setTab={setTab} dangerCount={dangerCount} warnCount={warnCount} pendingCount={pendingCount} />
<div className="main">
<Topbar tab={tab} viewYear={viewYear} viewMonth={viewMonth}
setViewYear={setViewYear} setViewMonth={setViewMonth}
onAddLeave={() => { setEditLeave(null); setShowLeaveModal(true); }}
onAddStaff={() => setShowStaffModal(true)}
/>
<div className="content">
{tab === "dashboard" && <Dashboard alerts={alerts} staff={staff} leaveLog={leaveLog} viewYear={viewYear} viewMonth={viewMonth} />}
{tab === "schedule" && <Schedule staff={staff} leaveLog={leaveLog} viewYear={viewYear} viewMonth={viewMonth} />}
{tab === "branch-a" && <BranchView branch="A" staff={staff} leaveLog={leaveLog} viewYear={viewYear} viewMonth={viewMonth} />}
{tab === "branch-b" && <BranchView branch="B" staff={staff} leaveLog={leaveLog} viewYear={viewYear} viewMonth={viewMonth} />}
{tab === "leave" && <LeaveLog leaveLog={leaveLog} staff={staff} setLeaveLog={setLeaveLog} onAdd={() => { setEditLeave(null); setShowLeaveModal(true); }} onEdit={l => { setEditLeave(l); setShowLeaveModal(true); }} />}
{tab === "supervision" && <SupervisionCheck staff={staff} leaveLog={leaveLog} viewYear={viewYear} viewMonth={viewMonth} />}
{tab === "staffdb" && <StaffDB staff={staff} setStaff={setStaff} />}
{tab === "nurses" && <NurseAssignments staff={staff} leaveLog={leaveLog} viewYear={viewYear} viewMonth={viewMonth} />}
</div>
</div>
</div>
{showLeaveModal && <LeaveModal staff={staff} leaveLog={leaveLog} setLeaveLog={setLeaveLog} editLeave={editLeave} onClose={() => setShowLeaveModal(false)} />}
{showStaffModal && <StaffModal staff={staff} setStaff={setStaff} onClose={() => setShowStaffModal(false)} />}
</>
);
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, dangerCount, warnCount, pendingCount }) {
const nav = (id, label, icon, badge) => (
<div className={`nav-item${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
<span>{icon}</span> {label}
{badge > 0 && <span className={`badge${id === "leave" ? " warn" : ""}`}>{badge}</span>}
</div>
);
return (
<div className="sidebar">
<div className="sidebar-logo">
<h1>Clinic<br />Scheduler</h1>
<span>Branch A &amp; B</span>
</div>
<div className="sidebar-nav">
<div className="nav-section">Overview</div>
{nav("dashboard", "Dashboard", "◈", dangerCount + warnCount)}
{nav("schedule", "Monthly Schedule", "▦")}
<div className="nav-section">Branch Views</div>
{nav("branch-a", "Branch A", "⬡")}
{nav("branch-b", "Branch B", "⬡")}
<div className="nav-section">Management</div>
{nav("leave", "Leave Log", "◷", pendingCount)}
{nav("supervision", "MOH Compliance", "⬕", dangerCount)}
{nav("nurses", "Nurse Assignments", "⊕")}
<div className="nav-section">Admin</div>
{nav("staffdb", "Staff Database", "≡")}
</div>
</div>
);
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ tab, viewYear, viewMonth, setViewYear, setViewMonth, onAddLeave, onAddStaff }) {
const titles = { dashboard: "Dashboard", schedule: "Monthly Schedule", "branch-a": "Branch A — Daily View", "branch-b": "Branch B — Daily View", leave: "Leave Log", supervision: "MOH Supervision Compliance", staffdb: "Staff Database", nurses: "Nurse Assignments" };
function prevMonth() { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }
function nextMonth() { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }
const showMonthNav = ["schedule", "branch-a", "branch-b", "supervision", "nurses"].includes(tab);
return (
<div className="topbar">
<h2>{titles[tab] || tab}</h2>
{showMonthNav && (
<div className="month-nav">
<button onClick={prevMonth}>‹</button>
<span className="month-label">{MONTH_NAMES[viewMonth]} {viewYear}</span>
<button onClick={nextMonth}>›</button>
</div>
)}
<div className="topbar-actions">
{tab === "leave" && <button className="btn btn-primary" onClick={onAddLeave}>+ Add Leave</button>}
{tab === "staffdb" && <button className="btn btn-primary" onClick={onAddStaff}>+ Add Staff</button>}
</div>
</div>
);
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ alerts, staff, leaveLog, viewYear, viewMonth }) {
const activeStaff = staff.filter(s => s.active);
const doctors = activeStaff.filter(s => s.role === "Doctor");
const nurses = activeStaff.filter(s => s.role === "Nurse");
const thisMonthLeave = leaveLog.filter(l => l.startDate.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`));
const pending = leaveLog.filter(l => l.status === "Pending");
const dangerAlerts = alerts.filter(a => a.type === "danger");
const warnAlerts = alerts.filter(a => a.type === "warn");

// Upcoming leave (next 7 days from today)
const today = new Date();
const in7 = new Date(today); in7.setDate(today.getDate() + 7);
const upcoming = leaveLog.filter(l => {
const s = new Date(l.startDate);
return s >= today && s <= in7 && l.status === "Approved";
});

return (
<div>
<div className="stat-grid">
<div className="stat-card blue">
<div className="stat-label">Total Doctors</div>
<div className="stat-value">{doctors.length}</div>
<div className="stat-sub">{doctors.filter(d => d.seniority === "Senior").length} senior · {doctors.filter(d => d.seniority === "Junior").length} junior</div>
</div>
<div className="stat-card green">
<div className="stat-label">Total Nurses</div>
<div className="stat-value">{nurses.length}</div>
<div className="stat-sub">{nurses.filter(n => n.contract === "5-day").length} five-day · {nurses.filter(n => n.contract === "4-day").length} four-day</div>
</div>
<div className="stat-card orange">
<div className="stat-label">Leave This Month</div>
<div className="stat-value">{thisMonthLeave.length}</div>
<div className="stat-sub">{pending.length} pending approval</div>
</div>
<div className="stat-card red">
<div className="stat-label">Active Alerts</div>
<div className="stat-value">{dangerAlerts.length + warnAlerts.length}</div>
<div className="stat-sub">{dangerAlerts.length} critical · {warnAlerts.length} warnings</div>
</div>
</div>

<div className="two-col">
<div className="card">
<div className="card-header"><h3>Active Alerts</h3><span style={{ fontSize: 11, color: "var(--text3)" }}>{MONTH_NAMES[viewMonth]} {viewYear}</span></div>
<div className="card-body">
{alerts.length === 0 && <div className="empty-state">✓ No alerts this month</div>}
<div className="alert-list">
{alerts.slice(0, 8).map((a, i) => (
<div key={i} className={`alert-item ${a.type}`}>
<div className={`alert-dot ${a.type}`} />
<div><div className="alert-title">{a.msg}</div><div className="alert-desc">{a.desc}</div></div>
</div>
))}
</div>
</div>
</div>
<div className="card">
<div className="card-header"><h3>Upcoming Leave</h3><span style={{ fontSize: 11, color: "var(--text3)" }}>Next 7 days</span></div>
<div className="card-body">
{upcoming.length === 0 && <div className="empty-state">No upcoming leave in next 7 days</div>}
<div className="alert-list">
{upcoming.map((l, i) => {
const s = staff.find(x => x.id === l.staffId);
return (
<div key={i} className="alert-item info">
<div className="alert-dot info" />
<div>
<div className="alert-title">{s?.name}</div>
<div className="alert-desc">{l.leaveType} · {l.startDate} → {l.endDate}</div>
</div>
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

// ─── MONTHLY SCHEDULE ─────────────────────────────────────────────────────────
function Schedule({ staff, leaveLog, viewYear, viewMonth }) {
const days = getDaysInMonth(viewYear, viewMonth);
const activeStaff = staff.filter(s => s.active);
const doctors = activeStaff.filter(s => s.role === "Doctor");
const nurses = activeStaff.filter(s => s.role === "Nurse");
const allStaff = [...doctors, ...nurses];

const dayHeaders = [];
for (let d = 1; d <= days; d++) {
const dn = dayName(viewYear, viewMonth, d);
dayHeaders.push({ d, dn, isSun: dn === "Sun", isSat: dn === "Sat" });
}

return (
<div>
<div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
{[["BR-A","Branch A"], ["BR-B","Branch B"], ["AL","Annual Leave"], ["MC","Medical Leave"], ["OIL","Off-in-lieu"], ["Emergency","Emergency"], ["Maternity","Maternity"], ["OFF","Day Off"]].map(([k, label]) => (
<div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text2)" }}>
<div style={{ width: 10, height: 10, borderRadius: 2, background: statusStyle(k).background, border: `1px solid ${statusStyle(k).color}` }} />
{label}
</div>
))}
</div>
<div className="schedule-table-wrap">
<table className="schedule-table">
<thead>
<tr>
<th className="name-col">Staff</th>
{dayHeaders.map(({ d, dn, isSun, isSat }) => (
<th key={d} style={{ color: isSun ? "var(--danger)" : isSat ? "var(--warn)" : undefined }}>
<div>{dn}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{d}</div>
</th>
))}
</tr>
</thead>
<tbody>
{[{ label: "DOCTORS", items: doctors }, { label: "NURSES", items: nurses }].map(({ label, items }) => (
<>
<tr key={label}>
<td colSpan={days + 1} style={{ background: "var(--surface2)", color: "var(--text3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 14px" }}>{label}</td>
</tr>
{items.map(s => (
<tr key={s.id}>
<td className="name-cell">
{s.role === "Doctor" && (isSeniorOnDate(s, dateStr(viewYear, viewMonth, 1)) ? <span className="senior-badge" title="Senior" /> : <span className="junior-badge" title="Junior" />)}
{s.name.replace("Dr. ", "").replace("Nurse ", "")}
<span className="role-tag">{s.branch}</span>
</td>
{dayHeaders.map(({ d, dn }) => {
const ds = dateStr(viewYear, viewMonth, d);
const status = getStaffStatus(s, ds, leaveLog);
const st = statusStyle(status);
return (
<td key={d} style={{ background: st.background, color: st.color }}>
{status !== `BR-${s.branch}` && status !== "Float" ? <span className="status-chip" style={{ background: "transparent", color: st.color }}>{status === `BR-A` || status === `BR-B` ? status : status.slice(0, 3)}</span> : <span style={{ opacity: 0.6 }}>✓</span>}
</td>
);
})}
</tr>
))}
</>
))}
</tbody>
</table>
</div>
</div>
);
}

// ─── BRANCH VIEW ──────────────────────────────────────────────────────────────
function BranchView({ branch, staff, leaveLog, viewYear, viewMonth }) {
const days = getDaysInMonth(viewYear, viewMonth);
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

const dayData = [];
for (let d = 1; d <= days; d++) {
const ds = dateStr(viewYear, viewMonth, d);
const dn = dayName(viewYear, viewMonth, d);
if (dn === "Sun") continue;
const doctors = staff.filter(s => s.role === "Doctor" && s.active).filter(s => {
const st = getStaffStatus(s, ds, leaveLog);
return st === `BR-${branch}` || (s.branch === "Float" && st === "Float") || (s.branch === branch && !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st));
});
const nurses = staff.filter(s => s.role === "Nurse" && s.active).filter(s => {
const st = getStaffStatus(s, ds, leaveLog);
return st === `BR-${branch}` || (s.branch === "Float" && !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st)) || (s.branch === branch && !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st));
});
const juniors = doctors.filter(s => !isSeniorOnDate(s, ds));
const seniors = doctors.filter(s => isSeniorOnDate(s, ds));
const violation = juniors.length > 0 && seniors.length === 0;
dayData.push({ d, ds, dn, doctors, nurses, violation, isToday: ds === todayStr });
}

// Show next 14 working days
const shown = dayData.slice(0, 14);

return (
<div>
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
<div style={{ fontSize: 12, color: "var(--text2)" }}>Showing next 14 working days</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
{shown.map(({ d, ds, dn, doctors, nurses, violation, isToday }) => (
<div key={d} className="branch-day-card" style={isToday ? { border: "1px solid var(--accent)" } : {}}>
{violation && <div className="violation-banner">⚠ No senior doctor — supervision violation</div>}
<div className="branch-day-header">
<div>
<div className="date-badge">{d}</div>
<div className="day-name">{dn}, {MONTH_NAMES[viewMonth]}</div>
</div>
{isToday && <span style={{ marginLeft: "auto", background: "var(--accent)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>TODAY</span>}
</div>
<div style={{ marginBottom: 8 }}>
<div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 600 }}>Doctors ({doctors.length})</div>
{doctors.length === 0 && <div style={{ fontSize: 11, color: "var(--danger)" }}>⚠ None assigned</div>}
{doctors.map(s => (
<div key={s.id} className="branch-staff-row">
{isSeniorOnDate(s, ds) ? <span className="senior-badge" /> : <span className="junior-badge" />}
<span style={{ fontSize: 12 }}>{s.name}</span>
<span style={{ marginLeft: "auto", fontSize: 10, color: isSeniorOnDate(s, ds) ? "var(--accent2)" : "var(--warn)" }}>{isSeniorOnDate(s, ds) ? "Senior" : "Junior"}</span>
</div>
))}
</div>
<div>
<div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 600 }}>Nurses ({nurses.length})</div>
{nurses.length === 0 && <div style={{ fontSize: 11, color: "var(--warn)" }}>— None assigned</div>}
{nurses.map(s => (
<div key={s.id} className="branch-staff-row">
<span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent2)", display: "inline-block", marginRight: 4 }} />
<span style={{ fontSize: 12 }}>{s.name}</span>
</div>
))}
</div>
</div>
))}
</div>
</div>
);
}

// ─── LEAVE LOG ────────────────────────────────────────────────────────────────
function LeaveLog({ leaveLog, staff, setLeaveLog, onAdd, onEdit }) {
function approve(id) { setLeaveLog(l => l.map(x => x.id === id ? { ...x, status: "Approved", approvedBy: "Manager" } : x)); }
function reject(id) { setLeaveLog(l => l.map(x => x.id === id ? { ...x, status: "Rejected" } : x)); }
function remove(id) { setLeaveLog(l => l.filter(x => x.id !== id)); }
const sorted = [...leaveLog].sort((a, b) => b.startDate.localeCompare(a.startDate));
return (
<div>
<div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
{["All", "Approved", "Pending", "Rejected"].map(s => (
<span key={s} style={{ fontSize: 12, color: "var(--text2)", cursor: "pointer" }}>{s}</span>
))}
</div>
<div className="table-wrap">
<table className="data-table">
<thead>
<tr>
<th>Staff</th><th>Role</th><th>Leave Type</th><th>Start</th><th>End</th><th>Branch</th><th>Status</th><th>Actions</th>
</tr>
</thead>
<tbody>
{sorted.map(l => {
const s = staff.find(x => x.id === l.staffId);
return (
<tr key={l.id}>
<td style={{ fontWeight: 500 }}>{s?.name || l.staffId}</td>
<td style={{ color: "var(--text2)" }}>{s?.role}</td>
<td>
<span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${LEAVE_COLORS[l.leaveType]}22`, color: LEAVE_COLORS[l.leaveType] }}>{l.leaveType}</span>
</td>
<td style={{ color: "var(--text2)" }}>{l.startDate}</td>
<td style={{ color: "var(--text2)" }}>{l.endDate}</td>
<td style={{ color: "var(--text2)" }}>{s?.branch}</td>
<td><span className={`status-pill ${l.status}`}>{l.status}</span></td>
<td>
<div style={{ display: "flex", gap: 6 }}>
{l.status === "Pending" && <>
<button className="btn btn-success btn-sm" onClick={() => approve(l.id)}>Approve</button>
<button className="btn btn-danger btn-sm" onClick={() => reject(l.id)}>Reject</button>
</>}
<button className="btn btn-ghost btn-sm" onClick={() => onEdit(l)}>Edit</button>
<button className="btn btn-danger btn-sm" onClick={() => remove(l.id)}>✕</button>
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

// ─── SUPERVISION CHECK ────────────────────────────────────────────────────────
function SupervisionCheck({ staff, leaveLog, viewYear, viewMonth }) {
const days = getDaysInMonth(viewYear, viewMonth);
const branches = ["A", "B"];
return (
<div>
{branches.map(branch => {
const cells = [];
for (let d = 1; d <= days; d++) {
const ds = dateStr(viewYear, viewMonth, d);
const dn = dayName(viewYear, viewMonth, d);
const isSun = dn === "Sun";
if (isSun) { cells.push({ d, dn, status: "na", label: "—" }); continue; }
const doctors = staff.filter(s => s.role === "Doctor" && s.active);
const onDuty = doctors.filter(s => {
const st = getStaffStatus(s, ds, leaveLog);
return st === `BR-${branch}` || (s.branch === branch && !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st)) || (s.branch === "Float" && !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st));
});
const juniors = onDuty.filter(s => !isSeniorOnDate(s, ds));
const seniors = onDuty.filter(s => isSeniorOnDate(s, ds));
if (juniors.length === 0) { cells.push({ d, dn, status: "na", label: "N/A" }); continue; }
if (seniors.length > 0) { cells.push({ d, dn, status: "ok", label: "✓" }); continue; }
cells.push({ d, dn, status: "violation", label: "!" });
}
const violations = cells.filter(c => c.status === "violation").length;
const ok = cells.filter(c => c.status === "ok").length;
return (
<div key={branch} className="card" style={{ marginBottom: 20 }}>
<div className="card-header">
<h3>Branch {branch} — Supervision Compliance</h3>
<span style={{ fontSize: 11, color: violations > 0 ? "var(--danger)" : "var(--accent2)" }}>
{violations > 0 ? `⚠ ${violations} violation${violations > 1 ? "s" : ""}` : `✓ Fully compliant`}
</span>
</div>
<div className="card-body">
<div className="compliance-grid">
{cells.map((c, i) => (
<div key={i} className={`compliance-cell ${c.status}`}>
<span className="cell-date">{c.d}</span>
<span style={{ fontSize: 9, display: "block", opacity: 0.7 }}>{c.dn}</span>
{c.label}
</div>
))}
</div>
<div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 11, color: "var(--text2)" }}>
<span>✅ Compliant: {ok}</span>
<span>❌ Violation: {violations}</span>
<span>⚪ No junior: {cells.filter(c => c.status === "na").length}</span>
</div>
</div>
</div>
);
})}
</div>
);
}

// ─── NURSE ASSIGNMENTS ────────────────────────────────────────────────────────
function NurseAssignments({ staff, leaveLog, viewYear, viewMonth }) {
const days = getDaysInMonth(viewYear, viewMonth);
const [branch, setBranch] = useState("A");
const rows = [];
for (let d = 1; d <= days; d++) {
const ds = dateStr(viewYear, viewMonth, d);
const dn = dayName(viewYear, viewMonth, d);
if (dn === "Sun") continue;
const branchDoctors = staff.filter(s => s.role === "Doctor" && s.active && (s.branch === branch || s.branch === "Float")).filter(s => {
const st = getStaffStatus(s, ds, leaveLog);
return !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st);
});
const branchNurses = staff.filter(s => s.role === "Nurse" && s.active && (s.branch === branch || s.branch === "Float")).filter(s => {
const st = getStaffStatus(s, ds, leaveLog);
return !["AL","MC","OIL","Emergency","Maternity","OFF"].includes(st);
});
rows.push({ d, ds, dn, doctors: branchDoctors, nurses: branchNurses });
}
return (
<div>
<div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
<div className="branch-toggle">
<button className={branch === "A" ? "active" : ""} onClick={() => setBranch("A")}>Branch A</button>
<button className={branch === "B" ? "active" : ""} onClick={() => setBranch("B")}>Branch B</button>
</div>
<span style={{ fontSize: 11, color: "var(--text2)" }}>Showing confirmed assignments based on approved leave</span>
</div>
<div className="table-wrap">
<table className="data-table">
<thead>
<tr><th>Date</th><th>Day</th><th>Doctors On Duty</th><th>Nurses Available</th><th>Coverage</th></tr>
</thead>
<tbody>
{rows.map(({ d, ds, dn, doctors, nurses }) => {
const ok = nurses.length >= doctors.length;
return (
<tr key={d}>
<td style={{ fontWeight: 600 }}>{d} {MONTH_NAMES[viewMonth].slice(0,3)}</td>
<td style={{ color: "var(--text2)" }}>{dn}</td>
<td>
{doctors.length === 0 ? <span style={{ color: "var(--danger)", fontSize: 11 }}>None</span> :
doctors.map(s => <div key={s.id} style={{ fontSize: 11 }}>{isSeniorOnDate(s, ds) ? "🔵" : "🟡"} {s.name}</div>)}
</td>
<td>
{nurses.length === 0 ? <span style={{ color: "var(--danger)", fontSize: 11 }}>None available</span> :
nurses.map(s => <div key={s.id} style={{ fontSize: 11 }}>● {s.name} <span style={{ color: "var(--text3)" }}>({s.contract})</span></div>)}
</td>
<td>
<span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: ok ? "rgba(56,217,169,0.12)" : "rgba(255,107,107,0.12)", color: ok ? "var(--accent2)" : "var(--danger)" }}>
{nurses.length}/{doctors.length}
</span>
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

// ─── STAFF DATABASE ───────────────────────────────────────────────────────────
function StaffDB({ staff, setStaff }) {
function toggleActive(id) { setStaff(s => s.map(x => x.id === id ? { ...x, active: !x.active } : x)); }
return (
<div>
<div className="staff-grid">
{staff.map(s => {
const initials = s.name.replace("Dr. ","").replace("Nurse ","").split(" ").map(w => w[0]).slice(0,2).join("");
return (
<div key={s.id} className="staff-card" style={{ opacity: s.active ? 1 : 0.5 }}>
<div className="staff-card-header">
<div className={`staff-avatar ${s.role.toLowerCase()}`}>{initials}</div>
<div>
<div className="staff-card-name">{s.name}</div>
<div className="staff-card-id">{s.id} · {s.branch === "Float" ? "Float" : `Branch ${s.branch}`}</div>
</div>
<button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => toggleActive(s.id)}>
{s.active ? "Deactivate" : "Activate"}
</button>
</div>
<div className="staff-meta">
<div className="staff-meta-item"><span>Contract</span>{s.contract}</div>
<div className="staff-meta-item"><span>Off Days</span>{s.offDays.join(", ")}</div>
{s.role === "Doctor" && <>
<div className="staff-meta-item"><span>Seniority</span>
<span style={{ color: isSeniorOnDate(s, new Date().toISOString().slice(0,10)) ? "var(--accent2)" : "var(--warn)" }}>
{isSeniorOnDate(s, new Date().toISOString().slice(0,10)) ? "Senior" : "Junior"}
</span>
</div>
<div className="staff-meta-item"><span>SDC/SMC Reg.</span>{s.regDate}</div>
</>}
</div>
</div>
);
})}
</div>
</div>
);
}

// ─── LEAVE MODAL ──────────────────────────────────────────────────────────────
function LeaveModal({ staff, leaveLog, setLeaveLog, editLeave, onClose }) {
const [form, setForm] = useState(editLeave || { staffId: "", leaveType: "AL", startDate: "", endDate: "", status: "Pending", approvedBy: "" });
function save() {
if (!form.staffId || !form.startDate || !form.endDate) return;
if (editLeave) {
setLeaveLog(l => l.map(x => x.id === editLeave.id ? { ...x, ...form } : x));
} else {
const id = "LV" + String(leaveLog.length + 1).padStart(3, "0");
setLeaveLog(l => [...l, { ...form, id }]);
}
onClose();
}
return (
<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
<div className="modal">
<h3>{editLeave ? "Edit Leave" : "Add Leave Application"}</h3>
<div className="form-group">
<label className="form-label">Staff Member</label>
<select className="form-select" value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}>
<option value="">Select staff...</option>
{staff.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>
</div>
<div className="form-group">
<label className="form-label">Leave Type</label>
<select className="form-select" value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}>
{LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
</select>
</div>
<div className="form-row">
<div className="form-group">
<label className="form-label">Start Date</label>
<input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
</div>
<div className="form-group">
<label className="form-label">End Date</label>
<input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
</div>
</div>
<div className="form-group">
<label className="form-label">Status</label>
<select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
<option>Pending</option><option>Approved</option><option>Rejected</option>
</select>
</div>
<div className="modal-actions">
<button className="btn btn-ghost" onClick={onClose}>Cancel</button>
<button className="btn btn-primary" onClick={save}>Save</button>
</div>
</div>
</div>
);
}

// ─── STAFF MODAL ──────────────────────────────────────────────────────────────
function StaffModal({ staff, setStaff, onClose }) {
const [form, setForm] = useState({ name: "", role: "Doctor", branch: "A", contract: "5-day", offDays: ["Sunday"], seniority: "Senior", regDate: "", active: true });
function save() {
if (!form.name) return;
if (form.role === "Doctor" && !form.regDate) return;
const role = form.role === "Doctor" ? "DR" : "NR";
const count = staff.filter(s => s.role === form.role).length + 1;
const id = `${role}${String(count).padStart(2, "0")}`;
setStaff(s => [...s, { ...form, id }]);
onClose();
}
return (
<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
<div className="modal">
<h3>Add Staff Member</h3>
<div className="form-group">
<label className="form-label">Full Name</label>
<input className="form-input" placeholder="e.g. Dr. Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
</div>
<div className="form-row">
<div className="form-group">
<label className="form-label">Role</label>
<select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
<option>Doctor</option><option>Nurse</option>
</select>
</div>
<div className="form-group">
<label className="form-label">Primary Branch</label>
<select className="form-select" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}>
<option value="A">Branch A</option><option value="B">Branch B</option><option value="Float">Float</option>
</select>
</div>
</div>
<div className="form-row">
<div className="form-group">
<label className="form-label">Contract</label>
<select className="form-select" value={form.contract} onChange={e => setForm(f => ({ ...f, contract: e.target.value }))}>
<option value="5-day">5-day week</option><option value="4-day">4-day week</option>
</select>
</div>
{form.role === "Doctor" && (
<div className="form-group">
<label className="form-label">Seniority</label>
<select className="form-select" value={form.seniority} onChange={e => setForm(f => ({ ...f, seniority: e.target.value }))}>
<option>Senior</option><option>Junior</option>
</select>
</div>
)}
</div>
{form.role === "Doctor" && (
<div className="form-group">
<label className="form-label">SDC/SMC Registration Date</label>
<input type="date" className="form-input" value={form.regDate} onChange={e => setForm(f => ({ ...f, regDate: e.target.value }))} />
<div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Date of professional licensure — used to calculate junior/senior status (2-year threshold)</div>
</div>
)}
<div className="modal-actions">
<button className="btn btn-ghost" onClick={onClose}>Cancel</button>
<button className="btn btn-primary" onClick={save}>Add Staff</button>
</div>
</div>
</div>
);
}

