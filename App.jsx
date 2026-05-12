import { useState, useEffect, useRef } from "react";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f4f6fb;
  --white:#ffffff;
  --s1:#f0f3f9;
  --s2:#e8edf6;
  --b1:#dde3ef;
  --b2:#c8d2e8;
  --primary:#1a56db;
  --pl:#eff4ff;
  --pm:#c7d7fd;
  --pd:#1040b0;
  --accent:#e84d4d;
  --gold:#d97706;
  --green:#16a34a;
  --orange:#ea580c;
  --purple:#7c3aed;
  --t1:#0f172a;--t2:#334155;--t3:#64748b;--t4:#94a3b8;
  --sh:0 1px 3px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.04);
  --shm:0 4px 16px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04);
  --shl:0 10px 30px rgba(0,0,0,.1),0 4px 8px rgba(0,0,0,.06);
}
body{background:var(--bg);color:var(--t1);font-family:'Noto Sans SC',sans-serif;font-size:14px;line-height:1.5}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--s1)}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:4px}
input,textarea,select{
  font-family:'Noto Sans SC',sans-serif;font-size:13px;color:var(--t1);
  background:var(--white);border:1.5px solid var(--b1);border-radius:8px;
  padding:8px 11px;width:100%;outline:none;transition:border .15s,box-shadow .15s;
}
input:focus,textarea:focus,select:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(26,86,219,.09)}
select option{background:var(--white);color:var(--t1)}
textarea{resize:vertical;line-height:1.7}
button{font-family:'Noto Sans SC',sans-serif;cursor:pointer;transition:all .15s}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
`;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const INDUSTRIES = ["美妆护肤","服装服饰","食品饮料","3C数码","家居家装","母婴亲子","珠宝饰品","运动户外","宠物用品","医疗保健","教育培训","汽车配件","其他"];
const CLIENT_TYPES = ["品牌旗舰店","中小卖家","代理运营商","白牌商家","KA大客户"];
const STATUSES = ["新开发","跟进中","活跃投放","观望评估","暂停投放","已流失"];
const BUDGET_RANGES = ["0-30万","30-50万","50-100万","100-500万","500万以上"];
const CONTACT_INTERVALS = ["每天","2-3天","每周","半月","月度"];
const SALES_MEMBERS = ["张伟","李娜","王芳","刘洋","陈静","赵磊","黄敏","周杰"];
const DEFAULT_USERS = [
  {id:"admin",username:"admin",password:"admin123",name:"管理员",role:"admin"},
  {id:"zhangwei",username:"zhangwei",password:"qw123",name:"张伟",role:"sales"},
  {id:"lina",username:"lina",password:"qw123",name:"李娜",role:"sales"},
  {id:"wangfang",username:"wangfang",password:"qw123",name:"王芳",role:"sales"},
  {id:"liuyang",username:"liuyang",password:"qw123",name:"刘洋",role:"sales"},
  {id:"chenjing",username:"chenjing",password:"qw123",name:"陈静",role:"sales"},
  {id:"zhaolei",username:"zhaolei",password:"qw123",name:"赵磊",role:"sales"},
  {id:"huangmin",username:"huangmin",password:"qw123",name:"黄敏",role:"sales"},
  {id:"zhoujie",username:"zhoujie",password:"qw123",name:"周杰",role:"sales"},
];

const STATUS_META = {
  "新开发":{c:"#7c3aed",bg:"#f5f3ff",bd:"#ddd6fe"},
  "跟进中":{c:"#1a56db",bg:"#eff4ff",bd:"#c7d7fd"},
  "活跃投放":{c:"#16a34a",bg:"#f0fdf4",bd:"#bbf7d0"},
  "观望评估":{c:"#d97706",bg:"#fffbeb",bd:"#fde68a"},
  "暂停投放":{c:"#ea580c",bg:"#fff7ed",bd:"#fed7aa"},
  "已流失":{c:"#e84d4d",bg:"#fff1f1",bd:"#fecaca"},
};
const TIER_META = {
  S:{c:"#d97706",bg:"#fffbeb",bd:"#fde68a",label:"S级"},
  A:{c:"#ea580c",bg:"#fff7ed",bd:"#fed7aa",label:"A级"},
  B:{c:"#1a56db",bg:"#eff4ff",bd:"#c7d7fd",label:"B级"},
  C:{c:"#64748b",bg:"#f8fafc",bd:"#e2e8f0",label:"C级"},
  D:{c:"#94a3b8",bg:"#f1f5f9",bd:"#cbd5e1",label:"D级"},
};
const RISK_C = {高:"#e84d4d",中:"#d97706",低:"#16a34a"};

const INDUSTRY_BENCHMARKS = {
  "美妆护肤": {
    shortVideo: { cpm: [40, 60], ctr: [2.2, 3.8], cvr: [2.0, 4.0], roi: [2.3, 3.8] },
    live: { cpm: [35, 55], ctr: [1.8, 3.2], cvr: [1.5, 3.0], roi: [1.9, 3.2] },
    imageText: { cpm: [30, 45], ctr: [1.5, 2.5], cvr: [1.2, 2.2], roi: [1.7, 2.8] }
  },
  "服装服饰": {
    shortVideo: { cpm: [30, 50], ctr: [1.8, 3.2], cvr: [1.5, 2.5], roi: [1.7, 3.0] },
    live: { cpm: [28, 45], ctr: [1.5, 2.8], cvr: [1.2, 2.2], roi: [1.5, 2.7] },
    imageText: { cpm: [25, 40], ctr: [1.2, 2.2], cvr: [1.0, 1.8], roi: [1.4, 2.3] }
  },
  "食品饮料": {
    shortVideo: { cpm: [25, 40], ctr: [2.0, 3.5], cvr: [2.5, 4.5], roi: [2.0, 3.5] },
    live: { cpm: [22, 35], ctr: [1.7, 3.0], cvr: [2.2, 3.8], roi: [1.8, 3.2] },
    imageText: { cpm: [20, 32], ctr: [1.4, 2.4], cvr: [1.8, 2.8], roi: [1.6, 2.7] }
  },
  "3C数码": {
    shortVideo: { cpm: [60, 85], ctr: [1.5, 2.5], cvr: [1.0, 2.0], roi: [1.6, 2.4] },
    live: { cpm: [55, 80], ctr: [1.3, 2.2], cvr: [0.8, 1.6], roi: [1.4, 2.1] },
    imageText: { cpm: [50, 75], ctr: [1.1, 1.8], cvr: [0.7, 1.4], roi: [1.3, 1.9] }
  },
  "家居家装": {
    shortVideo: { cpm: [35, 60], ctr: [1.6, 2.8], cvr: [1.8, 3.2], roi: [1.9, 3.1] },
    live: { cpm: [32, 55], ctr: [1.4, 2.5], cvr: [1.5, 2.8], roi: [1.7, 2.8] },
    imageText: { cpm: [30, 50], ctr: [1.2, 2.1], cvr: [1.2, 2.2], roi: [1.5, 2.4] }
  },
  "母婴亲子": {
    shortVideo: { cpm: [40, 65], ctr: [1.7, 3.0], cvr: [2.0, 3.5], roi: [2.0, 3.2] },
    live: { cpm: [38, 60], ctr: [1.5, 2.7], cvr: [1.7, 3.0], roi: [1.8, 2.9] },
    imageText: { cpm: [35, 55], ctr: [1.3, 2.3], cvr: [1.4, 2.4], roi: [1.6, 2.5] }
  },
  "珠宝饰品": {
    shortVideo: { cpm: [65, 95], ctr: [1.2, 2.0], cvr: [0.6, 1.4], roi: [1.3, 1.9] },
    live: { cpm: [60, 90], ctr: [1.0, 1.7], cvr: [0.5, 1.2], roi: [1.2, 1.7] },
    imageText: { cpm: [55, 85], ctr: [0.8, 1.4], cvr: [0.4, 0.9], roi: [1.0, 1.5] }
  },
  "运动户外": {
    shortVideo: { cpm: [45, 75], ctr: [1.5, 2.7], cvr: [1.3, 2.6], roi: [1.6, 2.6] },
    live: { cpm: [42, 70], ctr: [1.3, 2.4], cvr: [1.1, 2.2], roi: [1.5, 2.4] },
    imageText: { cpm: [40, 65], ctr: [1.1, 2.0], cvr: [0.9, 1.8], roi: [1.3, 2.1] }
  },
  "宠物用品": {
    shortVideo: { cpm: [35, 55], ctr: [1.8, 3.0], cvr: [2.2, 3.8], roi: [2.0, 3.2] },
    live: { cpm: [32, 50], ctr: [1.5, 2.7], cvr: [1.9, 3.3], roi: [1.8, 2.9] },
    imageText: { cpm: [30, 45], ctr: [1.3, 2.2], cvr: [1.5, 2.5], roi: [1.6, 2.5] }
  },
  "医疗保健": {
    shortVideo: { cpm: [75, 115], ctr: [1.1, 2.0], cvr: [0.6, 1.3], roi: [1.2, 1.9] },
    live: { cpm: [70, 110], ctr: [0.9, 1.7], cvr: [0.5, 1.1], roi: [1.0, 1.7] },
    imageText: { cpm: [65, 105], ctr: [0.8, 1.4], cvr: [0.4, 0.9], roi: [0.9, 1.5] }
  },
  "教育培训": {
    shortVideo: { cpm: [85, 145], ctr: [0.9, 1.5], cvr: [0.4, 0.8], roi: [0.9, 1.6] },
    live: { cpm: [80, 140], ctr: [0.8, 1.3], cvr: [0.3, 0.6], roi: [0.8, 1.4] },
    imageText: { cpm: [75, 135], ctr: [0.7, 1.1], cvr: [0.2, 0.5], roi: [0.7, 1.2] }
  },
  "汽车配件": {
    shortVideo: { cpm: [55, 95], ctr: [1.2, 2.2], cvr: [1.0, 1.8], roi: [1.3, 2.1] },
    live: { cpm: [50, 90], ctr: [1.0, 1.9], cvr: [0.8, 1.5], roi: [1.2, 1.9] },
    imageText: { cpm: [48, 85], ctr: [0.9, 1.6], cvr: [0.7, 1.3], roi: [1.1, 1.7] }
  },
  "其他": {
    shortVideo: { cpm: [30, 50], ctr: [1.5, 2.5], cvr: [1.5, 2.5], roi: [1.5, 2.5] },
    live: { cpm: [28, 45], ctr: [1.3, 2.2], cvr: [1.2, 2.2], roi: [1.3, 2.2] },
    imageText: { cpm: [25, 40], ctr: [1.2, 2.0], cvr: [1.0, 1.8], roi: [1.2, 2.0] }
  }
};

const MATERIAL_TYPE_MAP = {
  "短视频": "shortVideo",
  "直播间": "live",
  "图文": "imageText",
  "商品卡": "imageText"
};

const TODAY = new Date().toISOString().slice(0,10);
function daysAgo(d) { 
  if(!d) return 999;
  const targetDate = new Date(d);
  const now = new Date();
  targetDate.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  return Math.floor((now.getTime()-targetDate.getTime())/86400000);
}
function fmtDate(d) { if(!d) return "—"; const x=new Date(d); return `${x.getMonth()+1}/${x.getDate()}`; }

function calcTier(budgetRange) {
  const tierMap = {
    "0-30万":"D",
    "30-50万":"C",
    "50-100万":"B",
    "100-500万":"A",
    "500万以上":"S"
  };
  return tierMap[budgetRange] || "D";
}
function calcRisk(c) {
  let r=0;
  if(parseFloat(c.roi)<1.5)r+=2;
  if(["观望评估","暂停投放"].includes(c.status))r+=2;
  if(c.status==="已流失")r+=5;
  if((c.daysSinceContact||0)>14)r+=2; else if((c.daysSinceContact||0)>7)r+=1;
  return r>=4?"高":r>=2?"中":"低";
}

const SEED = [
  {id:1,name:"某某美妆旗舰",contact:"王总",phone:"13812341234",industry:"美妆护肤",type:"品牌旗舰店",budgetRange:"50-100万",roi:"3.2",ctr:"3.1",cvr:"2.8",cpm:"22",status:"活跃投放",contactInterval:"每天",lastContact:"2025-04-28",owner:"张伟",tags:"高ROI,稳定消耗",followUps:[{id:1,date:"2025-04-28",author:"张伟",content:"大促后复盘，ROI维持3.2，客户满意，建议5月继续放量。"},{id:2,date:"2025-04-15",author:"张伟",content:"618备战方案已发送，预算拟提升至60万。"}]},
  {id:2,name:"XX服装旗舰店",contact:"李经理",phone:"13956785678",industry:"服装服饰",type:"中小卖家",budgetRange:"0-30万",roi:"1.8",ctr:"2.1",cvr:"1.6",cpm:"14",status:"观望评估",contactInterval:"每周",lastContact:"2025-04-20",owner:"李娜",tags:"价格敏感,需素材优化",followUps:[{id:1,date:"2025-04-20",author:"李娜",content:"客户对ROI有顾虑，表示1.8偏低，需要出优化方案再跟进。"}]},
  {id:3,name:"某某3C代理商",contact:"张总",phone:"18099999999",industry:"3C数码",type:"代理运营商",budgetRange:"100-500万",roi:"2.5",ctr:"2.8",cvr:"2.2",cpm:"28",status:"活跃投放",contactInterval:"2-3天",lastContact:"2025-04-29",owner:"王芳",tags:"批量投放,多账户",followUps:[{id:1,date:"2025-04-29",author:"王芳",content:"新增2个账户投放，本月总消耗预计突破60万。"},{id:2,date:"2025-04-22",author:"王芳",content:"客户反馈CPM偏高，建议调整出价策略，已发邮件。"}]},
  {id:4,name:"新兴食品品牌",contact:"陈老板",phone:"18233333333",industry:"食品饮料",type:"白牌商家",budgetRange:"0-30万",roi:"0.9",ctr:"1.5",cvr:"1.1",cpm:"11",status:"暂停投放",contactInterval:"半月",lastContact:"2025-04-10",owner:"刘洋",tags:"ROI异常,暂停",followUps:[{id:1,date:"2025-04-10",author:"刘洋",content:"ROI持续低于1，客户决定暂停投放，等待素材优化结果。"},{id:2,date:"2025-03-28",author:"刘洋",content:"已给客户出诊断报告，主要问题是素材点击率过低。"}]},
  {id:5,name:"高端家居品牌",contact:"刘总",phone:"18677777777",industry:"家居家装",type:"品牌旗舰店",budgetRange:"30-50万",roi:"2.1",ctr:"2.4",cvr:"2.0",cpm:"18",status:"新开发",contactInterval:"每周",lastContact:"2025-04-27",owner:"陈静",tags:"新开发,潜力大",followUps:[{id:1,date:"2025-04-27",author:"陈静",content:"初次拜访，客户对千川有兴趣，建议先跑小预算测试ROI。"}]},
];

function initClients() {
  return SEED.map(c=>{const d=daysAgo(c.lastContact);return{...c,daysSinceContact:d,tier:calcTier(c.budgetRange),risk:calcRisk({...c,daysSinceContact:d})};});
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function callDeepSeek(apiKey,sys,usr,onChunk,onError) {
  try{
    const res=await fetch("https://api.deepseek.com/v1/chat/completions",{method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},
      body:JSON.stringify({model:"deepseek-chat",max_tokens:2000,stream:true,
        messages:[{role:"system",content:sys},{role:"user",content:usr}]})});
    if(!res.ok){
      const errData=await res.json().catch(()=>({}));
      const errMsg=errData.error?.message||`API请求失败（${res.status}）`;
      onError?.(errMsg);
      return "";
    }
    const reader=res.body.getReader();const dec=new TextDecoder();let full="";
    while(true){const{done,value}=await reader.read();if(done)break;
      for(const line of dec.decode(value).split("\n").filter(l=>l.startsWith("data: "))){
        const data=line.slice(6);if(data==="[DONE]")continue;
        try{const j=JSON.parse(data);const t=j.choices?.[0]?.delta?.content;if(t){full+=t;onChunk(full);}}catch{}
      }
    }
    return full;
  }catch(e){
    onError?.(e.message||"网络请求失败");
    return "";
  }
}

// ─── MINI UI ──────────────────────────────────────────────────────────────────
function Badge({label,c,bg,bd}) {
  return <span style={{fontSize:11,fontWeight:600,color:c,background:bg||c+"18",border:`1px solid ${bd||c+"30"}`,padding:"2px 8px",borderRadius:20,whiteSpace:"nowrap",display:"inline-block"}}>{label}</span>;
}
function Spinner({color="var(--primary)"}) {
  return <span style={{display:"inline-block",width:13,height:13,border:`2px solid ${color}40`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite"}} />;
}
function AiResult({text,loading}) {
  return <div style={{fontSize:13.5,lineHeight:2,color:"var(--t2)",whiteSpace:"pre-wrap"}}>
    {text}
    {loading&&<span style={{animation:"pulse 1s infinite",color:"var(--primary)"}}>▌</span>}
  </div>;
}
const Card=({children,style={}})=><div style={{background:"var(--white)",borderRadius:12,border:"1px solid var(--b1)",boxShadow:"var(--sh)",...style}}>{children}</div>;

function PrimaryBtn({children,onClick,disabled,style={}}) {
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?"var(--b1)":"var(--primary)",border:"none",borderRadius:8,padding:"9px 20px",color:disabled?"var(--t4)":"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:7,boxShadow:disabled?"none":"0 2px 8px rgba(26,86,219,.25)",...style}}>{children}</button>;
}
function GhostBtn({children,onClick,style={}}) {
  return <button onClick={onClick} style={{background:"transparent",border:"1.5px solid var(--b1)",borderRadius:8,padding:"8px 18px",color:"var(--t3)",fontSize:13,fontWeight:500,...style}}>{children}</button>;
}
function DangerBtn({children,onClick,style={}}) {
  return <button onClick={onClick} style={{background:"#fff1f1",border:"1.5px solid #fecaca",borderRadius:8,padding:"8px 14px",color:"#e84d4d",fontSize:12,fontWeight:600,...style}}>{children}</button>;
}

function InputField({label,value,onChange,ph,type="text",opts,maxLength}) {
  return (
    <div>
      <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>{label}</div>
      {opts ?
        <select value={value||""} onChange={onChange}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>
        :<input type={type} value={value||""} onChange={onChange} placeholder={ph} maxLength={maxLength} />
      }
    </div>
  );
}

// ─── CLIENT SEARCH INPUT ──────────────────────────────────────────────────────
function ClientSearch({clients,selectedId,onSelect,placeholder="输入客户名称搜索…"}) {
  const [q,setQ]=useState("");
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(false);
  const ref=useRef(null);
  const inputRef=useRef(null);
  const sel=clients.find(c=>c.id===selectedId);

  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setActive(false);}}
    document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);
  },[]);

  const list=q?clients.filter(c=>[c.name,c.contact||"",c.industry,c.owner||"",c.tags||""].join(" ").toLowerCase().includes(q.toLowerCase())).slice(0,8):clients.slice(0,8);

  function pick(c){onSelect(c.id);setQ("");setOpen(false);setActive(false);}
  function clear(e){e.stopPropagation();onSelect(null);setQ("");}

  if(sel&&!active) return (
    <div style={{background:"var(--pl)",border:"1.5px solid var(--primary)",borderRadius:8,padding:"9px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>{setActive(true);setOpen(true);setTimeout(()=>inputRef.current?.focus(),10);}}>
      <Badge label={TIER_META[sel.tier]?.label} c={TIER_META[sel.tier]?.c} bg={TIER_META[sel.tier]?.bg} bd={TIER_META[sel.tier]?.bd} />
      <span style={{fontWeight:700,color:"var(--primary)",flex:1,fontSize:13}}>{sel.name}</span>
      <span style={{fontSize:11,color:"var(--t3)"}}>{sel.industry} · {sel.budgetRange} · @{sel.owner||"未分配"}</span>
      <button onClick={clear} style={{background:"none",border:"none",color:"var(--t4)",fontSize:18,lineHeight:1}}>×</button>
    </div>
  );

  return (
    <div ref={ref} style={{position:"relative"}}>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"var(--t4)",fontSize:15,pointerEvents:"none"}}>🔍</span>
        <input ref={inputRef} value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} placeholder={placeholder} style={{paddingLeft:34}} />
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--t4)",fontSize:16,cursor:"pointer"}}>×</button>}
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"var(--white)",border:"1.5px solid var(--pm)",borderRadius:10,zIndex:700,maxHeight:280,overflowY:"auto",boxShadow:"var(--shl)",animation:"slideDown .15s ease"}}>
          {list.length===0&&<div style={{padding:"14px 16px",color:"var(--t4)",fontSize:13,textAlign:"center"}}>没找到，换个关键词试试</div>}
          {list.map(c=>(
            <div key={c.id} onClick={()=>pick(c)} style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid var(--s1)",display:"flex",alignItems:"center",gap:10}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--pl)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Badge label={TIER_META[c.tier]?.label} c={TIER_META[c.tier]?.c} bg={TIER_META[c.tier]?.bg} bd={TIER_META[c.tier]?.bd} />
              <div style={{flex:1}}>
                <span style={{fontWeight:600,fontSize:13}}>{c.name}</span>
                <span style={{fontSize:11,color:"var(--t3)",marginLeft:8}}>{c.contact} · {c.industry}</span>
              </div>
              <Badge label={c.status} c={STATUS_META[c.status]?.c} bg={STATUS_META[c.status]?.bg} bd={STATUS_META[c.status]?.bd} />
              <span style={{fontSize:11,color:"var(--t4)",minWidth:40,textAlign:"right"}}>ROI {c.roi||"—"}</span>
              <span style={{fontSize:11,color:"var(--t4)"}}>@{c.owner||"—"}</span>
            </div>
          ))}
          {!q&&<div style={{padding:"7px 14px",fontSize:11,color:"var(--t4)",borderTop:"1px solid var(--s1)"}}>输入关键词可精确搜索，支持客户名/行业/归属销售</div>}
        </div>
      )}
    </div>
  );
}

// ─── SELECTED CLIENT CARD ─────────────────────────────────────────────────────
function SelCard({client}) {
  if(!client) return null;
  const tm=TIER_META[client.tier],sm=STATUS_META[client.status];
  const lastFu=[...(client.followUps||[])].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  return (
    <div style={{background:"var(--pl)",border:"1.5px solid var(--pm)",borderRadius:9,padding:"11px 14px",marginTop:10}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
        <Badge label={tm?.label} c={tm?.c} bg={tm?.bg} bd={tm?.bd} />
        <Badge label={client.status} c={sm?.c} bg={sm?.bg} bd={sm?.bd} />
        {[
          {l:"行业",v:client.industry},{l:"预算",v:client.budgetRange},
          {l:"ROI",v:client.roi||"—"},{l:"CTR",v:client.ctr?client.ctr+"%":"—"},
          {l:"CVR",v:client.cvr?client.cvr+"%":"—"},{l:"归属",v:client.owner||"未分配"},
          {l:"风险",v:client.risk,c:RISK_C[client.risk]},
        ].map(m=>(
          <span key={m.l} style={{fontSize:11,color:"var(--t3)"}}>
            {m.l}：<span style={{fontWeight:600,color:m.c||"var(--t1)"}}>{m.v}</span>
          </span>
        ))}
      </div>
      {lastFu&&<div style={{fontSize:11,color:"var(--t3)",borderTop:"1px solid var(--pm)",paddingTop:7,lineHeight:1.6}}>
        📝 最新跟进（{fmtDate(lastFu.date)} {lastFu.author}）：{lastFu.content}
      </div>}
    </div>
  );
}

// ─── FOLLOW-UP TIMELINE ───────────────────────────────────────────────────────
function Timeline({followUps,onAdd,currentUser}) {
  const [text,setText]=useState("");
  const [show,setShow]=useState(false);
  const sorted=[...(followUps||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
  function add(){if(!text.trim())return;onAdd({id:Date.now(),date:TODAY,author:currentUser,content:text.trim()});setText("");setShow(false);}
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:12,fontWeight:600,color:"var(--t2)"}}>跟进记录 ({sorted.length})</span>
        <PrimaryBtn style={{padding:"5px 12px",fontSize:12}} onClick={()=>setShow(s=>!s)}>+ 新增记录</PrimaryBtn>
      </div>
      {show&&(
        <div style={{background:"var(--pl)",border:"1.5px solid var(--pm)",borderRadius:8,padding:12,marginBottom:14,animation:"slideDown .15s ease"}}>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="记录跟进情况、客户反馈、下一步行动计划…" rows={2} style={{marginBottom:8}} autoFocus />
          <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:"var(--t3)"}}>记录人：{currentUser} · {fmtDate(TODAY)}</span>
            <div style={{display:"flex",gap:8}}>
              <GhostBtn style={{padding:"5px 12px",fontSize:12}} onClick={()=>{setShow(false);setText("");}}>取消</GhostBtn>
              <PrimaryBtn style={{padding:"5px 14px",fontSize:12}} onClick={add} disabled={!text.trim()}>保存</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {sorted.length===0&&!show&&<div style={{textAlign:"center",padding:"24px 0",color:"var(--t4)",fontSize:13}}>暂无跟进记录，点击上方新增</div>}
      <div style={{position:"relative"}}>
        {sorted.length>0&&<div style={{position:"absolute",left:11,top:12,bottom:12,width:2,background:"var(--s2)",borderRadius:2}} />}
        {sorted.map((fu,i)=>(
          <div key={fu.id} style={{display:"flex",gap:12,marginBottom:14,position:"relative",animation:"fadeUp .2s ease"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:i===0?"var(--primary)":"var(--s2)",border:`2px solid ${i===0?"var(--primary)":"var(--b2)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1,marginTop:4}}>
              <span style={{fontSize:10,color:i===0?"#fff":"var(--t3)",fontWeight:700}}>{(fu.author||"?")[0]}</span>
            </div>
            <div style={{flex:1,background:"var(--white)",border:"1px solid var(--b1)",borderRadius:8,padding:"10px 12px",boxShadow:"var(--sh)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{fu.author}</span>
                <span style={{fontSize:11,color:"var(--t4)"}}>{fmtDate(fu.date)}</span>
              </div>
              <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.7}}>{fu.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CLIENT DRAWER ────────────────────────────────────────────────────────────
function Drawer({client,onClose,onSave,currentUser,salesNames}) {
  const [form,setForm]=useState(()=>({...client}));
  const [tab,setTab]=useState("info");
  
  const handleChange=(k,v)=>setForm(f=>({...f,[k]:v}));

  function save(){
    const phoneErr=form.phone&&!/^1[3-9]\d{9}$/.test(form.phone);
    if(phoneErr){alert("手机号格式不正确，应为11位数字");return;}
    const d=daysAgo(form.lastContact);
    const tier=calcTier(form.budgetRange);
    onSave({...form,daysSinceContact:d,tier,risk:calcRisk({...form,daysSinceContact:d})});
  }
  function addFu(fu){
    const updated={...form,followUps:[...(form.followUps||[]),fu],lastContact:TODAY};
    setForm(updated);
    const d=daysAgo(TODAY);
    onSave({...updated,daysSinceContact:d,tier:calcTier(updated.budgetRange),risk:calcRisk({...updated,daysSinceContact:d})});
  }

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",animation:"fadeIn .2s ease"}}>
      <div style={{flex:1,background:"rgba(15,23,42,.3)",backdropFilter:"blur(2px)"}} onClick={onClose} />
      <div style={{width:"min(580px,96vw)",background:"var(--white)",borderLeft:"1px solid var(--b1)",boxShadow:"var(--shl)",display:"flex",flexDirection:"column",height:"100vh"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--b1)",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:"var(--t1)",marginBottom:5}}>{client.name}</div>
              <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                <Badge label={TIER_META[client.tier]?.label} c={TIER_META[client.tier]?.c} bg={TIER_META[client.tier]?.bg} bd={TIER_META[client.tier]?.bd} />
                <Badge label={client.status} c={STATUS_META[client.status]?.c} bg={STATUS_META[client.status]?.bg} bd={STATUS_META[client.status]?.bd} />
                <span style={{fontSize:11,color:"var(--t3)"}}>归属：<b style={{color:"var(--t1)"}}>{client.owner||"未分配"}</b></span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:"var(--t4)",padding:4,lineHeight:1}}>×</button>
          </div>
          <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--b1)",marginTop:4}}>
            {[{k:"info",l:"基本信息"},{k:"data",l:"投放数据"},{k:"fu",l:`跟进记录 (${(form.followUps||[]).length})`}].map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{background:"none",border:"none",borderBottom:`2.5px solid ${tab===t.k?"var(--primary)":"transparent"}`,padding:"8px 16px",color:tab===t.k?"var(--primary)":"var(--t3)",fontSize:13,fontWeight:tab===t.k?600:400,marginBottom:-1}}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:20}}>
          {tab==="info"&&(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                <InputField label="客户名称 *" value={form.name} onChange={e=>handleChange("name",e.target.value)} ph="店铺/公司名" />
                <InputField label="销售归属" value={form.owner} onChange={e=>handleChange("owner",e.target.value)} opts={salesNames} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                <InputField label="对接人" value={form.contact} onChange={e=>handleChange("contact",e.target.value)} ph="联系人姓名" />
                <InputField label="联系方式（手机号）" value={form.phone} onChange={e=>handleChange("phone",e.target.value)} ph="11位手机号" maxLength={11} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                <InputField label="行业品类" value={form.industry} onChange={e=>handleChange("industry",e.target.value)} opts={INDUSTRIES} />
                <InputField label="客户类型" value={form.type} onChange={e=>handleChange("type",e.target.value)} opts={CLIENT_TYPES} />
                <InputField label="月预算规模" value={form.budgetRange} onChange={e=>handleChange("budgetRange",e.target.value)} opts={BUDGET_RANGES} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                <InputField label="当前状态" value={form.status} onChange={e=>handleChange("status",e.target.value)} opts={STATUSES} />
                <InputField label="跟进频率" value={form.contactInterval} onChange={e=>handleChange("contactInterval",e.target.value)} opts={CONTACT_INTERVALS} />
                <div>
                  <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>最近联系日期</div>
                  <input type="date" value={form.lastContact||TODAY} max={TODAY} onChange={e=>handleChange("lastContact",e.target.value)} />
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>标签（逗号分隔）</div>
                <input value={form.tags||""} onChange={e=>handleChange("tags",e.target.value)} placeholder="如：高ROI,大促冲量,素材优化" />
              </div>
            </div>
          )}
          {tab==="data"&&(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{background:"var(--s1)",borderRadius:8,padding:"9px 12px",fontSize:12,color:"var(--t3)"}}>
                💡 投放数据建议每次跟进后更新，用于AI诊断分析更精准
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                <InputField label="ROI 投产比" value={form.roi} onChange={e=>handleChange("roi",e.target.value)} ph="如 2.5" type="number" />
                <InputField label="CTR 点击率 %" value={form.ctr} onChange={e=>handleChange("ctr",e.target.value)} ph="如 2.8" type="number" />
                <InputField label="CVR 转化率 %" value={form.cvr} onChange={e=>handleChange("cvr",e.target.value)} ph="如 2.0" type="number" />
                <InputField label="CPM 千次曝光（元）" value={form.cpm} onChange={e=>handleChange("cpm",e.target.value)} ph="如 18" type="number" />
              </div>
              <div style={{background:"var(--pl)",border:"1px solid var(--pm)",borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:"var(--t3)",marginBottom:6}}>自动评估层级</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <Badge label={TIER_META[calcTier(form.budgetRange)]?.label} c={TIER_META[calcTier(form.budgetRange)]?.c} bg={TIER_META[calcTier(form.budgetRange)]?.bg} bd={TIER_META[calcTier(form.budgetRange)]?.bd} />
                  <span style={{fontSize:11,color:"var(--t3)"}}>等级由预算规模直接决定</span>
                </div>
              </div>
            </div>
          )}
          {tab==="fu"&&<Timeline followUps={form.followUps} onAdd={addFu} currentUser={currentUser} />}
        </div>

        {tab!=="fu"&&(
          <div style={{padding:"13px 20px",borderTop:"1px solid var(--b1)",display:"flex",gap:9,justifyContent:"flex-end",flexShrink:0}}>
            <GhostBtn onClick={onClose}>取消</GhostBtn>
            <PrimaryBtn onClick={()=>{save();onClose();}}>保存修改</PrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADD MODAL ────────────────────────────────────────────────────────────────
function AddModal({onSave,onClose,currentUser,salesNames}) {
  const [form,setForm]=useState({name:"",contact:"",phone:"",industry:"美妆护肤",type:"中小卖家",budgetRange:"0-30万",roi:"",ctr:"",cvr:"",cpm:"",status:"新开发",contactInterval:"每周",lastContact:TODAY,owner:currentUser,tags:"",followUps:[]});
  const [firstNote,setFirstNote]=useState("");
  
  const handleChange=(k,v)=>setForm(f=>({...f,[k]:v}));
  
  function save(){
    if(!form.name.trim())return;
    const phoneErr=form.phone&&!/^1[3-9]\d{9}$/.test(form.phone);
    if(phoneErr){alert("手机号格式不正确，应为11位数字");return;}
    const fus=firstNote.trim()?[{id:Date.now(),date:TODAY,author:currentUser,content:firstNote.trim()}]:[];
    const d=daysAgo(form.lastContact);
    const tier=calcTier(form.budgetRange);
    const data={...form,id:Date.now(),followUps:fus,daysSinceContact:d,tier,risk:calcRisk({...form,daysSinceContact:d})};
    onSave(data);onClose();
  }
  
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",backdropFilter:"blur(2px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--white)",borderRadius:14,width:"min(580px,96vw)",maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"var(--shl)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--b1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontWeight:700,fontSize:15}}>新增客户</div><div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>标 * 为必填，其余可后续补充</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:"var(--t4)"}}>×</button>
        </div>
        <div style={{overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:13}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
            <InputField label="客户名称 *" value={form.name} onChange={e=>handleChange("name",e.target.value)} ph="店铺/公司名称" />
            <InputField label="销售归属 *" value={form.owner} onChange={e=>handleChange("owner",e.target.value)} opts={salesNames} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
            <InputField label="对接人" value={form.contact} onChange={e=>handleChange("contact",e.target.value)} ph="联系人姓名" />
            <InputField label="联系方式（手机号）" value={form.phone} onChange={e=>handleChange("phone",e.target.value)} ph="11位手机号" maxLength={11} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
            <InputField label="行业品类" value={form.industry} onChange={e=>handleChange("industry",e.target.value)} opts={INDUSTRIES} />
            <InputField label="客户类型" value={form.type} onChange={e=>handleChange("type",e.target.value)} opts={CLIENT_TYPES} />
            <InputField label="月预算规模" value={form.budgetRange} onChange={e=>handleChange("budgetRange",e.target.value)} opts={BUDGET_RANGES} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
            <InputField label="当前状态" value={form.status} onChange={e=>handleChange("status",e.target.value)} opts={STATUSES} />
            <InputField label="跟进频率" value={form.contactInterval} onChange={e=>handleChange("contactInterval",e.target.value)} opts={CONTACT_INTERVALS} />
            <div>
              <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>最近联系日期</div>
              <input type="date" value={form.lastContact} max={TODAY} onChange={e=>handleChange("lastContact",e.target.value)} />
            </div>
          </div>
          <div style={{borderTop:"1px solid var(--b1)",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",letterSpacing:".06em",textTransform:"uppercase",marginBottom:11}}>投放数据（选填）</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
              <InputField label="ROI" value={form.roi} onChange={e=>handleChange("roi",e.target.value)} ph="2.5" type="number" />
              <InputField label="CTR%" value={form.ctr} onChange={e=>handleChange("ctr",e.target.value)} ph="2.8" type="number" />
              <InputField label="CVR%" value={form.cvr} onChange={e=>handleChange("cvr",e.target.value)} ph="2.0" type="number" />
              <InputField label="CPM元" value={form.cpm} onChange={e=>handleChange("cpm",e.target.value)} ph="18" type="number" />
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>标签</div>
            <input value={form.tags||""} onChange={e=>handleChange("tags",e.target.value)} placeholder="如：高ROI,大促冲量,潜力大（逗号分隔）" />
          </div>
          <div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>首次跟进记录（选填）</div>
            <textarea rows={2} value={firstNote} onChange={e=>setFirstNote(e.target.value)} placeholder="记录初次接触情况、客户意向、下一步计划…" />
          </div>
        </div>
        <div style={{padding:"13px 20px",borderTop:"1px solid var(--b1)",display:"flex",gap:9,justifyContent:"flex-end"}}>
          <GhostBtn onClick={onClose}>取消</GhostBtn>
          <PrimaryBtn onClick={save} disabled={!form.name.trim()}>新增客户</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
function CRMPage({clients,onAdd,onEdit,onDelete,currentUser,salesNames}) {
  const [q,setQ]=useState("");
  const [ft,setFt]=useState("全部");
  const [fs,setFs]=useState("全部");
  const [fo,setFo]=useState("全部");
  const [showAdd,setShowAdd]=useState(false);
  const [drawer,setDrawer]=useState(null);
  const [delId,setDelId]=useState(null);
  const [page,setPage]=useState(1);
  const [pageSize]=useState(20);

  const fil=clients.filter(c=>{
    const ms=!q||[c.name,c.phone||""].join(" ").toLowerCase().includes(q.toLowerCase());
    const tierMatch=ft==="全部"||c.tier===ft;
    const statusMatch=fs==="全部"||c.status===fs;
    const ownerMatch=fo==="全部"||c.owner===fo;
    return ms&&tierMatch&&statusMatch&&ownerMatch;
  });
  
  const totalPages=Math.ceil(fil.length/pageSize);
  const paged=fil.slice((page-1)*pageSize,page*pageSize);

  const stats={total:clients.length,S:clients.filter(c=>c.tier==="S").length,active:clients.filter(c=>c.status==="活跃投放").length,risk:clients.filter(c=>c.risk==="高").length,overdue:clients.filter(c=>(c.daysSinceContact||0)>7).length};

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:18}}>
        {[{l:"客户总数",v:stats.total,c:"var(--primary)",ic:"📋"},{l:"S级客户",v:stats.S,c:"var(--gold)",ic:"👑"},{l:"活跃投放",v:stats.active,c:"var(--green)",ic:"🔥"},{l:"流失风险",v:stats.risk,c:"var(--accent)",ic:"⚠️"},{l:"7天未联系",v:stats.overdue,c:"var(--orange)",ic:"📅"}].map(s=>(
          <Card key={s.l} style={{padding:"13px 16px"}}>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:5}}>{s.ic} {s.l}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.v}</div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card style={{padding:"12px 16px",marginBottom:12}}>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:"0 0 200px"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--t4)",fontSize:13,pointerEvents:"none"}}>🔍</span>
            <input value={q} onChange={e=>{setQ(e.target.value);setPage(1);}} placeholder="搜索客户名称/手机号" style={{paddingLeft:30,fontSize:12}} />
          </div>
          <div style={{display:"flex",gap:5}}>
            {["全部","S","A","B","C"].map(t=>(
              <button key={t} onClick={()=>{setFt(t);setPage(1);}} style={{background:ft===t?(t==="全部"?"var(--pl)":TIER_META[t]?.bg||"var(--s1)"):"var(--s1)",border:`1.5px solid ${ft===t?(t==="全部"?"var(--primary)":TIER_META[t]?.bd||"var(--b1)"):"var(--b1)"}`,borderRadius:6,padding:"5px 10px",color:ft===t?(t==="全部"?"var(--primary)":TIER_META[t]?.c||"var(--t2)"):"var(--t3)",fontSize:12,fontWeight:ft===t?600:400}}>
                {t==="全部"?"全部":`${t}级`}
              </button>
            ))}
          </div>
          <select value={fs} onChange={e=>{setFs(e.target.value);setPage(1);}} style={{width:"auto",padding:"6px 10px",fontSize:12}}>
            <option>全部</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={fo} onChange={e=>{setFo(e.target.value);setPage(1);}} style={{width:"auto",padding:"6px 10px",fontSize:12}}>
            <option value="全部">全部归属</option>
            {salesNames.map(o=>(<option key={o} value={o}>{o}</option>))}
          </select>
          <PrimaryBtn style={{marginLeft:"auto",padding:"7px 16px",fontSize:12}} onClick={()=>setShowAdd(true)}>+ 新增客户</PrimaryBtn>
        </div>
      </Card>

      {/* Table */}
      <Card style={{overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1.2fr .7fr .9fr .7fr .8fr .9fr .7fr .9fr .8fr 70px",padding:"9px 16px",background:"var(--s1)",fontSize:11,color:"var(--t3)",fontWeight:600,letterSpacing:".04em",borderBottom:"1px solid var(--b1)"}}>
          <span>公司名称</span><span>联系人</span><span>联系方式</span><span>归属销售</span><span>行业</span><span>预算/ROI</span><span>层级</span><span>状态</span><span>最近联系</span><span style={{textAlign:"center"}}>操作</span>
        </div>
        {paged.length===0&&<div style={{padding:32,textAlign:"center",color:"var(--t4)",fontSize:13}}>暂无匹配客户</div>}
        {paged.map((c,i)=>(
          <div key={c.id} onClick={()=>setDrawer(c)}
            style={{display:"grid",gridTemplateColumns:"1.2fr .7fr .9fr .7fr .8fr .9fr .7fr .9fr .8fr 70px",padding:"11px 16px",borderBottom:"1px solid var(--s1)",cursor:"pointer",background:i%2?"var(--bg)":"var(--white)",alignItems:"center",transition:"background .1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="var(--pl)"}
            onMouseLeave={e=>e.currentTarget.style.background=i%2?"var(--bg)":"var(--white)"}>
            <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>{c.name}</span>
            <span style={{fontSize:12,color:"var(--t2)"}}>{c.contact||"—"}</span>
            <span style={{fontSize:12,color:"var(--t2)"}}>{c.phone||"—"}</span>
            <span style={{fontSize:12,color:"var(--t2)"}}>{c.owner||"—"}</span>
            <span style={{fontSize:12,color:"var(--t2)"}}>{c.industry}</span>
            <div>
              <div style={{fontSize:12,color:"var(--t2)"}}>{c.budgetRange}</div>
              <div style={{fontSize:12,fontWeight:700,color:parseFloat(c.roi)>=2.5?"var(--green)":parseFloat(c.roi)>=1.5?"var(--gold)":"var(--accent)"}}>ROI {c.roi||"—"}</div>
            </div>
            <Badge label={TIER_META[c.tier]?.label} c={TIER_META[c.tier]?.c} bg={TIER_META[c.tier]?.bg} bd={TIER_META[c.tier]?.bd} />
            <Badge label={c.status} c={STATUS_META[c.status]?.c} bg={STATUS_META[c.status]?.bg} bd={STATUS_META[c.status]?.bd} />
            <div>
              <div style={{fontSize:12,color:(c.daysSinceContact||0)>14?"var(--accent)":(c.daysSinceContact||0)>7?"var(--gold)":"var(--t2)"}}>
                {c.daysSinceContact===0?"今天":`${c.daysSinceContact}天前`}
              </div>
              <div style={{fontSize:10,color:RISK_C[c.risk],marginTop:1}}>风险 {c.risk}</div>
            </div>
            <div style={{display:"flex",gap:5,justifyContent:"center"}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setDrawer(c)} style={{background:"var(--pl)",border:"1px solid var(--pm)",borderRadius:6,padding:"4px 9px",color:"var(--primary)",fontSize:11,fontWeight:600}}>编辑</button>
              <button onClick={()=>setDelId(c.id)} style={{background:"#fff1f1",border:"1px solid #fecaca",borderRadius:6,padding:"4px 7px",color:"#e84d4d",fontSize:11}}>删</button>
            </div>
          </div>
        ))}
      </Card>
      <div style={{marginTop:9,fontSize:11,color:"var(--t3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{fil.length} / {clients.length} 位客户 · 点击行查看详情及跟进记录</span>
        {totalPages>1&&(
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{background:page===1?"var(--s1)":"var(--pl)",border:`1.5px solid ${page===1?"var(--b1)":"var(--primary)"}`,borderRadius:6,padding:"5px 12px",color:page===1?"var(--t4)":"var(--primary)",fontSize:12,fontWeight:600,disabled:page===1}}>上一页</button>
            <span style={{fontSize:12,color:"var(--t2)"}}>第 {page} / {totalPages} 页</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} style={{background:page===totalPages?"var(--s1)":"var(--pl)",border:`1.5px solid ${page===totalPages?"var(--b1)":"var(--primary)"}`,borderRadius:6,padding:"5px 12px",color:page===totalPages?"var(--t4)":"var(--primary)",fontSize:12,fontWeight:600}}>下一页</button>
          </div>
        )}
      </div>

      {delId&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Card style={{padding:28,width:300,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:10}}>🗑️</div>
            <div style={{fontWeight:700,marginBottom:6}}>确认删除该客户？</div>
            <div style={{fontSize:12,color:"var(--t3)",marginBottom:20}}>删除后不可恢复，跟进记录将一并清除</div>
            <div style={{display:"flex",gap:9}}>
              <GhostBtn style={{flex:1}} onClick={()=>setDelId(null)}>取消</GhostBtn>
              <button onClick={()=>{onDelete(delId);setDelId(null);}} style={{flex:1,background:"var(--accent)",border:"none",borderRadius:8,padding:"8px",color:"#fff",fontSize:13,fontWeight:700}}>确认删除</button>
            </div>
          </Card>
        </div>
      )}
      {showAdd&&<AddModal onSave={onAdd} onClose={()=>setShowAdd(false)} currentUser={currentUser.name} salesNames={salesNames} />}
      {drawer&&<Drawer client={drawer} onClose={()=>setDrawer(null)} onSave={c=>{onEdit(c);setDrawer(c);}} currentUser={currentUser.name} salesNames={salesNames} />}
    </div>
  );
}

// ─── TOOL WRAPPER ─────────────────────────────────────────────────────────────
function ToolBlock({clients,selId,onSel,ph}) {
  const client=clients.find(c=>c.id===selId);
  return (
    <Card style={{padding:16,marginBottom:16}}>
      <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:8,letterSpacing:".05em"}}>▸ 从客户管理系统搜索选择客户</div>
      <ClientSearch clients={clients} selectedId={selId} onSelect={onSel} placeholder={ph} />
      {client&&<SelCard client={client} />}
    </Card>
  );
}

