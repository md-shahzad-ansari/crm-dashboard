import { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, FunnelChart, Funnel, LabelList
} from "recharts";
import {
  LayoutDashboard, Users, BookUser, Briefcase, CheckSquare,
  BarChart2, Settings, Bell, Search, ChevronDown, TrendingUp,
  TrendingDown, Plus, Star, Phone, Mail, Calendar, Tag,
  ArrowRight, MoreHorizontal, Filter, SortAsc, Moon, Sun,
  X, Check, Clock, AlertCircle, ChevronRight, Layers,
  List, Eye, Edit2, Trash2, FileText, Award, Target,
  PieChart as PieIcon, Activity
} from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────
const REPS = ["Rahul Sharma","Priya Patel","Amit Verma","Sneha Singh","Vikram Joshi"];
const COMPANIES = ["TechCorp","Infosys","Wipro","HCL","TCS","Reliance","HDFC","Bajaj","Mahindra","Tata"];
const SOURCES = ["Organic","Referral","Paid Ads","Cold Outreach","Social"];
const STATUSES = ["New","Contacted","Qualified","Proposal","Negotiation","Won","Lost"];
const STAGES = ["New Lead","Contacted","Proposal","Negotiation","Won","Lost"];
const PRIORITIES = ["High","Medium","Low"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randN(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }
function daysAgo(n) { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0]; }

const leads = Array.from({length:28},(_,i)=>({
  id:i+1, name:["Arjun Kumar","Meera Nair","Suresh Pillai","Ananya Roy","Dev Kapoor","Ritu Bose","Kiran Rao","Pooja Sharma","Nikhil Das","Tanvi Mehta","Rohit Gupta","Sanya Agarwal","Harish Chand","Divya Nair","Manoj Tiwari","Priyanka Sen","Varun Shah","Neha Joshi","Aditya Kumar","Sonia Verma","Rajesh Patil","Kavya Reddy","Sandeep Rao","Deepa Mishra","Vivek Sinha","Anita Bhat","Gaurav Jain","Rekha Nambiar"][i],
  company: rand(COMPANIES), email:`user${i+1}@${rand(COMPANIES).toLowerCase()}.com`,
  phone:`+91-9${randN(100,999)}-${randN(100,999)}-${randN(1000,9999)}`,
  source: rand(SOURCES), status: rand(STATUSES), assignedTo: rand(REPS),
  createdDate: daysAgo(randN(1,60)), notes:"Follow up on product demo requirements.",
  value: randN(50000,500000), tags:["Enterprise","Hot","SaaS"].slice(0,randN(1,3))
}));

const contacts = leads.map((l,i)=>({...l, id:i+100, role:rand(["CTO","CEO","VP Sales","Manager","Director","CFO"]), lastContacted: daysAgo(randN(1,30))}));

const deals = STAGES.flatMap((stage,si)=>
  Array.from({length:randN(2,5)},(_,i)=>({
    id:`D${si*10+i}`, title:`${rand(["Platform","Analytics","Cloud","Security","Mobile"])} Deal`,
    client: rand(COMPANIES), value: randN(100000,2000000), probability: [20,35,55,75,95,5][si],
    stage, owner: rand(REPS), closeDate: daysAgo(-randN(10,60)),
    notes:"Strategic account. Needs executive approval.", contact: rand(COMPANIES)+" Contact"
  }))
);

const tasks = Array.from({length:18},(_,i)=>({
  id:i+1, title:["Follow up with client","Prepare proposal","Send contract","Schedule demo","Update CRM","Review pipeline","Team standup","Client onboarding","Send invoice","Product walkthrough","Competitive analysis","Close deal","Legal review","Technical assessment","Budget approval","POC setup","Executive meeting","ROI presentation"][i],
  dueDate: daysAgo(-randN(0,14)), priority: rand(PRIORITIES), status: rand(["Pending","Done","Overdue"]),
  linkedTo: rand([...leads.slice(0,5)].map(l=>l.name)), type: rand(["Call","Meeting","Email","Task"])
}));

const monthlyRevenue = [
  {month:"Nov",revenue:820000,target:900000}, {month:"Dec",revenue:1050000,target:950000},
  {month:"Jan",revenue:780000,target:850000}, {month:"Feb",revenue:1200000,target:1000000},
  {month:"Mar",revenue:950000,target:1000000}, {month:"Apr",revenue:1380000,target:1200000},
];

const sourceData = [
  {name:"Organic",value:32,color:"#3B82F6"},{name:"Referral",value:24,color:"#10B981"},
  {name:"Paid Ads",value:20,color:"#F59E0B"},{name:"Cold Outreach",value:15,color:"#8B5CF6"},
  {name:"Social",value:9,color:"#EC4899"}
];

const funnelData = [
  {name:"Leads",value:280,fill:"#3B82F6"},{name:"Qualified",value:180,fill:"#6366F1"},
  {name:"Proposal",value:95,fill:"#8B5CF6"},{name:"Negotiation",value:52,fill:"#A855F7"},
  {name:"Won",value:34,fill:"#10B981"}
];

const repPerformance = REPS.map(name=>({
  name, deals:randN(8,24), revenue:randN(500000,3000000), winRate:randN(45,85)
})).sort((a,b)=>b.revenue-a.revenue);

const activities = [
  {id:1,text:"Call with Arjun Kumar",time:"2m ago",type:"call",color:"#3B82F6"},
  {id:2,text:"Deal closed — ₹2.4L",time:"15m ago",type:"deal",color:"#10B981"},
  {id:3,text:"New lead: Meera Nair",time:"1h ago",type:"lead",color:"#F59E0B"},
  {id:4,text:"Proposal sent to TechCorp",time:"2h ago",type:"email",color:"#8B5CF6"},
  {id:5,text:"Meeting with Wipro team",time:"3h ago",type:"meeting",color:"#EC4899"},
  {id:6,text:"Contract signed — Infosys",time:"5h ago",type:"deal",color:"#10B981"},
  {id:7,text:"Follow-up: Suresh Pillai",time:"6h ago",type:"call",color:"#3B82F6"},
  {id:8,text:"Demo scheduled — HCL",time:"Yesterday",type:"meeting",color:"#EC4899"},
];

