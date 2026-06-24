import { useState, useEffect, useRef } from "react";

// ─── Auth Context ─────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { id: 1, email: "alex@demo.com", password: "demo123", name: "Alex Chen", avatar: "AC" },
  { id: 2, email: "sam@demo.com",  password: "demo123", name: "Sam Rivera", avatar: "SR" },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES   = ["To Do", "In Progress", "Review", "Done"];
const COLORS = {
  priority: { Low: "#6ee7b7", Medium: "#fbbf24", High: "#f97316", Critical: "#ef4444" },
  status:   { "To Do": "#94a3b8", "In Progress": "#60a5fa", Review: "#a78bfa", Done: "#34d399" },
};

const SAMPLE_TASKS = [
  { id: uid(), title: "Set up project repository", description: "Initialize Git repo, add .gitignore and README.", status: "Done",        priority: "High",     due: "2026-06-10", assignee: 1, created: "2026-06-01" },
  { id: uid(), title: "Design database schema",    description: "ERD for users, tasks, and projects tables.",  status: "Done",        priority: "High",     due: "2026-06-12", assignee: 1, created: "2026-06-02" },
  { id: uid(), title: "Build REST API endpoints",  description: "CRUD for /tasks and /users with JWT auth.",   status: "In Progress", priority: "Critical", due: "2026-06-25", assignee: 2, created: "2026-06-05" },
  { id: uid(), title: "Implement authentication",  description: "Login, register, JWT refresh tokens.",        status: "Review",      priority: "High",     due: "2026-06-24", assignee: 1, created: "2026-06-07" },
  { id: uid(), title: "Responsive UI components",  description: "Task cards, modals, forms for mobile & web.", status: "In Progress", priority: "Medium",   due: "2026-06-28", assignee: 2, created: "2026-06-10" },
  { id: uid(), title: "WebSocket integration",     description: "Real-time task updates via Socket.io.",       status: "To Do",       priority: "Medium",   due: "2026-07-02", assignee: 2, created: "2026-06-12" },
  { id: uid(), title: "Write unit tests",          description: "Cover API routes and React components.",      status: "To Do",       priority: "Low",      due: "2026-07-05", assignee: 1, created: "2026-06-14" },
  { id: uid(), title: "Deploy to production",      description: "Dockerize app and push to cloud provider.",   status: "To Do",       priority: "High",     due: "2026-07-08", assignee: 1, created: "2026-06-15" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:       #0f1117;
  --bg2:      #161b27;
  --bg3:      #1e2537;
  --border:   #2a3347;
  --text:     #e2e8f0;
  --muted:    #64748b;
  --accent:   #6366f1;
  --accent2:  #818cf8;
  --danger:   #ef4444;
  --success:  #34d399;
  --radius:   10px;
  --shadow:   0 4px 24px rgba(0,0,0,.4);
}
body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

/* ── Auth Screen ── */
.auth-wrap { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
.auth-card { background:var(--bg2); border:1px solid var(--border); border-radius:16px; padding:40px; width:100%; max-width:400px; box-shadow:var(--shadow); }
.auth-logo { display:flex; align-items:center; gap:10px; margin-bottom:32px; }
.auth-logo-icon { width:36px;height:36px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px; }
.auth-logo h1 { font-size:20px; font-weight:700; }
.auth-tabs { display:flex; gap:4px; background:var(--bg3); border-radius:8px; padding:4px; margin-bottom:28px; }
.auth-tab { flex:1;padding:8px;border:none;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;transition:.2s;background:transparent;color:var(--muted); }
.auth-tab.active { background:var(--accent);color:#fff; }
.field { margin-bottom:18px; }
.field label { display:block;font-size:13px;font-weight:500;color:var(--muted);margin-bottom:6px; }
.field input { width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:14px;outline:none;transition:.2s; }
.field input:focus { border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.15); }
.btn { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 20px;border:none;border-radius:var(--radius);cursor:pointer;font-size:14px;font-weight:600;transition:.2s; }
.btn-primary { background:var(--accent);color:#fff; }
.btn-primary:hover { background:var(--accent2); }
.btn-ghost { background:transparent;color:var(--muted);border:1px solid var(--border); }
.btn-ghost:hover { background:var(--bg3);color:var(--text); }
.btn-danger { background:var(--danger);color:#fff; }
.btn-full { width:100%; }
.error-msg { background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:var(--danger);padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:16px; }
.demo-hint { text-align:center;margin-top:16px;font-size:13px;color:var(--muted); }
.demo-hint span { color:var(--accent);cursor:pointer; }

/* ── App Shell ── */
.shell { display:grid; grid-template-columns:240px 1fr; min-height:100vh; }
@media(max-width:768px){ .shell{grid-template-columns:1fr;} .sidebar{display:none;} }

/* ── Sidebar ── */
.sidebar { background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:20px 0; }
.sidebar-logo { display:flex;align-items:center;gap:10px;padding:0 20px 24px; }
.sidebar-logo-icon { width:32px;height:32px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px; }
.sidebar-logo span { font-size:17px;font-weight:700; }
.nav-label { font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;padding:0 20px;margin-bottom:8px; }
.nav-item { display:flex;align-items:center;gap:12px;padding:10px 20px;cursor:pointer;transition:.15s;font-size:14px;font-weight:500;color:var(--muted);border-left:3px solid transparent; }
.nav-item:hover { background:var(--bg3);color:var(--text); }
.nav-item.active { background:rgba(99,102,241,.12);color:var(--accent2);border-left-color:var(--accent); }
.sidebar-footer { margin-top:auto;padding:20px; }
.user-chip { display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg3);border-radius:var(--radius); }
.avatar { width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0; }

/* ── Main ── */
.main { display:flex;flex-direction:column;overflow:hidden; }
.topbar { display:flex;align-items:center;gap:12px;padding:16px 24px;border-bottom:1px solid var(--border);background:var(--bg2); }
.topbar h2 { font-size:18px;font-weight:700;flex:1; }
.search-box { display:flex;align-items:center;gap:8px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 12px;flex:1;max-width:320px; }
.search-box input { background:transparent;border:none;outline:none;font-size:14px;color:var(--text);width:100%; }
.content { flex:1;overflow-y:auto;padding:24px; }

/* ── Stats ── */
.stats-row { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px; }
@media(max-width:900px){ .stats-row{grid-template-columns:repeat(2,1fr);} }
.stat-card { background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px; }
.stat-label { font-size:12px;color:var(--muted);font-weight:500;margin-bottom:6px; }
.stat-val { font-size:28px;font-weight:700; }
.stat-sub { font-size:12px;color:var(--muted);margin-top:4px; }

/* ── Filters ── */
.filters { display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;align-items:center; }
.filter-select { background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:7px 12px;border-radius:8px;font-size:13px;cursor:pointer;outline:none; }
.filter-select:focus { border-color:var(--accent); }
.view-toggle { display:flex;gap:4px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:4px;margin-left:auto; }
.view-btn { padding:6px 12px;border:none;border-radius:6px;cursor:pointer;font-size:13px;background:transparent;color:var(--muted);transition:.15s; }
.view-btn.active { background:var(--accent);color:#fff; }

/* ── Task Grid / List ── */
.task-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px; }
.task-list { display:flex;flex-direction:column;gap:10px; }
.task-card { background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:.2s;position:relative;overflow:hidden; }
.task-card::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px; }
.task-card:hover { border-color:var(--accent);transform:translateY(-1px);box-shadow:var(--shadow); }
.task-card-list { flex-direction:row;align-items:center;gap:16px;padding:12px 16px; }
.task-card-list .task-title { margin-bottom:0; }
.task-title { font-size:14px;font-weight:600;margin-bottom:6px;line-height:1.4; }
.task-desc { font-size:13px;color:var(--muted);margin-bottom:12px;line-height:1.5; }
.task-meta { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.badge { display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.02em; }
.task-due { font-size:12px;color:var(--muted);margin-left:auto; }
.task-due.overdue { color:var(--danger); }

/* ── Kanban ── */
.kanban { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:start; }
@media(max-width:900px){ .kanban{grid-template-columns:repeat(2,1fr);} }
.kanban-col { background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden; }
.kanban-header { padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between; }
.kanban-header h3 { font-size:13px;font-weight:600; }
.kanban-count { background:var(--bg3);border-radius:20px;padding:2px 8px;font-size:12px;color:var(--muted); }
.kanban-body { padding:12px;display:flex;flex-direction:column;gap:10px;min-height:80px; }
.kanban-card { background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;transition:.2s; }
.kanban-card:hover { border-color:var(--accent); }

/* ── Modal ── */
.overlay { position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px; }
.modal { background:var(--bg2);border:1px solid var(--border);border-radius:16px;width:100%;max-width:520px;box-shadow:var(--shadow);max-height:90vh;overflow-y:auto; }
.modal-header { display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border); }
.modal-header h3 { font-size:17px;font-weight:700; }
.close-btn { background:var(--bg3);border:1px solid var(--border);color:var(--muted);width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px; }
.modal-body { padding:24px; }
.modal-body .field { margin-bottom:20px; }
.modal-body textarea { width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:14px;outline:none;resize:vertical;min-height:80px;font-family:inherit; }
.modal-body textarea:focus { border-color:var(--accent); }
.modal-body select { width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);color:var(--text);font-size:14px;outline:none; }
.modal-footer { padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end; }
.task-detail-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px; }
.detail-row { margin-bottom:14px; }
.detail-row label { font-size:12px;color:var(--muted);font-weight:500;display:block;margin-bottom:4px; }
.detail-row p { font-size:14px; }