// ─── TOOL 1: 话术 ─────────────────────────────────────────────────────────────
function ScriptTool({clients,apiKey,currentUser}) {
  const [selId,setSelId]=useState(null);
  const [scene,setScene]=useState("首次开拓");
  const [extra,setExtra]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  const SCENES=["首次开拓","复购提升","预算扩量","竞品切换","异议处理","活动冲量","续签挽留"];
  const client=clients.find(c=>c.id===selId);

  async function gen() {
    if(!client)return;setLoading(true);setResult("");
    const lastFu=[...(client.followUps||[])].sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
    const sys=`你是一名长期服务于抖音电商行业的专业广告销售顾问。

你主要服务：
- 抖音电商商家
- 千川广告投放客户
- 收量型商家
- ROI优化型商家

你的核心目标：
在"真实、专业、可信、合规"的前提下，帮助销售提升客户沟通效率，并促成下一步动作：加微信、获取店铺信息、预约沟通、邀约面谈、获取投放数据、推进测试合作。

# 一、你的身份边界（非常重要）
你不是公司老板，你也不是商务负责人。你只是"专业广告销售顾问"。
你无权：承诺广告效果、承诺ROI、承诺GMV、承诺起量、承诺爆单、承诺平台特殊资源、承诺返点政策、承诺补贴、承诺免费服务、承诺代运营、承诺广告费用承担。
涉及以上问题时，必须使用："具体需要结合账户情况评估"、"需要运营团队进一步确认"、"会根据实际投放情况制定方案"。

# 二、话术风格要求
输出风格：专业、有行业感、有真实投放经验感、逻辑清晰、不夸张、不吹嘘、不油腻、不鸡血、不像培训机构。
禁止：绝对化承诺、虚假效果描述、恐吓客户、恶意攻击竞对、编造平台资源、编造成功案例、过度营销。

# 三、千川行业理解
你需要理解：千川广告本质是"素材+人群+商品+转化链路"的综合结果。不同商家问题不同：有些是素材问题、有些是模型问题、有些是投产结构问题、有些是直播承接问题、有些是转化链路问题。因此你不能简单粗暴承诺效果，而是需要帮助客户"分析问题+建立测试预期"。

# 四、正确销售逻辑
你的目标不是"立刻成交"。而是：1建立专业感、2建立信任感、3识别客户问题、4放大客户当前卡点、5给出合理方向、6推进下一步动作。

# 五、输出格式要求
请严格按照以下结构输出：
【客户类型判断】（客户当前更像什么类型）
【客户核心问题】（当前最大痛点）
【推荐沟通策略】（应该怎么切）
【销售话术】（直接可发）
【下一步推进动作】（怎么推进加微信/预约）

# 六、敏感规则（必须遵守）
禁止出现：保证起量、保ROI、包消耗、广告费我们出、免费代投、免费陪跑、平台内部资源、特殊白名单、官方关系、必赚、一定赚钱、保本。
如果涉及类似场景，自动改写为："可以先小预算测试"、"先验证模型"、"根据实际数据逐步优化"、"优先降低测试成本"。`;
    const usr=`根据以下真实客户档案，生成${scene}场景话术：

客户信息：
- 客户名称：${client.name}
- 联系人：${client.contact||"负责人"}
- 行业：${client.industry}
- 客户类型：${client.type}
- 月预算：${client.budgetRange}
- 投放数据：ROI ${client.roi||"未知"}，CTR ${client.ctr||"未知"}%，CVR ${client.cvr||"未知"}%
- 当前状态：${client.status}
- 客户等级：${client.tier}级
- 风险评级：${client.risk}
- 归属销售：${client.owner||"未知"}
- 跟进频率：${client.contactInterval}
- 最近联系：${client.daysSinceContact===0?"今天":`${client.daysSinceContact}天前`}
- 最新跟进内容：${lastFu?lastFu.content:"暂无"}
- 客户标签：${client.tags||"无"}
${extra?`补充背景：${extra}`:""}

请根据以上客户档案信息，结合${scene}场景，生成符合要求的销售话术。

注意：
1. 输出内容只用中文，不要加任何符号标记
2. 严格按照上方规定的五部分结构输出
3. 话术必须真实、专业、合规，不承诺效果`;
    await callDeepSeek(apiKey,sys,usr,t=>{setResult(t);if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},err=>{setResult(`错误：${err}`);});
    setLoading(false);
  }

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <ToolBlock clients={clients} selId={selId} onSel={setSelId} ph="输入客户名/联系人/行业搜索…" />
      {!apiKey&&<div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#9a3412",marginBottom:14}}>⚠️ 请在右上角配置 DeepSeek API Key 后使用 AI 功能</div>}
      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card style={{padding:15}}>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:10}}>销售场景</div>
            {SCENES.map(s=>(
              <button key={s} onClick={()=>setScene(s)} style={{display:"block",width:"100%",background:scene===s?"var(--pl)":"transparent",border:`1.5px solid ${scene===s?"var(--primary)":"transparent"}`,borderRadius:7,padding:"7px 11px",color:scene===s?"var(--primary)":"var(--t2)",fontSize:12,fontWeight:scene===s?600:400,textAlign:"left",marginBottom:3}}>
                {scene===s?"▶ ":""}{s}
              </button>
            ))}
          </Card>
          <Card style={{padding:13}}>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:7}}>补充背景（选填）</div>
            <textarea value={extra} onChange={e=>setExtra(e.target.value)} placeholder="如：刚结束618大促、ROI突降…" rows={3} style={{fontSize:12}} />
          </Card>
          <PrimaryBtn onClick={gen} disabled={loading||!client} style={{width:"100%",justifyContent:"center",padding:"10px"}}>
            {loading?<><Spinner color="#fff" />生成中…</>:"✦ 生成专属话术"}
          </PrimaryBtn>
        </div>
        <Card style={{padding:20,minHeight:420,maxHeight:500,overflowY:"auto"}} ref={ref}>
          {!result&&!loading?(<div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"var(--t4)"}}>
            <div style={{fontSize:44,marginBottom:12}}>💬</div>
            <div style={{fontSize:13,textAlign:"center",lineHeight:2,color:"var(--t3)"}}>搜索选择客户，选择销售场景<br/>AI基于真实数据生成专属话术</div>
          </div>):<AiResult text={result} loading={loading} />}
        </Card>
      </div>
    </div>
  );
}