// ─── THEME ───────────────────────────────────────────────────
const LIGHT = {
  sidebar:"#0F172A", sidebarText:"#94A3B8", sidebarActive:"#3B82F6",
  bg:"#F8FAFC", card:"#FFFFFF", border:"#E2E8F0", text:"#0F172A",
  muted:"#64748B", accent:"#3B82F6", surface:"#F1F5F9", shadow:"0 1px 3px rgba(0,0,0,0.08)"
};
const DARK = {
  sidebar:"#060B14", sidebarText:"#64748B", sidebarActive:"#3B82F6",
  bg:"#0F172A", card:"#1E293B", border:"#334155", text:"#F1F5F9",
  muted:"#64748B", accent:"#3B82F6", surface:"#1E293B", shadow:"0 1px 3px rgba(0,0,0,0.3)"
};

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

// ─── COMPONENTS ───────────────────────────────────────────────

function Avatar({name, size=32, color}) {
  const initials = name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  const colors = ["#3B82F6","#10B981","#F59E0B","#8B5CF6","#EC4899","#14B8A6","#F97316"];
  const bg = color || colors[(name?.charCodeAt(0)||0) % colors.length];
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:bg+"25",border:`1.5px solid ${bg}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:700,color:bg,flexShrink:0}}>
      {initials}
    </div>
  );
}

function StatusBadge({status}) {
  const map = {New:"#3B82F6",Contacted:"#F59E0B",Qualified:"#8B5CF6",Proposal:"#EC4899",Negotiation:"#F97316",Won:"#10B981",Lost:"#EF4444","New Lead":"#3B82F6",Pending:"#F59E0B",Done:"#10B981",Overdue:"#EF4444",High:"#EF4444",Medium:"#F59E0B",Low:"#10B981"};
  const c = map[status] || "#64748B";
  return <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:99,background:c+"18",color:c,border:`0.5px solid ${c}30`,whiteSpace:"nowrap"}}>{status}</span>;
}

function KPICard({title, value, sub, trend, up, t}) {
  const T = t;
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 22px",boxShadow:T.shadow,flex:1,minWidth:160}}>
      <div style={{fontSize:12,color:T.muted,fontWeight:500,marginBottom:10,letterSpacing:"0.04em",textTransform:"uppercase"}}>{title}</div>
      <div style={{fontSize:26,fontWeight:800,color:T.text,letterSpacing:"-0.02em",marginBottom:6}}>{value}</div>
      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:12}}>
        {up ? <TrendingUp size={13} color="#10B981"/> : <TrendingDown size={13} color="#EF4444"/>}
        <span style={{color:up?"#10B981":"#EF4444",fontWeight:600}}>{trend}</span>
        <span style={{color:T.muted}}>vs last month</span>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────
const NAV = [
  {id:"dashboard",icon:LayoutDashboard,label:"Dashboard"},
  {id:"leads",icon:Users,label:"Leads"},
  {id:"contacts",icon:BookUser,label:"Contacts"},
  {id:"deals",icon:Briefcase,label:"Deals"},
  {id:"tasks",icon:CheckSquare,label:"Tasks"},
  {id:"reports",icon:BarChart2,label:"Reports"},
  {id:"settings",icon:Settings,label:"Settings"},
];

function Sidebar({page, setPage, t, collapsed}) {
  return (
    <div style={{width:collapsed?64:220,background:t.sidebar,display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:100,transition:"width 0.25s",overflow:"hidden"}}>
      <div style={{padding:collapsed?"18px 0":"24px 20px",borderBottom:`1px solid rgba(255,255,255,0.06)`,display:"flex",alignItems:"center",gap:10,justifyContent:collapsed?"center":"flex-start"}}>
        <div style={{width:32,height:32,borderRadius:8,background:"#3B82F6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Target size={18} color="#fff"/>
        </div>
        {!collapsed && <span style={{fontWeight:800,fontSize:16,color:"#F1F5F9",letterSpacing:"-0.02em",fontFamily:"'Plus Jakarta Sans',system-ui"}}>CRMpro</span>}
      </div>
      <nav style={{flex:1,padding:collapsed?"12px 8px":"12px",display:"flex",flexDirection:"column",gap:2}}>
        {NAV.map(({id,icon:Icon,label})=>{
          const active = page===id;
          return (
            <button key={id} onClick={()=>setPage(id)} title={label} style={{display:"flex",alignItems:"center",gap:10,padding:collapsed?"10px 0":"10px 12px",borderRadius:10,background:active?"#3B82F620":"transparent",border:`1px solid ${active?"#3B82F640":"transparent"}`,cursor:"pointer",transition:"all 0.15s",justifyContent:collapsed?"center":"flex-start",width:"100%"}}>
              <Icon size={18} color={active?"#3B82F6":t.sidebarText} strokeWidth={active?2:1.5}/>
              {!collapsed && <span style={{fontSize:13,fontWeight:active?600:400,color:active?"#3B82F6":t.sidebarText,transition:"color 0.15s"}}>{label}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:collapsed?"12px 8px":"12px 16px",borderTop:`1px solid rgba(255,255,255,0.06)`,display:"flex",alignItems:"center",gap:10,justifyContent:collapsed?"center":"flex-start"}}>
        <Avatar name="Admin User" size={32}/>
        {!collapsed && <div><div style={{fontSize:12,fontWeight:600,color:"#F1F5F9"}}>Admin User</div><div style={{fontSize:11,color:t.sidebarText}}>admin@crmpro.in</div></div>}
      </div>
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────
function Navbar({dark, setDark, collapsed, setCollapsed, page, t, search, setSearch}) {
  const title = NAV.find(n=>n.id===page)?.label||"Dashboard";
  return (
    <div style={{height:60,background:t.card,borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",paddingLeft:16,paddingRight:24,gap:16,position:"sticky",top:0,zIndex:50,boxShadow:t.shadow}}>
      <button onClick={()=>setCollapsed(p=>!p)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:t.muted}}>
        <Layers size={15}/>
      </button>
      <div style={{fontSize:16,fontWeight:700,color:t.text,fontFamily:"'Plus Jakarta Sans',system-ui",letterSpacing:"-0.01em"}}>{title}</div>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:t.surface,border:`1px solid ${t.border}`,borderRadius:10,padding:"7px 12px",maxWidth:340}}>
        <Search size={14} color={t.muted}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads, deals, contacts…" style={{border:"none",background:"none",outline:"none",fontSize:13,color:t.text,flex:1}}/>
      </div>
      <div style={{flex:1}}/>
      <button onClick={()=>setDark(p=>!p)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:t.muted}}>
        {dark?<Sun size={15}/>:<Moon size={15}/>}
      </button>
      <div style={{position:"relative"}}>
        <button style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:t.muted}}>
          <Bell size={15}/>
        </button>
        <div style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:"#EF4444",border:`2px solid ${t.card}`}}/>
      </div>
      <Avatar name="Admin User" size={34}/>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({t}) {
  const totalRevenue = monthlyRevenue.reduce((s,m)=>s+m.revenue,0);
  const wonDeals = deals.filter(d=>d.stage==="Won").length;

  return (
    <div style={{display:"flex",gap:20}}>
      {/* Main */}
      <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:20}}>
        {/* KPIs */}
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <KPICard title="Total Leads" value={leads.length} trend="12%" up t={t}/>
          <KPICard title="Active Deals" value={deals.filter(d=>!["Won","Lost"].includes(d.stage)).length} trend="8%" up t={t}/>
          <KPICard title="Revenue MTD" value={fmt(monthlyRevenue[5].revenue)} trend="15%" up t={t}/>
          <KPICard title="Win Rate" value={`${Math.round(wonDeals/deals.length*100)}%`} trend="3%" up={false} t={t}/>
        </div>

        {/* Pipeline Kanban */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,boxShadow:t.shadow}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <Briefcase size={16} color={t.accent}/> Sales Pipeline
          </div>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
            {STAGES.map(stage=>{
              const stageDeals = deals.filter(d=>d.stage===stage);
              const stageVal = stageDeals.reduce((s,d)=>s+d.value,0);
              const colors = {Won:"#10B981",Lost:"#EF4444","New Lead":"#3B82F6",Contacted:"#F59E0B",Proposal:"#8B5CF6",Negotiation:"#F97316"};
              const c = colors[stage]||"#64748B";
              return (
                <div key={stage} style={{minWidth:150,flex:1}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:c,textTransform:"uppercase",letterSpacing:"0.05em"}}>{stage}</span>
                    <span style={{fontSize:11,background:c+"15",color:c,borderRadius:99,padding:"1px 7px",fontWeight:600}}>{stageDeals.length}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {stageDeals.slice(0,3).map(d=>(
                      <div key={d.id} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:12,fontWeight:600,color:t.text,marginBottom:2}}>{d.title}</div>
                        <div style={{fontSize:11,color:t.muted}}>{d.client}</div>
                        <div style={{fontSize:12,fontWeight:700,color:c,marginTop:3}}>{fmt(d.value)}</div>
                      </div>
                    ))}
                    {stageDeals.length > 3 && <div style={{fontSize:11,color:t.muted,textAlign:"center",padding:"4px 0"}}>+{stageDeals.length-3} more</div>}
                    <div style={{fontSize:11,fontWeight:600,color:t.muted,textAlign:"right",paddingTop:2}}>{fmt(stageVal)} total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,boxShadow:t.shadow}}>
            <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <BarChart2 size={16} color={t.accent}/> Monthly Revenue
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:t.muted}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`₹${v/100000}L`} tick={{fontSize:11,fill:t.muted}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>[fmt(v)]} contentStyle={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,fontSize:12}}/>
                <Bar dataKey="revenue" fill="#3B82F6" radius={[6,6,0,0]} name="Revenue"/>
                <Bar dataKey="target" fill={t.border} radius={[6,6,0,0]} name="Target"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,boxShadow:t.shadow}}>
            <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <PieIcon size={16} color={t.accent}/> Lead Sources
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {sourceData.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
                </Pie>
                <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,fontSize:12}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:4}}>
              {sourceData.map(s=>(
                <div key={s.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:s.color}}/><span style={{color:t.muted}}>{s.name}</span></div>
                  <span style={{fontWeight:600,color:t.text}}>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,boxShadow:t.shadow}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <Award size={16} color={t.accent}/> Top Sales Reps
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {repPerformance.map((rep,i)=>(
              <div key={rep.name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<repPerformance.length-1?`1px solid ${t.border}`:"none"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:i<3?"#F59E0B18":t.surface,border:`1px solid ${i<3?"#F59E0B":"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<3?"#F59E0B":t.muted,flexShrink:0}}>
                  {i+1}
                </div>
                <Avatar name={rep.name} size={32}/>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:t.text}}>{rep.name}</div><div style={{fontSize:11,color:t.muted}}>{rep.deals} deals closed</div></div>
                <div style={{fontSize:13,fontWeight:700,color:t.text}}>{fmt(rep.revenue)}</div>
                <div style={{fontSize:11,padding:"3px 8px",borderRadius:99,background:"#10B98118",color:"#10B981",fontWeight:600}}>{rep.winRate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{width:280,flexShrink:0,display:"flex",flexDirection:"column",gap:16}}>
        {/* Activity */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:18,boxShadow:t.shadow}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <Activity size={16} color={t.accent}/> Recent Activity
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {activities.map((a,i)=>(
              <div key={a.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<activities.length-1?`1px solid ${t.border}`:"none"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:a.color,marginTop:5,flexShrink:0}}/>
                <div style={{flex:1}}><div style={{fontSize:12,color:t.text,lineHeight:1.5}}>{a.text}</div><div style={{fontSize:11,color:t.muted,marginTop:1}}>{a.time}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:18,boxShadow:t.shadow}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <CheckSquare size={16} color={t.accent}/> Today's Tasks
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {tasks.slice(0,6).map(task=>(
              <div key={task.id} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${task.status==="Done"?"#10B981":t.border}`,background:task.status==="Done"?"#10B981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {task.status==="Done"&&<Check size={10} color="#fff"/>}
                </div>
                <div style={{flex:1,fontSize:12,color:task.status==="Done"?t.muted:t.text,textDecoration:task.status==="Done"?"line-through":"none"}}>{task.title}</div>
                <StatusBadge status={task.priority}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LEADS MODULE ─────────────────────────────────────────────
function LeadsModule({t, search}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [repFilter, setRepFilter] = useState("All");
  const [sortKey, setSortKey] = useState("createdDate");
  const [sortDir, setSortDir] = useState(-1);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newLead, setNewLead] = useState({name:"",company:"",email:"",phone:"",source:"Organic",status:"New",assignedTo:REPS[0],notes:""});

  const filtered = useMemo(()=>leads
    .filter(l=>(statusFilter==="All"||l.status===statusFilter)&&(sourceFilter==="All"||l.source===sourceFilter)&&(repFilter==="All"||l.assignedTo===repFilter)&&(!search||l.name.toLowerCase().includes(search.toLowerCase())||l.company.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b)=>{const v=a[sortKey]<b[sortKey]?-1:1;return v*sortDir;}), [statusFilter,sourceFilter,repFilter,sortKey,sortDir,search]);

  const sort = key=>{setSortKey(key);setSortDir(p=>sortKey===key?-p:-1);};
  const SH = ({k,label})=>(<th onClick={()=>sort(k)} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:"0.05em",cursor:"pointer",whiteSpace:"nowrap",background:t.surface,borderBottom:`1px solid ${t.border}`}}>{label}{sortKey===k&&(sortDir>0?" ↑":" ↓")}</th>);

  const sel = {background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 10px",color:t.text,fontSize:12,outline:"none",cursor:"pointer"};
  const inp = {background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 12px",color:t.text,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"};

  if (selectedLead) return (
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24}}>
      <button onClick={()=>setSelectedLead(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 12px",color:t.muted,cursor:"pointer",fontSize:12,marginBottom:20}}>← Back to Leads</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <Avatar name={selectedLead.name} size={52}/>
            <div><div style={{fontSize:20,fontWeight:800,color:t.text}}>{selectedLead.name}</div><div style={{color:t.muted,fontSize:13}}>{selectedLead.company}</div></div>
          </div>
          {[["Email",selectedLead.email],["Phone",selectedLead.phone],["Source",selectedLead.source],["Assigned To",selectedLead.assignedTo],["Status",selectedLead.status],["Created",selectedLead.createdDate]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.border}`,fontSize:13}}>
              <span style={{color:t.muted}}>{k}</span>
              <span style={{color:t.text,fontWeight:500}}>{k==="Status"?<StatusBadge status={v}/>:v}</span>
            </div>
          ))}
          <div style={{marginTop:16}}>
            <div style={{fontSize:12,color:t.muted,marginBottom:6}}>Tags</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{selectedLead.tags?.map(tag=><span key={tag} style={{fontSize:11,padding:"3px 9px",borderRadius:99,background:"#3B82F618",color:"#3B82F6",border:"0.5px solid #3B82F630"}}>{tag}</span>)}</div>
          </div>
          <button style={{marginTop:16,background:"#10B981",border:"none",borderRadius:8,padding:"10px 18px",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
            <ArrowRight size={14}/> Convert to Deal
          </button>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:12}}>Activity Timeline</div>
          {activities.slice(0,5).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:a.color,marginTop:5,flexShrink:0}}/>
              <div><div style={{fontSize:12,color:t.text}}>{a.text}</div><div style={{fontSize:11,color:t.muted}}>{a.time}</div></div>
            </div>
          ))}
          <div style={{fontWeight:700,fontSize:14,color:t.text,margin:"16px 0 8px"}}>Notes</div>
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",fontSize:13,color:t.muted,lineHeight:1.6}}>{selectedLead.notes}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={sel}>
          <option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)} style={sel}>
          <option>All</option>{SOURCES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={repFilter} onChange={e=>setRepFilter(e.target.value)} style={sel}>
          <option>All</option>{REPS.map(r=><option key={r}>{r}</option>)}
        </select>
        <div style={{flex:1}}/>
        <span style={{fontSize:13,color:t.muted}}>{filtered.length} leads</span>
        <button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:6,background:"#3B82F6",border:"none",borderRadius:8,padding:"8px 14px",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:13}}>
          <Plus size={14}/> Add Lead
        </button>
      </div>

      {/* Table */}
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:t.shadow}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <SH k="name" label="Name"/><SH k="company" label="Company"/><SH k="source" label="Source"/>
                <SH k="status" label="Status"/><SH k="assignedTo" label="Assigned To"/><SH k="createdDate" label="Created"/><th style={{padding:"10px 14px",background:t.surface,borderBottom:`1px solid ${t.border}`}}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead,i)=>(
                <tr key={lead.id} style={{borderBottom:i<filtered.length-1?`1px solid ${t.border}`:"none",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background=t.surface} onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Avatar name={lead.name} size={28}/>
                      <div><div style={{fontSize:13,fontWeight:600,color:t.text}}>{lead.name}</div><div style={{fontSize:11,color:t.muted}}>{lead.email}</div></div>
                    </div>
                  </td>
                  <td style={{padding:"12px 14px",fontSize:13,color:t.text}}>{lead.company}</td>
                  <td style={{padding:"12px 14px"}}><StatusBadge status={lead.source}/></td>
                  <td style={{padding:"12px 14px"}}><StatusBadge status={lead.status}/></td>
                  <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{lead.assignedTo}</td>
                  <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{lead.createdDate}</td>
                  <td style={{padding:"12px 14px"}}>
                    <button onClick={()=>setSelectedLead(lead)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 10px",color:t.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:4}}>
                      <Eye size={12}/> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowAdd(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:28,width:500,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:700,color:t.text}}>Add New Lead</div>
              <button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",color:t.muted,cursor:"pointer"}}><X size={18}/></button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["name","Full Name","text"],["company","Company","text"],["email","Email","email"],["phone","Phone","text"]].map(([k,label,type])=>(
                <div key={k}><label style={{fontSize:12,color:t.muted,display:"block",marginBottom:4}}>{label}</label><input type={type} value={newLead[k]} onChange={e=>setNewLead(p=>({...p,[k]:e.target.value}))} style={inp} placeholder={label}/></div>
              ))}
              <div><label style={{fontSize:12,color:t.muted,display:"block",marginBottom:4}}>Source</label><select value={newLead.source} onChange={e=>setNewLead(p=>({...p,source:e.target.value}))} style={{...inp,cursor:"pointer"}}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:12,color:t.muted,display:"block",marginBottom:4}}>Assign To</label><select value={newLead.assignedTo} onChange={e=>setNewLead(p=>({...p,assignedTo:e.target.value}))} style={{...inp,cursor:"pointer"}}>{REPS.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div style={{marginTop:12}}><label style={{fontSize:12,color:t.muted,display:"block",marginBottom:4}}>Notes</label><textarea value={newLead.notes} onChange={e=>setNewLead(p=>({...p,notes:e.target.value}))} style={{...inp,minHeight:80,resize:"vertical"}} placeholder="Add any notes..."/></div>
            <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
              <button onClick={()=>setShowAdd(false)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 18px",color:t.text,cursor:"pointer",fontSize:13}}>Cancel</button>
              <button onClick={()=>setShowAdd(false)} style={{background:"#3B82F6",border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",fontWeight:600,cursor:"pointer",fontSize:13}}>Save Lead</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONTACTS MODULE ──────────────────────────────────────────
function ContactsModule({t, search}) {
  const [selected, setSelected] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState(1);

  const filtered = useMemo(()=>contacts
    .filter(c=>!search||c.name.toLowerCase().includes(search.toLowerCase())||c.company.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{const v=a[sortKey]<b[sortKey]?-1:1;return v*sortDir;}),[sortKey,sortDir,search]);

  const sort = key=>{setSortKey(key);setSortDir(p=>sortKey===key?-p:1);};
  const SH = ({k,label})=>(<th onClick={()=>sort(k)} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:"0.05em",cursor:"pointer",whiteSpace:"nowrap",background:t.surface,borderBottom:`1px solid ${t.border}`}}>{label}{sortKey===k&&(sortDir>0?" ↑":" ↓")}</th>);

  if (selected) return (
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24}}>
      <button onClick={()=>setSelected(null)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 12px",color:t.muted,cursor:"pointer",fontSize:12,marginBottom:20}}>← Back</button>
      <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:24}}>
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:20}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
            <Avatar name={selected.name} size={64}/>
            <div style={{fontSize:18,fontWeight:800,color:t.text,marginTop:10}}>{selected.name}</div>
            <div style={{fontSize:13,color:t.muted}}>{selected.role}</div>
            <div style={{fontSize:12,color:t.accent,marginTop:2}}>{selected.company}</div>
          </div>
          {[["Email",selected.email],["Phone",selected.phone],["Last Contacted",selected.lastContacted],["Assigned To",selected.assignedTo]].map(([k,v])=>(
            <div key={k} style={{padding:"8px 0",borderBottom:`1px solid ${t.border}`,fontSize:12}}>
              <div style={{color:t.muted,marginBottom:2}}>{k}</div>
              <div style={{color:t.text,fontWeight:500}}>{v}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:t.text,marginBottom:12}}>Interaction History</div>
          {activities.slice(0,6).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${t.border}`}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:a.color+"15",border:`1px solid ${a.color}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {a.type==="call"?<Phone size={13} color={a.color}/>:a.type==="email"?<Mail size={13} color={a.color}/>:<Calendar size={13} color={a.color}/>}
              </div>
              <div><div style={{fontSize:13,color:t.text}}>{a.text}</div><div style={{fontSize:11,color:t.muted}}>{a.time}</div></div>
            </div>
          ))}
          <div style={{marginTop:16,fontWeight:700,fontSize:15,color:t.text,marginBottom:10}}>Associated Deals</div>
          {deals.slice(0,2).map(d=>(
            <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.surface,borderRadius:8,padding:"10px 14px",marginBottom:8}}>
              <div><div style={{fontSize:13,fontWeight:600,color:t.text}}>{d.title}</div><div style={{fontSize:11,color:t.muted}}>{d.stage}</div></div>
              <div style={{fontSize:14,fontWeight:700,color:"#3B82F6"}}>{fmt(d.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:t.shadow}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><SH k="name" label="Name"/><SH k="role" label="Role"/><SH k="company" label="Company"/><SH k="source" label="Source"/><SH k="lastContacted" label="Last Contacted"/><SH k="assignedTo" label="Assigned To"/><th style={{padding:"10px 14px",background:t.surface,borderBottom:`1px solid ${t.border}`}}/></tr></thead>
          <tbody>
            {filtered.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:i<filtered.length-1?`1px solid ${t.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=t.surface} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={c.name} size={28}/><div><div style={{fontSize:13,fontWeight:600,color:t.text}}>{c.name}</div><div style={{fontSize:11,color:t.muted}}>{c.email}</div></div></div></td>
                <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{c.role}</td>
                <td style={{padding:"12px 14px",fontSize:13,color:t.text}}>{c.company}</td>
                <td style={{padding:"12px 14px"}}><StatusBadge status={c.source}/></td>
                <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{c.lastContacted}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{c.assignedTo}</td>
                <td style={{padding:"12px 14px"}}><button onClick={()=>setSelected(c)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 10px",color:t.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:4}}><Eye size={12}/> View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── DEALS MODULE ─────────────────────────────────────────────
function DealsModule({t}) {
  const [view, setView] = useState("kanban");
  const [selected, setSelected] = useState(null);

  if (selected) return (
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:24}}>
      <button onClick={()=>setSelected(null)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 12px",color:t.muted,cursor:"pointer",fontSize:12,marginBottom:20}}>← Back to Deals</button>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:t.text,marginBottom:4}}>{selected.title}</div>
          <div style={{color:t.muted,fontSize:13,marginBottom:20}}>{selected.client}</div>
          {[["Deal Value",fmt(selected.value)],["Stage",selected.stage],["Probability",`${selected.probability}%`],["Close Date",selected.closeDate],["Owner",selected.owner],["Contact",selected.contact]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${t.border}`,fontSize:13}}>
              <span style={{color:t.muted}}>{k}</span>
              <span style={{color:t.text,fontWeight:600}}>{k==="Stage"?<StatusBadge status={v}/>:v}</span>
            </div>
          ))}
          <div style={{marginTop:16}}>
            <div style={{fontSize:12,color:t.muted,marginBottom:6}}>Notes</div>
            <div style={{background:t.surface,borderRadius:8,padding:"10px 12px",fontSize:13,color:t.muted,lineHeight:1.6}}>{selected.notes}</div>
          </div>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:15,color:t.text,marginBottom:12}}>Stage History</div>
          {STAGES.slice(0,STAGES.indexOf(selected.stage)+1).map((s,i)=>(
            <div key={s} style={{display:"flex",gap:12,marginBottom:10}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"#10B98120",border:"2px solid #10B981",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                <Check size={10} color="#10B981"/>
              </div>
              <div><div style={{fontSize:13,fontWeight:500,color:t.text}}>{s}</div><div style={{fontSize:11,color:t.muted}}>{daysAgo(STAGES.length-i-1)}</div></div>
            </div>
          ))}
          <div style={{marginTop:16,fontWeight:700,fontSize:15,color:t.text,marginBottom:10}}>Tasks</div>
          {tasks.slice(0,3).map(task=>(
            <div key={task.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.surface,borderRadius:8,padding:"8px 12px",marginBottom:6}}>
              <span style={{fontSize:12,color:t.text}}>{task.title}</span>
              <StatusBadge status={task.priority}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (view==="list") return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <button onClick={()=>setView("kanban")} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 14px",color:t.muted,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:6}}><Layers size={13}/> Kanban</button>
        <button style={{background:"#3B82F615",border:`1px solid #3B82F630`,borderRadius:8,padding:"7px 14px",color:"#3B82F6",cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}><List size={13}/> List</button>
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Title","Client","Value","Stage","Probability","Close Date","Owner"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:"0.05em",background:t.surface,borderBottom:`1px solid ${t.border}`}}>{h}</th>)}<th style={{padding:"10px 14px",background:t.surface,borderBottom:`1px solid ${t.border}`}}/></tr></thead>
          <tbody>
            {deals.map((d,i)=>(
              <tr key={d.id} style={{borderBottom:i<deals.length-1?`1px solid ${t.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=t.surface} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{padding:"12px 14px",fontSize:13,fontWeight:600,color:t.text}}>{d.title}</td>
                <td style={{padding:"12px 14px",fontSize:13,color:t.text}}>{d.client}</td>
                <td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"#3B82F6"}}>{fmt(d.value)}</td>
                <td style={{padding:"12px 14px"}}><StatusBadge status={d.stage}/></td>
                <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{d.probability}%</td>
                <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{d.closeDate}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:t.muted}}>{d.owner}</td>
                <td style={{padding:"12px 14px"}}><button onClick={()=>setSelected(d)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 10px",color:t.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:4}}><Eye size={12}/> View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <button style={{background:"#3B82F615",border:`1px solid #3B82F630`,borderRadius:8,padding:"7px 14px",color:"#3B82F6",cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}><Layers size={13}/> Kanban</button>
        <button onClick={()=>setView("list")} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 14px",color:t.muted,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:6}}><List size={13}/> List</button>
      </div>
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:12}}>
        {STAGES.map(stage=>{
          const stageDeals = deals.filter(d=>d.stage===stage);
          const stageVal = stageDeals.reduce((s,d)=>s+d.value,0);
          const colors = {Won:"#10B981",Lost:"#EF4444","New Lead":"#3B82F6",Contacted:"#F59E0B",Proposal:"#8B5CF6",Negotiation:"#F97316"};
          const c = colors[stage]||"#64748B";
          return (
            <div key={stage} style={{minWidth:220,flex:"0 0 220px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"8px 12px",background:c+"10",borderRadius:8,border:`1px solid ${c}20`}}>
                <span style={{fontSize:12,fontWeight:700,color:c}}>{stage}</span>
                <span style={{fontSize:11,background:c+"20",color:c,borderRadius:99,padding:"1px 7px",fontWeight:700}}>{stageDeals.length}</span>
              </div>
              <div style={{fontSize:11,color:t.muted,marginBottom:8,textAlign:"right"}}>{fmt(stageVal)} pipeline</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {stageDeals.map(d=>(
                  <div key={d.id} onClick={()=>setSelected(d)} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",transition:"all 0.15s",boxShadow:t.shadow}} onMouseEnter={e=>{e.currentTarget.style.borderColor=c;e.currentTarget.style.boxShadow=`0 0 0 1px ${c}30`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.boxShadow=t.shadow;}}>
                    <div style={{fontSize:13,fontWeight:600,color:t.text,marginBottom:4}}>{d.title}</div>
                    <div style={{fontSize:11,color:t.muted,marginBottom:6}}>{d.client}</div>
                    <div style={{fontSize:14,fontWeight:800,color:c}}>{fmt(d.value)}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8,fontSize:11,color:t.muted}}>
                      <span>{d.probability}% win rate</span>
                      <div style={{display:"flex",alignItems:"center",gap:4}}><Avatar name={d.owner} size={18}/></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TASKS MODULE ─────────────────────────────────────────────
function TasksModule({t}) {
  const [filter, setFilter] = useState("All");
  const [showCal, setShowCal] = useState(false);

  const filtered = tasks.filter(t=>filter==="All"||t.priority===filter||t.status===filter);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
  const firstDay = new Date(today.getFullYear(),today.getMonth(),1).getDay();
  const taskDays = new Set(tasks.map(t=>{const d=new Date(t.dueDate);return d.getMonth()===today.getMonth()?d.getDate():null}).filter(Boolean));

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:16}}>
      <div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          {["All","High","Medium","Low","Pending","Done","Overdue"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{fontSize:12,padding:"6px 12px",borderRadius:99,border:`1px solid ${filter===f?"#3B82F6":t.border}`,background:filter===f?"#3B82F615":"transparent",color:filter===f?"#3B82F6":t.muted,cursor:"pointer",fontWeight:filter===f?600:400}}>{f}</button>
          ))}
        </div>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:t.shadow}}>
          {filtered.map((task,i)=>(
            <div key={task.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderBottom:i<filtered.length-1?`1px solid ${t.border}`:"none"}}>
              <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${task.status==="Done"?"#10B981":task.status==="Overdue"?"#EF4444":t.border}`,background:task.status==="Done"?"#10B981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {task.status==="Done"&&<Check size={11} color="#fff"/>}
                {task.status==="Overdue"&&<AlertCircle size={11} color="#EF4444"/>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,color:task.status==="Done"?t.muted:t.text,textDecoration:task.status==="Done"?"line-through":"none"}}>{task.title}</div>
                <div style={{fontSize:11,color:t.muted,marginTop:2,display:"flex",gap:10}}>
                  <span style={{display:"flex",alignItems:"center",gap:3}}><Clock size={10}/> {task.dueDate}</span>
                  <span style={{display:"flex",alignItems:"center",gap:3}}><Users size={10}/> {task.linkedTo}</span>
                </div>
              </div>
              <StatusBadge status={task.priority}/>
              <StatusBadge status={task.type}/>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:16,boxShadow:t.shadow}}>
        <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <Calendar size={15} color={t.accent}/>
          {today.toLocaleString("default",{month:"long",year:"numeric"})}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:t.muted,padding:"4px 0"}}>{d}</div>)}
          {Array.from({length:firstDay},(_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>{
            const day=i+1;
            const isToday=day===today.getDate();
            const hasTask=taskDays.has(day);
            return (
              <div key={day} style={{textAlign:"center",padding:"5px 2px",borderRadius:6,background:isToday?"#3B82F6":hasTask?"#3B82F615":"transparent",fontSize:12,fontWeight:isToday?700:hasTask?600:400,color:isToday?"#fff":hasTask?"#3B82F6":t.text,cursor:"pointer",position:"relative"}}>
                {day}
                {hasTask&&!isToday&&<div style={{width:4,height:4,borderRadius:"50%",background:"#3B82F6",margin:"1px auto 0"}}/>}
              </div>
            );
          })}
        </div>
        <div style={{marginTop:14,borderTop:`1px solid ${t.border}`,paddingTop:12}}>
          <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:8}}>Task Summary</div>
          {[["Total",tasks.length,"#3B82F6"],["Done",tasks.filter(t=>t.status==="Done").length,"#10B981"],["Overdue",tasks.filter(t=>t.status==="Overdue").length,"#EF4444"],["Pending",tasks.filter(t=>t.status==="Pending").length,"#F59E0B"]].map(([k,v,c])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",fontSize:12}}>
              <span style={{color:t.muted}}>{k}</span>
              <span style={{fontWeight:700,color:c}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS MODULE ───────────────────────────────────────────
function ReportsModule({t}) {
  const [period, setPeriod] = useState("monthly");

  const winLoss = [
    {name:"Won",value:deals.filter(d=>d.stage==="Won").length,fill:"#10B981"},
    {name:"Lost",value:deals.filter(d=>d.stage==="Lost").length,fill:"#EF4444"},
    {name:"Active",value:deals.filter(d=>!["Won","Lost"].includes(d.stage)).length,fill:"#3B82F6"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Revenue Trend */}
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,boxShadow:t.shadow}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,display:"flex",alignItems:"center",gap:8}}>
            <TrendingUp size={16} color={t.accent}/> Revenue Trend
          </div>
          <div style={{display:"flex",gap:6}}>
            {["monthly","quarterly","yearly"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{fontSize:11,padding:"4px 10px",borderRadius:99,border:`1px solid ${period===p?"#3B82F6":t.border}`,background:period===p?"#3B82F615":"transparent",color:period===p?"#3B82F6":t.muted,cursor:"pointer",fontWeight:period===p?600:400,textTransform:"capitalize"}}>{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false}/>
            <XAxis dataKey="month" tick={{fontSize:11,fill:t.muted}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>`₹${v/100000}L`} tick={{fontSize:11,fill:t.muted}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={v=>[fmt(v)]} contentStyle={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,fontSize:12}}/>
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} dot={{r:4,fill:"#3B82F6"}} name="Revenue"/>
            <Line type="monotone" dataKey="target" stroke={t.muted} strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Target"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Win/Loss */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,boxShadow:t.shadow}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <PieIcon size={15} color={t.accent}/> Win / Loss Ratio
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={winLoss} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {winLoss.map((e,i)=><Cell key={i} fill={e.fill}/>)}
              </Pie>
              <Tooltip contentStyle={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,fontSize:12}}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12,color:t.muted}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel */}
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,boxShadow:t.shadow}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <Filter size={15} color={t.accent}/> Lead Conversion Funnel
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {funnelData.map((f,i)=>(
              <div key={f.name} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:80,fontSize:11,color:t.muted,textAlign:"right"}}>{f.name}</div>
                <div style={{flex:1,height:26,background:f.fill,borderRadius:4,display:"flex",alignItems:"center",paddingLeft:8,maxWidth:`${(f.value/funnelData[0].value)*100}%`}}>
                  <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rep Performance Table */}
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:t.shadow}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${t.border}`,fontWeight:700,fontSize:14,color:t.text,display:"flex",alignItems:"center",gap:8}}>
          <Award size={15} color={t.accent}/> Rep Performance
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Rank","Rep","Deals Closed","Revenue","Win Rate","Performance"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:"0.05em",background:t.surface,borderBottom:`1px solid ${t.border}`}}>{h}</th>)}</tr></thead>
          <tbody>
            {repPerformance.map((rep,i)=>(
              <tr key={rep.name} style={{borderBottom:i<repPerformance.length-1?`1px solid ${t.border}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=t.surface} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{padding:"12px 16px"}}><div style={{width:24,height:24,borderRadius:"50%",background:i<3?"#F59E0B18":t.surface,border:`1px solid ${i<3?"#F59E0B":"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<3?"#F59E0B":t.muted}}>{i+1}</div></td>
                <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={rep.name} size={30}/><span style={{fontSize:13,fontWeight:600,color:t.text}}>{rep.name}</span></div></td>
                <td style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:t.text}}>{rep.deals}</td>
                <td style={{padding:"12px 16px",fontSize:13,fontWeight:700,color:"#3B82F6"}}>{fmt(rep.revenue)}</td>
                <td style={{padding:"12px 16px"}}><span style={{fontSize:12,fontWeight:600,color:rep.winRate>=70?"#10B981":rep.winRate>=50?"#F59E0B":"#EF4444"}}>{rep.winRate}%</span></td>
                <td style={{padding:"12px 16px",width:120}}>
                  <div style={{height:6,background:t.border,borderRadius:99,overflow:"hidden"}}>
                    <div style={{width:`${rep.winRate}%`,height:"100%",background:rep.winRate>=70?"#10B981":rep.winRate>=50?"#F59E0B":"#EF4444",borderRadius:99}}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SETTINGS MODULE ──────────────────────────────────────────
function SettingsModule({t}) {
  return (
    <div style={{maxWidth:600}}>
      {[{label:"Profile",fields:[["Full Name","Admin User"],["Email","admin@crmpro.in"],["Role","Super Admin"]]},{label:"Notifications",fields:[["Email Alerts","Enabled"],["Deal Updates","Enabled"],["Lead Assignments","Enabled"]]},{label:"Display",fields:[["Currency","INR (₹)"],["Date Format","YYYY-MM-DD"],["Timezone","IST (UTC+5:30)"]]}].map(section=>(
        <div key={section.label} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:20,marginBottom:16,boxShadow:t.shadow}}>
          <div style={{fontWeight:700,fontSize:14,color:t.text,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${t.border}`}}>{section.label}</div>
          {section.fields.map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${t.border}`}}>
              <span style={{fontSize:13,color:t.muted}}>{k}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:13,color:t.text,fontWeight:500}}>{v}</span>
                <button style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"3px 8px",color:t.muted,cursor:"pointer",fontSize:11}}><Edit2 size={10}/></button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const t = dark ? DARK : LIGHT;
  const sideW = collapsed ? 64 : 220;

  const pages = {
    dashboard: <Dashboard t={t}/>,
    leads: <LeadsModule t={t} search={search}/>,
    contacts: <ContactsModule t={t} search={search}/>,
    deals: <DealsModule t={t}/>,
    tasks: <TasksModule t={t}/>,
    reports: <ReportsModule t={t}/>,
    settings: <SettingsModule t={t}/>,
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:t.bg,fontFamily:"'Plus Jakarta Sans','DM Sans',system-ui,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <Sidebar page={page} setPage={setPage} t={t} collapsed={collapsed}/>
      <div style={{marginLeft:sideW,flex:1,display:"flex",flexDirection:"column",minWidth:0,transition:"margin-left 0.25s"}}>
        <Navbar dark={dark} setDark={setDark} collapsed={collapsed} setCollapsed={setCollapsed} page={page} t={t} search={search} setSearch={setSearch}/>
        <main style={{flex:1,padding:24,overflowY:"auto"}}>
          {pages[page]}
        </main>
      </div>
    </div>
  );
}