/* ── Empty ── */
.empty { text-align:center;padding:60px 20px;color:var(--muted); }
.empty-icon { font-size:40px;margin-bottom:12px; }
.empty h3 { font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width:6px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--border);border-radius:3px; }
`;

// ─── Components ───────────────────────────────────────────────────────────────
function PriorityDot({ p }) {
  return <span style={{ width:8,height:8,borderRadius:"50%",background:COLORS.priority[p],display:"inline-block" }} />;
}

function StatusBadge({ s }) {
  return (
    <span className="badge" style={{ background: COLORS.status[s]+"22", color: COLORS.status[s] }}>
      {s}
    </span>
  );
}

function TaskCard({ task, users, onClick, list }) {
  const assignee = users.find(u => u.id === task.assignee);
  const isOverdue = task.due && new Date(task.due) < new Date() && task.status !== "Done";
  return (
    <div
      className={`task-card ${list ? "task-card-list" : ""}`}
      style={{ "--card-color": COLORS.priority[task.priority] }}
      onClick={() => onClick(task)}
    >
      <style>{`.task-card::before { background: ${COLORS.priority[task.priority]}; }`}</style>
      <div style={{ flex:1 }}>
        <div className="task-title">{task.title}</div>
        {!list && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          <PriorityDot p={task.priority} />
          <span style={{ fontSize:12,color:COLORS.priority[task.priority],fontWeight:600 }}>{task.priority}</span>
          <StatusBadge s={task.status} />
          {assignee && (
            <span className="avatar" style={{ width:20,height:20,fontSize:9 }}>{assignee.avatar}</span>
          )}
          {task.due && (
            <span className={`task-due ${isOverdue ? "overdue" : ""}`}>
              {isOverdue ? "⚠ " : ""}{fmtDate(task.due)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab]  = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [err, setErr]   = useState("");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    setErr("");
    if (tab === "login") {
      const u = DEMO_USERS.find(u => u.email === form.email && u.password === form.password);
      if (!u) { setErr("Invalid email or password."); return; }
      onLogin(u);
    } else {
      if (!form.name || !form.email || !form.password)  { setErr("All fields required."); return; }
      const initials = form.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
      onLogin({ id: uid(), email: form.email, name: form.name, avatar: initials });
    }
  };

  const quickLogin = () => { setForm({ name:"", email:"alex@demo.com", password:"demo123" }); };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <h1>TaskFlow</h1>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab==="login"?"active":""}`} onClick={()=>{setTab("login");setErr("");}}>Sign in</button>
          <button className={`auth-tab ${tab==="register"?"active":""}`} onClick={()=>{setTab("register");setErr("");}}>Register</button>
        </div>
        {err && <div className="error-msg">{err}</div>}
        {tab === "register" && (
          <div className="field">
            <label>Full name</label>
            <input placeholder="Your name" value={form.name} onChange={set("name")} />
          </div>
        )}
        <div className="field">
          <label>Email address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={e=>e.key==="Enter"&&submit()} />
        </div>
        <button className="btn btn-primary btn-full" onClick={submit}>
          {tab === "login" ? "Sign in →" : "Create account →"}
        </button>
        <div className="demo-hint">
          Quick demo? <span onClick={quickLogin}>Fill demo credentials</span>
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({ task, users, onSave, onDelete, onClose, currentUser }) {
  const blank = { title:"", description:"", status:"To Do", priority:"Medium", due:"", assignee: currentUser.id };
  const [form, setForm] = useState(task ? { ...task } : blank);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const isNew = !task;

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isNew ? "New task" : "Task details"}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Title</label>
            <input value={form.title} onChange={set("title")} placeholder="What needs to be done?" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Add more context…" />
          </div>
          <div className="task-detail-grid">
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={set("status")}>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select value={form.priority} onChange={set("priority")}>
                {PRIORITIES.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Due date</label>
              <input type="date" value={form.due} onChange={set("due")} style={{colorScheme:"dark"}} />
            </div>
            <div className="field">
              <label>Assignee</label>
              <select value={form.assignee} onChange={e=>setForm(f=>({...f,assignee:Number(e.target.value)}))}>
                {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {!isNew && <button className="btn btn-danger" onClick={()=>onDelete(task.id)}>Delete</button>}
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>form.title&&onSave({...form, id:task?.id||uid(), created:task?.created||new Date().toISOString()})}>
            {isNew ? "Create task" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]     = useState(null);
  const [tasks, setTasks]   = useState(SAMPLE_TASKS);
  const [users]             = useState(DEMO_USERS);
  const [view, setView]     = useState("board");    // board | grid | list
  const [page, setPage]     = useState("tasks");    // tasks | my
  const [modal, setModal]   = useState(null);       // null | "new" | task object
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus]   = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const allUsers = [...users, ...(user && !users.find(u=>u.id===user.id) ? [user] : [])];

  const filtered = tasks.filter(t => {
    if (page === "my" && t.assignee !== user?.id) return false;
    if (filterStatus   !== "All" && t.status   !== filterStatus)   return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    done:  tasks.filter(t=>t.status==="Done").length,
    inProgress: tasks.filter(t=>t.status==="In Progress").length,
    overdue: tasks.filter(t=>t.due&&new Date(t.due)<new Date()&&t.status!=="Done").length,
  };

  const saveTask = (t) => {
    setTasks(ts => ts.find(x=>x.id===t.id) ? ts.map(x=>x.id===t.id?t:x) : [...ts, t]);
    setModal(null);
  };
  const deleteTask = (id) => { setTasks(ts=>ts.filter(t=>t.id!==id)); setModal(null); };

  if (!user) return (
    <>
      <style>{CSS}</style>
      <AuthScreen onLogin={setUser} />
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" style={{fontSize:18}}>✦</div>
            <span>TaskFlow</span>
          </div>
          <div className="nav-label">Workspace</div>
          {[
            { id:"tasks", icon:"⊞", label:"All Tasks" },
            { id:"my",    icon:"◎", label:"My Tasks"  },
          ].map(n=>(
            <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
              <span>{n.icon}</span>{n.label}
            </div>
          ))}
          <div style={{margin:"20px 0 8px"}} className="nav-label">Overview</div>
          {STATUSES.map(s=>(
            <div key={s} className="nav-item" style={{fontSize:13}} onClick={()=>{setFilterStatus(s);setPage("tasks");}}>
              <span className="badge" style={{background:COLORS.status[s]+"33",color:COLORS.status[s],padding:"2px 6px"}}>{tasks.filter(t=>t.status===s).length}</span>
              {s}
            </div>
          ))}
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="avatar">{user.avatar}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
                <div style={{fontSize:11,color:"var(--muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.email}</div>
              </div>
              <button className="btn btn-ghost" style={{padding:"4px 8px",fontSize:12}} onClick={()=>setUser(null)}>Out</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <h2>{page==="my" ? "My Tasks" : "All Tasks"}</h2>
            <div className="search-box">
              <span style={{color:"var(--muted)"}}>⌕</span>
              <input placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={()=>setModal("new")}>+ New task</button>
          </div>

          <div className="content">
            {/* Stats */}
            <div className="stats-row">
              {[
                { label:"Total tasks",   val:stats.total,      sub:"across all projects", color:"#6366f1" },
                { label:"Completed",     val:stats.done,       sub:`${Math.round(stats.done/stats.total*100)||0}% done`, color:"#34d399" },
                { label:"In progress",   val:stats.inProgress, sub:"actively being worked", color:"#60a5fa" },
                { label:"Overdue",       val:stats.overdue,    sub:"need attention", color:"#ef4444" },
              ].map(s=>(
                <div className="stat-card" key={s.label} style={{borderTop:`3px solid ${s.color}`}}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-val" style={{color:s.color}}>{s.val}</div>
                  <div className="stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="filters">
              <select className="filter-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option>All</option>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
              <select className="filter-select" value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
                <option>All</option>
                {PRIORITIES.map(p=><option key={p}>{p}</option>)}
              </select>
              {(filterStatus!=="All"||filterPriority!=="All"||search) && (
                <button className="btn btn-ghost" style={{fontSize:12,padding:"6px 12px"}}
                  onClick={()=>{setFilterStatus("All");setFilterPriority("All");setSearch("");}}>
                  Clear filters
                </button>
              )}
              <div className="view-toggle">
                {[["board","⬛"],["grid","⊞"],["list","☰"]].map(([v,icon])=>(
                  <button key={v} className={`view-btn ${view===v?"active":""}`} onClick={()=>setView(v)}>{icon}</button>
                ))}
              </div>
            </div>

            {/* Task Views */}
            {filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📭</div>
                <h3>No tasks found</h3>
                <p>Try adjusting filters or create a new task.</p>
              </div>
            ) : view === "board" ? (
              <div className="kanban">
                {STATUSES.map(status => {
                  const col = filtered.filter(t=>t.status===status);
                  return (
                    <div className="kanban-col" key={status}>
                      <div className="kanban-header">
                        <h3 style={{color:COLORS.status[status]}}>{status}</h3>
                        <span className="kanban-count">{col.length}</span>
                      </div>
                      <div className="kanban-body">
                        {col.map(t=>(
                          <div className="kanban-card" key={t.id} onClick={()=>setModal(t)}>
                            <div style={{fontSize:13,fontWeight:600,marginBottom:8,lineHeight:1.4}}>{t.title}</div>
                            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                              <PriorityDot p={t.priority} />
                              <span style={{fontSize:11,color:COLORS.priority[t.priority],fontWeight:600}}>{t.priority}</span>
                              {t.due && <span style={{fontSize:11,color:"var(--muted)",marginLeft:"auto"}}>{fmtDate(t.due)}</span>}
                            </div>
                          </div>
                        ))}
                        <button className="btn btn-ghost" style={{width:"100%",fontSize:12,marginTop:4}}
                          onClick={()=>setModal("new")}>+ Add task</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : view === "grid" ? (
              <div className="task-grid">
                {filtered.map(t=><TaskCard key={t.id} task={t} users={allUsers} onClick={setModal} />)}
              </div>
            ) : (
              <div className="task-list">
                {filtered.map(t=><TaskCard key={t.id} task={t} users={allUsers} onClick={setModal} list />)}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <TaskModal
          task={modal === "new" ? null : modal}
          users={allUsers}
          currentUser={user}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={()=>setModal(null)}
        />
      )}
    </>
  );
}