// ─── TOOL 2: 诊断 ─────────────────────────────────────────────────────────────
function AnalysisTool({clients,apiKey,currentUser}) {
  const [selId,setSelId]=useState(null);
  const [type,setType]=useState("新客阶段分析");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  const TYPES=["新客阶段分析","试投阶段分析","稳定投放分析","扩量阶段分析","流失预警分析","全生命周期诊断"];
  const client=clients.find(c=>c.id===selId);

  async function analyze(){
    if(!client)return;
    setLoading(true);setResult("");
    const industryBench=INDUSTRY_BENCHMARKS[client.industry]||INDUSTRY_BENCHMARKS["其他"];
    const bench=industryBench.shortVideo;
    const fuHist=[...(client.followUps||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3).map(fu=>`${fmtDate(fu.date)} ${fu.author}: ${fu.content}`).join("\n");
    const sys="你是一名拥有丰富经验的千川广告客户分析与商业决策专家，专注于抖音电商投放客户的成交概率判断与价值分层。你深度理解千川广告客户生命周期（新客、试投、稳定投放、扩量期、流失期）、客户投放行为数据含义（消耗、ROI、点击率、转化率）、客户商业意图识别（测试型扩量型观望型低意向型）、电销团队成交转化路径设计。你的能力包括：快速判断客户当前阶段与真实需求、识别客户是否具备可成交价值、输出客户分层ABCD等级、提供下一步最优动作建议（跟进策略放弃强转化）。你的输出要求：必须基于千川广告业务逻辑判断，必须明确给出客户等级与理由，必须输出销售下一步动作建议，判断必须果断避免模糊结论。";
    const usr=`对以下客户进行${type}：

客户档案信息：
- 客户名称：${client.name}
- 行业品类：${client.industry}
- 客户类型：${client.type}
- 归属销售：${client.owner||"未知"}

投放数据表现：
- ROI：${client.roi||"未知"}（行业基准${bench.roi[0]}-${bench.roi[1]}）
- CTR点击率：${client.ctr||"未知"}%（行业基准${bench.ctr[0]}-${bench.ctr[1]}%）
- CVR转化率：${client.cvr||"未知"}%（行业基准${bench.cvr[0]}-${bench.cvr[1]}%）
- CPM千次曝光成本：${client.cpm||"未知"}元（行业基准${bench.cpm[0]}-${bench.cpm[1]}元）

客户状态：
- 月预算规模：${client.budgetRange}
- 当前状态：${client.status}
- 客户等级：${client.tier}级
- 风险评级：${client.risk}
- 最近联系：${client.daysSinceContact===0?"今天":`${client.daysSinceContact}天前`}
- 跟进频率：${client.contactInterval}
- 客户标签：${client.tags||"无"}

最近3条跟进记录：
${fuHist||"暂无跟进记录"}

请输出完整的${type}报告，包含：
1. 客户当前生命周期阶段判断（新客试投稳定扩量流失）
2. 客户真实需求识别（测试型扩量型观望型低意向型）
3. 客户成交价值评估（是否具备可成交价值）
4. 客户等级判定（A/B/C/D级）及判定依据
5. 投放数据与行业基准对比分析
6. 销售下一步最优动作建议（具体可执行）
7. 预计成交概率评估（高/中/低）
8. 需重点关注的风险点

注意：输出内容只用中文，不要加任何符号标记，直接输出分析内容。`;
    await callDeepSeek(apiKey,sys,usr,t=>{setResult(t);if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},err=>{setResult(`错误：${err}`);setLoading(false);});
    setLoading(false);
  }

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <ToolBlock clients={clients} selId={selId} onSel={setSelId} ph="输入客户名/归属销售搜索…" />
      {!apiKey&&<div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#9a3412",marginBottom:14}}>⚠️ 请在右上角配置 DeepSeek API Key 后使用 AI 功能</div>}
      <div style={{display:"grid",gridTemplateColumns:"190px 1fr",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Card style={{padding:14}}>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:9}}>分析类型</div>
            {TYPES.map(t=>(
              <button key={t} onClick={()=>setType(t)} style={{display:"block",width:"100%",background:type===t?"var(--pl)":"transparent",border:`1.5px solid ${type===t?"var(--primary)":"transparent"}`,borderRadius:7,padding:"7px 10px",color:type===t?"var(--primary)":"var(--t2)",fontSize:12,fontWeight:type===t?600:400,textAlign:"left",marginBottom:3}}>
                {type===t?"▶ ":""}{t}
              </button>
            ))}
          </Card>
          <PrimaryBtn onClick={analyze} disabled={loading||!client||!apiKey} style={{width:"100%",justifyContent:"center",padding:"10px"}}>
            {loading?<><Spinner color="#fff" />分析中…</>:"🎯 开始分析"}
          </PrimaryBtn>
          <div style={{fontSize:10,color:"var(--t4)",marginTop:6,textAlign:"center"}}>
            状态: API Key {apiKey?"✓已配置":"✗未配置"} | 客户 {client?"✓已选择":"✗未选择"}
          </div>
        </div>
        <Card style={{padding:20,minHeight:380,maxHeight:480,overflowY:"auto"}} ref={ref}>
          {!result&&!loading?(<div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"var(--t4)"}}>
            <div style={{fontSize:44,marginBottom:12}}>📊</div>
            <div style={{fontSize:13,textAlign:"center",lineHeight:2,color:"var(--t3)"}}>选择客户后点击分析<br/>AI结合跟进历史给出专属诊断报告</div>
          </div>):<AiResult text={result} loading={loading} />}
        </Card>
      </div>
    </div>
  );
}

// ─── TOOL 3: 素材 ─────────────────────────────────────────────────────────────
function MaterialTool({clients,apiKey,currentUser}) {
  const [selId,setSelId]=useState(null);
  const [adType,setAdType]=useState("短视频");
  const [days,setDays]=useState("7天内");
  const [issue,setIssue]=useState("");
  const [ov,setOv]=useState({roi:"",ctr:"",cvr:"",cpm:""});
  const [useOv,setUseOv]=useState(false);
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const [score,setScore]=useState(null);
  const ref=useRef(null);
  const client=clients.find(c=>c.id===selId);
  const AD=["短视频","直播间","图文","商品卡"],DAYS=["3天内","7天内","14天内","30天以上"];

  async function diag(){
    if(!client)return;
    const roi=useOv?ov.roi:client.roi,ctr=useOv?ov.ctr:client.ctr,cvr=useOv?ov.cvr:client.cvr,cpm=useOv?ov.cpm:client.cpm;
    let s=0;
    if(parseFloat(ctr)>=3)s+=30;else if(parseFloat(ctr)>=2)s+=20;else if(parseFloat(ctr)>=1)s+=10;
    if(parseFloat(cvr)>=3)s+=30;else if(parseFloat(cvr)>=2)s+=20;else if(parseFloat(cvr)>=1)s+=10;
    if(parseFloat(roi)>=3)s+=40;else if(parseFloat(roi)>=2)s+=28;else if(parseFloat(roi)>=1)s+=15;
    setScore(Math.min(s,100));setLoading(true);setResult("");
    const industryBench=INDUSTRY_BENCHMARKS[client.industry]||INDUSTRY_BENCHMARKS["其他"];
    const materialKey=MATERIAL_TYPE_MAP[adType]||"shortVideo";
    const bench=industryBench[materialKey];
    const sys="你是一名在抖音信息流广告领域拥有多年经验的爆款素材分析与优化专家，专注于千川广告素材的投放表现拆解与优化。你深度理解抖音千川素材推荐机制（完播率点击率转化率）、爆款素材结构模型（前三秒钩子冲突点信任背书成交引导）、不同行业素材差异（电商教育本地生活服务行业）、素材衰减规律与迭代逻辑。你的能力包括：判断素材是否具备爆款潜质、拆解素材结构问题（开头弱节奏慢转化点弱等）、分析素材影响投放数据的核心原因、给出可执行优化建议或重做方向。你的输出要求：必须基于投放结果导向分析素材、必须指出核心问题加根因、必须给出可落地优化建议（可直接用于剪辑重拍）、语言要专业直接不废话。";
    const usr=`素材诊断分析：

客户信息：
- 客户名称：${client.name}
- 行业品类：${client.industry}
- 客户类型：${client.type}

素材投放信息：
- 素材类型：${adType}
- 投放时长：${days}
- 主要问题：${issue||"整体待优化"}

投放数据表现：
- ROI投产比：${roi||"未知"}（行业基准${bench.roi[0]}-${bench.roi[1]}）
- CTR点击率：${ctr||"未知"}%（行业基准${bench.ctr[0]}-${bench.ctr[1]}%）
- CVR转化率：${cvr||"未知"}%（行业基准${bench.cvr[0]}-${bench.cvr[1]}%）
- CPM千次曝光成本：${cpm||"未知"}元（行业基准${bench.cpm[0]}-${bench.cpm[1]}元）

请输出完整的素材诊断报告，包含：
1. 素材整体表现评估（是否具备爆款潜质）
2. 核心问题定位（影响投放数据的主要问题）
3. 问题根因分析（为什么会出现这些问题）
4. CTR点击率优化方向（3到4条具体建议）
5. CVR转化率优化方向（3到4条具体建议）
6. 素材结构拆解建议（开头钩子内容节奏转化引导）
7. 预算出价策略建议
8. 下批素材迭代方向
9. 7天优化执行计划（可落地排期）

注意：输出内容只用中文，不要加任何符号标记，直接输出诊断内容。`;
    await callDeepSeek(apiKey,sys,usr,t=>{setResult(t);if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},err=>{setResult(`错误：${err}`);});
    setLoading(false);
  }

  const sc=score===null?"var(--t4)":score>=70?"var(--green)":score>=45?"var(--gold)":"var(--accent)";
  const sl=score===null?"—":score>=70?"优质":score>=45?"待优化":"需大改";

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <ToolBlock clients={clients} selId={selId} onSel={id=>{setSelId(id);setUseOv(false);}} ph="输入客户名称搜索…" />
      {!apiKey&&<div style={{background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#9a3412",marginBottom:14}}>⚠️ 请在右上角配置 DeepSeek API Key 后使用 AI 功能</div>}
      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card style={{padding:14}}>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:8}}>素材类型</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
              {AD.map(t=><button key={t} onClick={()=>setAdType(t)} style={{background:adType===t?"var(--pl)":"var(--s1)",border:`1.5px solid ${adType===t?"var(--primary)":"var(--b1)"}`,borderRadius:6,padding:"5px 10px",color:adType===t?"var(--primary)":"var(--t3)",fontSize:12,fontWeight:adType===t?600:400}}>{t}</button>)}
            </div>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:8}}>投放时长</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
              {DAYS.map(t=><button key={t} onClick={()=>setDays(t)} style={{background:days===t?"var(--pl)":"var(--s1)",border:`1.5px solid ${days===t?"var(--primary)":"var(--b1)"}`,borderRadius:6,padding:"5px 10px",color:days===t?"var(--primary)":"var(--t3)",fontSize:12,fontWeight:days===t?600:400}}>{t}</button>)}
            </div>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:7}}>问题描述</div>
            <textarea value={issue} onChange={e=>setIssue(e.target.value)} placeholder="如：跑量慢、ROI突降…" rows={2} style={{fontSize:12,marginBottom:10}} />
            {client&&(
              <div>
                <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,marginBottom:6}}>数据来源</div>
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  <button onClick={()=>setUseOv(false)} style={{flex:1,background:!useOv?"var(--pl)":"var(--s1)",border:`1.5px solid ${!useOv?"var(--primary)":"var(--b1)"}`,borderRadius:6,padding:"5px 8px",color:!useOv?"var(--primary)":"var(--t3)",fontSize:11,fontWeight:!useOv?600:400}}>CRM档案</button>
                  <button onClick={()=>setUseOv(true)} style={{flex:1,background:useOv?"var(--pl)":"var(--s1)",border:`1.5px solid ${useOv?"var(--primary)":"var(--b1)"}`,borderRadius:6,padding:"5px 8px",color:useOv?"var(--primary)":"var(--t3)",fontSize:11,fontWeight:useOv?600:400}}>手动输入</button>
                </div>
                {useOv&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {[{k:"roi",l:"ROI"},{k:"ctr",l:"CTR%"},{k:"cvr",l:"CVR%"},{k:"cpm",l:"CPM元"}].map(({k,l})=>(
                    <div key={k}><div style={{fontSize:10,color:"var(--t4)",marginBottom:3}}>{l}</div><input type="number" step="0.1" value={ov[k]} onChange={e=>setOv(d=>({...d,[k]:e.target.value}))} style={{padding:"5px 8px",fontSize:12}} /></div>
                  ))}
                </div>}
              </div>
            )}
          </Card>
          <Card style={{padding:13,display:"flex",gap:12,alignItems:"center"}}>
            <svg width={50} height={50} viewBox="0 0 50 50">
              <circle cx={25} cy={25} r={20} fill="none" stroke="var(--s2)" strokeWidth={5} />
              <circle cx={25} cy={25} r={20} fill="none" stroke={sc} strokeWidth={5}
                strokeDasharray={`${2*Math.PI*20}`} strokeDashoffset={`${2*Math.PI*20*(1-(score||0)/100)}`}
                strokeLinecap="round" transform="rotate(-90 25 25)" style={{transition:"stroke-dashoffset .8s ease"}} />
              <text x={25} y={29} textAnchor="middle" fill={sc} fontSize={11} fontWeight={900} fontFamily="'Noto Sans SC'">{score??""}</text>
            </svg>
            <div><div style={{fontSize:10,color:"var(--t3)",marginBottom:2}}>素材健康分</div><div style={{fontSize:17,fontWeight:900,color:sc}}>{sl}</div></div>
          </Card>
          <PrimaryBtn onClick={diag} disabled={loading||!client||!apiKey} style={{width:"100%",justifyContent:"center",padding:"10px"}}>
            {loading?<><Spinner color="#fff" />诊断中…</>:"🔬 开始素材诊断"}
          </PrimaryBtn>
          <div style={{fontSize:10,color:"var(--t4)",marginTop:6,textAlign:"center"}}>
            状态: API Key {apiKey?"✓已配置":"✗未配置"} | 客户 {client?"✓已选择":"✗未选择"}
          </div>
        </div>
        <Card style={{padding:20,minHeight:400,maxHeight:480,overflowY:"auto"}} ref={ref}>
          {!result&&!loading?(<div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"var(--t4)"}}>
            <div style={{fontSize:44,marginBottom:12}}>🔬</div>
            <div style={{fontSize:13,textAlign:"center",lineHeight:2,color:"var(--t3)"}}>选择客户后开始诊断<br/>AI基于投放数据和行业基准<br/>给出完整优化方案</div>
          </div>):<AiResult text={result} loading={loading} />}
        </Card>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────────
function LoginPage({onLogin,users}) {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  
  function handleLogin(){
    const user=users.find(u=>u.username===username&&u.password===password);
    if(user){
      onLogin(user);
      setError("");
    }else{
      setError("用户名或密码错误");
    }
  }
  
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Card style={{padding:40,width:380,maxWidth:"90vw"}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{width:60,height:60,background:"linear-gradient(135deg,#1a56db,#3b82f6)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>🎯</div>
          <div style={{fontWeight:800,fontSize:22,color:"var(--t1)",marginBottom:4}}>千川销售管理系统</div>
          <div style={{fontSize:12,color:"var(--t3)"}}>抖音电商 · 收量业务</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>用户名</div>
            <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="输入用户名" autoFocus />
          </div>
          <div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>密码</div>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="输入密码" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
          </div>
          {error&&<div style={{fontSize:12,color:"var(--accent)",textAlign:"center"}}>{error}</div>}
          <PrimaryBtn onClick={handleLogin} disabled={!username||!password} style={{marginTop:8,justifyContent:"center"}}>登录</PrimaryBtn>
        </div>
        <div style={{fontSize:11,color:"var(--t4)",textAlign:"center",marginTop:16}}>首次登录请联系管理员获取账号</div>
      </Card>
    </div>
  );
}

// ─── USER MANAGEMENT PAGE ───────────────────────────────────────────────────────
function UserManagePage({users,onAdd,onEdit,onDelete,currentUser}) {
  const [showAdd,setShowAdd]=useState(false);
  const [editing,setEditing]=useState(null);
  const [delId,setDelId]=useState(null);
  const [form,setForm]=useState({username:"",password:"",name:"",role:"sales"});
  
  const salesUsers=users.filter(u=>u.role==="sales");
  const adminUsers=users.filter(u=>u.role==="admin");
  
  const handleChange=(k,v)=>setForm(f=>({...f,[k]:v}));
  
  function startAdd(){
    setForm({username:"",password:"",name:"",role:"sales"});
    setShowAdd(true);
  }
  function startEdit(u){
    setForm({...u,password:""});
    setEditing(u.id);
  }
  function saveAdd(){
    if(!form.username.trim()||!form.password.trim()||!form.name.trim())return;
    onAdd({...form,id:form.username.toLowerCase().replace(/\s/g,"")});
    setShowAdd(false);
  }
  function saveEdit(){
    if(!form.username.trim()||!form.name.trim())return;
    onEdit({...form,id:editing});
    setEditing(null);
  }
  
  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <Card style={{padding:"12px 16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <span style={{fontSize:13,fontWeight:600,color:"var(--t1)"}}>员工账号管理</span>
            <span style={{fontSize:11,color:"var(--t3)",marginLeft:12}}>销售 {salesUsers.length} 人 · 管理员 {adminUsers.length} 人</span>
          </div>
          <PrimaryBtn style={{padding:"7px 16px",fontSize:12}} onClick={startAdd}>+ 新增员工</PrimaryBtn>
        </div>
      </Card>
      
      <Card style={{overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 100px",padding:"9px 16px",background:"var(--s1)",fontSize:11,color:"var(--t3)",fontWeight:600,borderBottom:"1px solid var(--b1)"}}>
          <span>姓名</span><span>用户名</span><span>角色</span><span>状态</span><span style={{textAlign:"center"}}>操作</span>
        </div>
        {users.map((u,i)=>(
          <div key={u.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 100px",padding:"11px 16px",borderBottom:"1px solid var(--s1)",background:i%2?"var(--bg)":"var(--white)",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:u.role==="admin"?"var(--gold)":"var(--pl)",border:`2px solid ${u.role==="admin"?"#fde68a":"var(--pm)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:u.role==="admin"?"#92400e":"var(--primary)"}}>{(u.name||"?")[0]}</div>
              <span style={{fontWeight:600,fontSize:13,color:"var(--t1)"}}>{u.name}</span>
            </div>
            <span style={{fontSize:12,color:"var(--t2)"}}>{u.username}</span>
            <Badge label={u.role==="admin"?"管理员":"销售"} c={u.role==="admin"?"#92400e":"var(--primary)"} bg={u.role==="admin"?"#fffbeb":"var(--pl)"} bd={u.role==="admin"?"#fde68a":"var(--pm)"} />
            <Badge label={u.id===currentUser.id?"当前登录":"正常"} c={u.id===currentUser.id?"var(--green)":"var(--t2)"} bg={u.id===currentUser.id?"#f0fdf4":"var(--s1)"} bd={u.id===currentUser.id?"#bbf7d0":"var(--b1)"} />
            <div style={{display:"flex",gap:5,justifyContent:"center"}}>
              <button onClick={()=>startEdit(u)} style={{background:"var(--pl)",border:"1px solid var(--pm)",borderRadius:6,padding:"4px 9px",color:"var(--primary)",fontSize:11,fontWeight:600}}>编辑</button>
              {u.id!==currentUser.id&&<button onClick={()=>setDelId(u.id)} style={{background:"#fff1f1",border:"1px solid #fecaca",borderRadius:6,padding:"4px 7px",color:"#e84d4d",fontSize:11}}>删</button>}
            </div>
          </div>
        ))}
      </Card>
      
      <div style={{marginTop:12,fontSize:11,color:"var(--t3)"}}>员工账号可登录系统进行客户管理和AI工具使用 · 默认密码 qw123</div>
      
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",backdropFilter:"blur(2px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <Card style={{padding:24,width:360}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>新增员工账号</div>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <InputField label="姓名 *" value={form.name} onChange={e=>handleChange("name",e.target.value)} ph="员工姓名" />
              <InputField label="用户名 *" value={form.username} onChange={e=>handleChange("username",e.target.value)} ph="登录用户名" />
              <InputField label="密码 *" value={form.password} onChange={e=>handleChange("password",e.target.value)} ph="登录密码" />
              <InputField label="角色" value={form.role} onChange={e=>handleChange("role",e.target.value)} opts={["sales","admin"]} />
            </div>
            <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}>
              <GhostBtn onClick={()=>setShowAdd(false)}>取消</GhostBtn>
              <PrimaryBtn onClick={saveAdd} disabled={!form.name||!form.username||!form.password}>新增</PrimaryBtn>
            </div>
          </Card>
        </div>
      )}
      
      {editing&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",backdropFilter:"blur(2px)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setEditing(null)}>
          <Card style={{padding:24,width:360}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>编辑员工账号</div>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <InputField label="姓名 *" value={form.name} onChange={e=>handleChange("name",e.target.value)} ph="员工姓名" />
              <InputField label="用户名 *" value={form.username} onChange={e=>handleChange("username",e.target.value)} ph="登录用户名" />
              <InputField label="新密码（留空不改）" value={form.password} onChange={e=>handleChange("password",e.target.value)} ph="输入新密码" />
              <InputField label="角色" value={form.role} onChange={e=>handleChange("role",e.target.value)} opts={["sales","admin"]} />
            </div>
            <div style={{display:"flex",gap:9,marginTop:16,justifyContent:"flex-end"}}>
              <GhostBtn onClick={()=>setEditing(null)}>取消</GhostBtn>
              <PrimaryBtn onClick={saveEdit} disabled={!form.name||!form.username}>保存</PrimaryBtn>
            </div>
          </Card>
        </div>
      )}
      
      {delId&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Card style={{padding:28,width:300,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:10}}>🗑️</div>
            <div style={{fontWeight:700,marginBottom:6}}>确认删除该员工账号？</div>
            <div style={{fontSize:12,color:"var(--t3)",marginBottom:20}}>删除后该员工将无法登录系统</div>
            <div style={{display:"flex",gap:9}}>
              <GhostBtn style={{flex:1}} onClick={()=>setDelId(null)}>取消</GhostBtn>
              <button onClick={()=>{onDelete(delId);setDelId(null);}} style={{flex:1,background:"var(--accent)",border:"none",borderRadius:8,padding:"8px",color:"#fff",fontSize:13,fontWeight:700}}>确认删除</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser,setCurrentUser]=useState(()=>JSON.parse(localStorage.getItem("qc_current_user")||"null"));
  const [users,setUsers]=useState(()=>JSON.parse(localStorage.getItem("qc_users")||JSON.stringify(DEFAULT_USERS)));
  const [tab,setTab]=useState(0);
  const [clients,setClients]=useState(initClients);
  const [apiKey,setApiKey]=useState(()=>localStorage.getItem("deepseek_key")||"");
  const [editingKey,setEditingKey]=useState(!localStorage.getItem("deepseek_key"));
  
  useEffect(()=>{
    localStorage.setItem("qc_users",JSON.stringify(users));
  },[users]);
  
  useEffect(()=>{
    if(currentUser){
      localStorage.setItem("qc_current_user",JSON.stringify(currentUser));
    }else{
      localStorage.removeItem("qc_current_user");
    }
  },[currentUser]);
  
  function login(user){
    setCurrentUser(user);
    setTab(0);
  }
  function logout(){
    setCurrentUser(null);
    localStorage.removeItem("qc_current_user");
  }
  
  const saveApiKey=v=>{setApiKey(v);localStorage.setItem("deepseek_key",v);setEditingKey(false);};
  const addClient=c=>setClients(p=>[...p,c]);
  const editClient=c=>setClients(p=>p.map(x=>x.id===c.id?c:x));
  const deleteClient=id=>setClients(p=>p.filter(x=>x.id!==id));
  
  const addUser=u=>setUsers(p=>[...p,u]);
  const editUser=u=>setUsers(p=>p.map(x=>x.id===u.id?({...u,password:u.password||x.password}):x));
  const deleteUser=id=>setUsers(p=>p.filter(x=>x.id!==id));
  
  const isAdmin=currentUser?.role==="admin";
  const salesNames=users.filter(u=>u.role==="sales").map(u=>u.name);
  
  const TABS=[
    {ic:"🗂️",l:"客户管理",s:"增删改查 · 分级分类"},
    {ic:"💬",l:"话术生成",s:"AI专属话术"},
    {ic:"📊",l:"客户诊断",s:"全面分析报告"},
    {ic:"🔬",l:"素材诊断",s:"投放优化方案"},
  ];
  if(isAdmin) TABS.push({ic:"👥",l:"员工管理",s:"账号增删改查"});
  
  if(!currentUser){
    return <>
      <style>{G}</style>
      <LoginPage onLogin={login} users={users} />
    </>;
  }
  
  return (
    <>
      <style>{G}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>
        {/* Nav */}
        <div style={{background:"var(--white)",borderBottom:"1px solid var(--b1)",boxShadow:"0 1px 4px rgba(0,0,0,.05)",position:"sticky",top:0,zIndex:200}}>
          <div style={{maxWidth:1160,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",height:54}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginRight:32,flexShrink:0}}>
              <div style={{width:30,height:30,background:"linear-gradient(135deg,#1a56db,#3b82f6)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎯</div>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:"var(--t1)"}}>千川销售管理系统</div>
                <div style={{fontSize:10,color:"var(--t4)"}}>抖音电商 · 收量业务</div>
              </div>
            </div>
            <div style={{display:"flex",gap:1}}>
              {TABS.map((t,i)=>(
                <button key={i} onClick={()=>setTab(i)} style={{background:"none",border:"none",borderBottom:`2.5px solid ${tab===i?"var(--primary)":"transparent"}`,padding:"0 18px",height:54,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer",borderRadius:0}}>
                  <span style={{fontSize:15}}>{t.ic}</span>
                  <span style={{fontSize:11.5,fontWeight:tab===i?700:400,color:tab===i?"var(--primary)":"var(--t3)",whiteSpace:"nowrap"}}>{t.l}</span>
                </button>
              ))}
            </div>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
              {isAdmin&&(
                editingKey ? (
                  <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} onBlur={e=>e.target.value&&saveApiKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&e.target.value&&saveApiKey(e.target.value)} placeholder="输入 DeepSeek API Key…" autoFocus style={{width:200,padding:"5px 10px",fontSize:11,height:30}} />
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--green)",cursor:"default"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:"var(--green)",display:"inline-block"}} />
                    <span>API Key 已配置</span>
                    <button onClick={()=>{setEditingKey(true);setApiKey("")}} style={{background:"none",border:"none",color:"var(--t3)",fontSize:11,textDecoration:"underline",cursor:"pointer",padding:0}}>更换</button>
                  </div>
                )
              )}
              <span style={{fontSize:11,color:"var(--t3)"}}>当前：</span>
              <div style={{width:28,height:28,borderRadius:"50%",background:currentUser.role==="admin"?"var(--gold)":"var(--pl)",border:`2px solid ${currentUser.role==="admin"?"#fde68a":"var(--pm)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:currentUser.role==="admin"?"#92400e":"var(--primary)"}}>{(currentUser.name||"?")[0]}</div>
              <span style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>{currentUser.name}</span>
              <button onClick={logout} style={{background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:6,padding:"5px 12px",color:"var(--t3)",fontSize:11,fontWeight:500}}>退出</button>
            </div>
          </div>
        </div>
        {/* Content */}
        <div style={{maxWidth:1160,margin:"0 auto",padding:"20px 24px"}}>
          {tab===0&&<CRMPage clients={clients} onAdd={addClient} onEdit={editClient} onDelete={deleteClient} currentUser={currentUser} salesNames={salesNames} />}
          {tab===1&&<ScriptTool clients={clients} apiKey={apiKey} currentUser={currentUser} />}
          {tab===2&&<AnalysisTool clients={clients} apiKey={apiKey} currentUser={currentUser} />}
          {tab===3&&<MaterialTool clients={clients} apiKey={apiKey} currentUser={currentUser} />}
          {tab===4&&isAdmin&&<UserManagePage users={users} onAdd={addUser} onEdit={editUser} onDelete={deleteUser} currentUser={currentUser} />}
        </div>
      </div>
    </>
  );
}
