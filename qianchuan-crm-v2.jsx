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
const BUDGET_RANGES = ["5千以下","5千-2万","2-5万","5-20万","20-50万","50万以上"];
const CONTACT_INTERVALS = ["每天","2-3天","每周","半月","月度"];
const SALES_MEMBERS = ["张伟","李娜","王芳","刘洋","陈静","赵磊","黄敏","周杰","我自己"];

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
};
const RISK_C = {高:"#e84d4d",中:"#d97706",低:"#16a34a"};

const TODAY = new Date().toISOString().slice(0,10);
function daysAgo(d) { return !d ? 999 : Math.floor((Date.now()-new Date(d))/86400000); }
function fmtDate(d) { if(!d) return "—"; const x=new Date(d); return `${x.getMonth()+1}/${x.getDate()}`; }

function calcTier(b,roi) {
  const bm={"5千以下":.3,"5千-2万":1,"2-5万":3,"5-20万":12,"20-50万":35,"50万以上":60};
  const s=(bm[b]||1)*(parseFloat(roi)||1);
  return s>=30?"S":s>=8?"A":s>=2?"B":"C";
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
  {id:1,name:"某某美妆旗舰",contact:"王总",phone:"138xxxx1234",industry:"美妆护肤",type:"品牌旗舰店",budgetRange:"20-50万",roi:"3.2",ctr:"3.1",cvr:"2.8",cpm:"22",status:"活跃投放",contactInterval:"每天",lastContact:"2025-04-28",owner:"张伟",tags:"高ROI,稳定消耗",followUps:[{id:1,date:"2025-04-28",author:"张伟",content:"大促后复盘，ROI维持3.2，客户满意，建议5月继续放量。"},{id:2,date:"2025-04-15",author:"张伟",content:"618备战方案已发送，预算拟提升至60万。"}]},
  {id:2,name:"XX服装旗舰店",contact:"李经理",phone:"139xxxx5678",industry:"服装服饰",type:"中小卖家",budgetRange:"2-5万",roi:"1.8",ctr:"2.1",cvr:"1.6",cpm:"14",status:"观望评估",contactInterval:"每周",lastContact:"2025-04-20",owner:"李娜",tags:"价格敏感,需素材优化",followUps:[{id:1,date:"2025-04-20",author:"李娜",content:"客户对ROI有顾虑，表示1.8偏低，需要出优化方案再跟进。"}]},
  {id:3,name:"某某3C代理商",contact:"张总",phone:"180xxxx9999",industry:"3C数码",type:"代理运营商",budgetRange:"50万以上",roi:"2.5",ctr:"2.8",cvr:"2.2",cpm:"28",status:"活跃投放",contactInterval:"2-3天",lastContact:"2025-04-29",owner:"王芳",tags:"批量投放,多账户",followUps:[{id:1,date:"2025-04-29",author:"王芳",content:"新增2个账户投放，本月总消耗预计突破60万。"},{id:2,date:"2025-04-22",author:"王芳",content:"客户反馈CPM偏高，建议调整出价策略，已发邮件。"}]},
  {id:4,name:"新兴食品品牌",contact:"陈老板",phone:"182xxxx3333",industry:"食品饮料",type:"白牌商家",budgetRange:"5千-2万",roi:"0.9",ctr:"1.5",cvr:"1.1",cpm:"11",status:"暂停投放",contactInterval:"半月",lastContact:"2025-04-10",owner:"刘洋",tags:"ROI异常,暂停",followUps:[{id:1,date:"2025-04-10",author:"刘洋",content:"ROI持续低于1，客户决定暂停投放，等待素材优化结果。"},{id:2,date:"2025-03-28",author:"刘洋",content:"已给客户出诊断报告，主要问题是素材点击率过低。"}]},
  {id:5,name:"高端家居品牌",contact:"刘总",phone:"186xxxx7777",industry:"家居家装",type:"品牌旗舰店",budgetRange:"5-20万",roi:"2.1",ctr:"2.4",cvr:"2.0",cpm:"18",status:"新开发",contactInterval:"每周",lastContact:"2025-04-27",owner:"陈静",tags:"新开发,潜力大",followUps:[{id:1,date:"2025-04-27",author:"陈静",content:"初次拜访，客户对千川有兴趣，建议先跑小预算测试ROI。"}]},
];

function initClients() {
  return SEED.map(c=>{const d=daysAgo(c.lastContact);return{...c,daysSinceContact:d,tier:calcTier(c.budgetRange,c.roi),risk:calcRisk({...c,daysSinceContact:d})};});
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function callClaude(sys,usr,onChunk) {
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,stream:true,system:sys,messages:[{role:"user",content:usr}]})});
  const reader=res.body.getReader();const dec=new TextDecoder();let full="";
  while(true){const{done,value}=await reader.read();if(done)break;
    for(const line of dec.decode(value).split("\n").filter(l=>l.startsWith("data: "))){
      try{const j=JSON.parse(line.slice(6));if(j.type==="content_block_delta"&&j.delta?.text){full+=j.delta.text;onChunk(full);}}catch{}
    }
  }
  return full;
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
    {text.split(/(\【[^】]+】)/).map((p,i)=>p.match(/\【[^】]+】/)
      ?<span key={i} style={{color:"var(--primary)",fontWeight:700,fontSize:14}}>{p}</span>
      :<span key={i}>{p}</span>)}
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
function Drawer({client,onClose,onSave,currentUser}) {
  const [form,setForm]=useState({...client});
  const [tab,setTab]=useState("info");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  function save(){
    const d=daysAgo(form.lastContact);
    const tier=calcTier(form.budgetRange,form.roi);
    onSave({...form,daysSinceContact:d,tier,risk:calcRisk({...form,daysSinceContact:d})});
  }
  function addFu(fu){
    const updated={...form,followUps:[...(form.followUps||[]),fu],lastContact:TODAY};
    setForm(updated);
    const d=daysAgo(TODAY);
    onSave({...updated,daysSinceContact:d,tier:calcTier(updated.budgetRange,updated.roi),risk:calcRisk({...updated,daysSinceContact:d})});
  }

  const F=({label,k,type="text",ph="",opts})=>(
    <div>
      <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>{label}</div>
      {opts?<select value={form[k]||""} onChange={e=>set(k,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>
        :<input type={type} value={form[k]||""} onChange={e=>set(k,e.target.value)} placeholder={ph} />}
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",animation:"fadeIn .2s ease"}}>
      <div style={{flex:1,background:"rgba(15,23,42,.3)",backdropFilter:"blur(2px)"}} onClick={onClose} />
      <div style={{width:"min(580px,96vw)",background:"var(--white)",borderLeft:"1px solid var(--b1)",boxShadow:"var(--shl)",display:"flex",flexDirection:"column",height:"100vh"}}>
        {/* Header */}
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

        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:20}}>
          {tab==="info"&&(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                <F label="客户名称 *" k="name" ph="店铺/公司名" />
                <F label="销售归属" k="owner" opts={SALES_MEMBERS} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                <F label="对接人" k="contact" ph="联系人姓名" />
                <F label="联系方式" k="phone" ph="手机/微信号" />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                <F label="行业品类" k="industry" opts={INDUSTRIES} />
                <F label="客户类型" k="type" opts={CLIENT_TYPES} />
                <F label="月预算规模" k="budgetRange" opts={BUDGET_RANGES} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
                <F label="当前状态" k="status" opts={STATUSES} />
                <F label="跟进频率" k="contactInterval" opts={CONTACT_INTERVALS} />
                <div>
                  <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>最近联系日期</div>
                  <input type="date" value={form.lastContact||TODAY} max={TODAY}
                    onChange={e=>set("lastContact",e.target.value)} />
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>标签（逗号分隔）</div>
                <input value={form.tags||""} onChange={e=>set("tags",e.target.value)} placeholder="如：高ROI,大促冲量,素材优化" />
              </div>
            </div>
          )}
          {tab==="data"&&(
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div style={{background:"var(--s1)",borderRadius:8,padding:"9px 12px",fontSize:12,color:"var(--t3)"}}>
                💡 投放数据建议每次跟进后更新，用于AI诊断分析更精准
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                {[{k:"roi",l:"ROI 投产比",ph:"如 2.5"},{k:"ctr",l:"CTR 点击率 %",ph:"如 2.8"},{k:"cvr",l:"CVR 转化率 %",ph:"如 2.0"},{k:"cpm",l:"CPM 千次曝光（元）",ph:"如 18"}].map(({k,l,ph})=>(
                  <F key={k} label={l} k={k} type="number" ph={ph} />
                ))}
              </div>
              <div style={{background:"var(--pl)",border:"1px solid var(--pm)",borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:"var(--t3)",marginBottom:6}}>自动评估层级</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <Badge label={TIER_META[calcTier(form.budgetRange,form.roi)]?.label} c={TIER_META[calcTier(form.budgetRange,form.roi)]?.c} bg={TIER_META[calcTier(form.budgetRange,form.roi)]?.bg} bd={TIER_META[calcTier(form.budgetRange,form.roi)]?.bd} />
                  <span style={{fontSize:11,color:"var(--t3)"}}>根据预算规模 × ROI 实时计算 · S≥30 / A≥8 / B≥2</span>
                </div>
              </div>
            </div>
          )}
          {tab==="fu"&&<Timeline followUps={form.followUps} onAdd={addFu} currentUser={currentUser} />}
        </div>

        {tab!=="fu"&&(
          <div style={{padding:"13px 20px",borderTop:"1px solid var(--b1)",display:"flex",gap:9,justifyContent:"flex-end",flexShrink:0}}>
            <GhostBtn onClick={onClose}>取消</GhostBtn>
            <PrimaryBtn onClick={()=>{save();onClose();}}>💾 保存修改</PrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADD MODAL ────────────────────────────────────────────────────────────────
function AddModal({onSave,onClose,currentUser}) {
  const [form,setForm]=useState({name:"",contact:"",phone:"",industry:"美妆护肤",type:"中小卖家",budgetRange:"2-5万",roi:"",ctr:"",cvr:"",cpm:"",status:"新开发",contactInterval:"每周",lastContact:TODAY,owner:currentUser,tags:"",followUps:[]});
  const [firstNote,setFirstNote]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const F=({label,k,type="text",ph="",opts})=>(
    <div>
      <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>{label}</div>
      {opts?<select value={form[k]} onChange={e=>set(k,e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select>
        :<input type={type} value={form[k]||""} onChange={e=>set(k,e.target.value)} placeholder={ph} />}
    </div>
  );
  function save(){
    if(!form.name.trim())return;
    const fus=firstNote.trim()?[{id:Date.now(),date:TODAY,author:currentUser,content:firstNote.trim()}]:[];
    const d=daysAgo(form.lastContact);
    const tier=calcTier(form.budgetRange,form.roi);
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
            <F label="客户名称 *" k="name" ph="店铺/公司名称" />
            <F label="销售归属 *" k="owner" opts={SALES_MEMBERS} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
            <F label="对接人" k="contact" ph="联系人姓名" />
            <F label="联系方式" k="phone" ph="手机/微信号" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
            <F label="行业品类" k="industry" opts={INDUSTRIES} />
            <F label="客户类型" k="type" opts={CLIENT_TYPES} />
            <F label="月预算规模" k="budgetRange" opts={BUDGET_RANGES} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
            <F label="当前状态" k="status" opts={STATUSES} />
            <F label="跟进频率" k="contactInterval" opts={CONTACT_INTERVALS} />
            <div>
              <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>最近联系日期</div>
              <input type="date" value={form.lastContact} max={TODAY} onChange={e=>set("lastContact",e.target.value)} />
            </div>
          </div>
          <div style={{borderTop:"1px solid var(--b1)",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:600,color:"var(--t3)",letterSpacing:".06em",textTransform:"uppercase",marginBottom:11}}>投放数据（选填）</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
              {[{k:"roi",l:"ROI",ph:"2.5"},{k:"ctr",l:"CTR%",ph:"2.8"},{k:"cvr",l:"CVR%",ph:"2.0"},{k:"cpm",l:"CPM元",ph:"18"}].map(({k,l,ph})=>(<F key={k} label={l} k={k} type="number" ph={ph} />))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>标签</div>
            <input value={form.tags||""} onChange={e=>set("tags",e.target.value)} placeholder="如：高ROI,大促冲量,潜力大（逗号分隔）" />
          </div>
          <div>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:5,fontWeight:500}}>首次跟进记录（选填）</div>
            <textarea rows={2} value={firstNote} onChange={e=>setFirstNote(e.target.value)} placeholder="记录初次接触情况、客户意向、下一步计划…" />
          </div>
        </div>
        <div style={{padding:"13px 20px",borderTop:"1px solid var(--b1)",display:"flex",gap:9,justifyContent:"flex-end"}}>
          <GhostBtn onClick={onClose}>取消</GhostBtn>
          <PrimaryBtn onClick={save} disabled={!form.name.trim()}>✓ 新增客户</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
function CRMPage({clients,onAdd,onEdit,onDelete}) {
  const [q,setQ]=useState("");
  const [ft,setFt]=useState("全部");
  const [fs,setFs]=useState("全部");
  const [fo,setFo]=useState("全部");
  const [showAdd,setShowAdd]=useState(false);
  const [drawer,setDrawer]=useState(null);
  const [delId,setDelId]=useState(null);
  const CU="张伟";

  const owners=["全部",...new Set(clients.map(c=>c.owner).filter(Boolean))];
  const fil=clients.filter(c=>{
    const ms=!q||[c.name,c.contact||"",c.tags||"",c.owner||""].join(" ").toLowerCase().includes(q.toLowerCase());
    return ms&&(ft==="全部"||c.tier===ft)&&(fs==="全部"||c.status===fs)&&(fo==="全部"||c.owner===fo);
  });

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
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索客户/联系人/标签" style={{paddingLeft:30,fontSize:12}} />
          </div>
          <div style={{display:"flex",gap:5}}>
            {["全部","S","A","B","C"].map(t=>(
              <button key={t} onClick={()=>setFt(t)} style={{background:ft===t?(t==="全部"?"var(--pl)":TIER_META[t]?.bg||"var(--s1)"):"var(--s1)",border:`1.5px solid ${ft===t?(t==="全部"?"var(--primary)":TIER_META[t]?.bd||"var(--b1)"):"var(--b1)"}`,borderRadius:6,padding:"5px 10px",color:ft===t?(t==="全部"?"var(--primary)":TIER_META[t]?.c||"var(--t2)"):"var(--t3)",fontSize:12,fontWeight:ft===t?600:400}}>
                {t==="全部"?"全部":`${t}级`}
              </button>
            ))}
          </div>
          <select value={fs} onChange={e=>setFs(e.target.value)} style={{width:"auto",padding:"6px 10px",fontSize:12}}>
            <option>全部</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={fo} onChange={e=>setFo(e.target.value)} style={{width:"auto",padding:"6px 10px",fontSize:12}}>
            {owners.map(o=><option key={o}>{o==="全部"?"全部归属":o}</option>)}
          </select>
          <PrimaryBtn style={{marginLeft:"auto",padding:"7px 16px",fontSize:12}} onClick={()=>setShowAdd(true)}>+ 新增客户</PrimaryBtn>
        </div>
      </Card>

      {/* Table */}
      <Card style={{overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr .8fr 1fr 1fr .9fr 1fr 1fr 90px",padding:"9px 16px",background:"var(--s1)",fontSize:11,color:"var(--t3)",fontWeight:600,letterSpacing:".04em",borderBottom:"1px solid var(--b1)"}}>
          <span>客户 / 联系人</span><span>归属</span><span>行业</span><span>预算 / ROI</span><span>层级</span><span>状态</span><span>最近联系</span><span style={{textAlign:"center"}}>操作</span>
        </div>
        {fil.length===0&&<div style={{padding:32,textAlign:"center",color:"var(--t4)",fontSize:13}}>暂无匹配客户</div>}
        {fil.map((c,i)=>(
          <div key={c.id} onClick={()=>setDrawer(c)}
            style={{display:"grid",gridTemplateColumns:"2fr .8fr 1fr 1fr .9fr 1fr 1fr 90px",padding:"11px 16px",borderBottom:"1px solid var(--s1)",cursor:"pointer",background:i%2?"var(--bg)":"var(--white)",alignItems:"center",transition:"background .1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="var(--pl)"}
            onMouseLeave={e=>e.currentTarget.style.background=i%2?"var(--bg)":"var(--white)"}>
            <div>
              <div style={{fontWeight:600,fontSize:13,color:"var(--t1)",marginBottom:2}}>{c.name}</div>
              <div style={{fontSize:11,color:"var(--t4)"}}>{c.contact||"—"}{c.phone&&` · ${c.phone}`}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"var(--pl)",border:"1.5px solid var(--pm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"var(--primary)",flexShrink:0}}>{(c.owner||"?")[0]}</div>
              <span style={{fontSize:11,color:"var(--t2)"}}>{c.owner||"—"}</span>
            </div>
            <span style={{fontSize:12,color:"var(--t2)"}}>{c.industry}</span>
            <div>
              <div style={{fontSize:11,color:"var(--t2)"}}>{c.budgetRange}</div>
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
      <div style={{marginTop:9,fontSize:11,color:"var(--t3)"}}>{fil.length} / {clients.length} 位客户 · 点击行查看详情及跟进记录</div>

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
      {showAdd&&<AddModal onSave={onAdd} onClose={()=>setShowAdd(false)} currentUser={CU} />}
      {drawer&&<Drawer client={drawer} onClose={()=>setDrawer(null)} onSave={c=>{onEdit(c);setDrawer(c);}} currentUser={CU} />}
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
function ScriptTool({clients}) {
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
    const sys="你是抖音千川广告平台资深销售顾问，精通千川收量业务。根据真实客户档案生成针对性话术，语气专业接地气。";
    const usr=`根据以下真实客户档案，生成【${scene}】场景话术：

客户：${client.name}（${client.contact||"负责人"}），${client.industry}/${client.type}
预算：${client.budgetRange}，ROI：${client.roi||"未知"}，CTR：${client.ctr||"未知"}%，CVR：${client.cvr||"未知"}%
状态：${client.status}，层级：${client.tier}级，风险：${client.risk}
归属：${client.owner||"未知"}，跟进频率：${client.contactInterval}，最近联系：${client.daysSinceContact===0?"今天":`${client.daysSinceContact}天前`}
最新跟进：${lastFu?lastFu.content:"无"}
标签：${client.tags||"无"}
${extra?`补充背景：${extra}`:""}

输出：
【开场白】（15字内）
【破冰切入】（结合客户现状自然引出千川）
【痛点共鸣】（基于真实数据挖掘）
【价值主张】（量身定制的千川核心卖点）
【数据背书】（行业对标数据）
【异议预案】（2个最可能拒绝及回应）
【促单话术】（制造紧迫感）
【跟进话术】（适合该客户频率的二次触达）`;
    await callClaude(sys,usr,t=>{setResult(t);if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;});
    setLoading(false);
  }

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <ToolBlock clients={clients} selId={selId} onSel={setSelId} ph="输入客户名/联系人/行业搜索…" />
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
function AnalysisTool({clients}) {
  const [selId,setSelId]=useState(null);
  const [type,setType]=useState("全面诊断");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  const TYPES=["全面诊断","跟进策略","预算提升","流失预防","大促备战","ROI优化"];
  const client=clients.find(c=>c.id===selId);
  const BENCH={"美妆护肤":{ctr:"2.5-4%",cvr:"2-4%",roi:"2.5-4",cpm:"15-25元"},"服装服饰":{ctr:"2-3.5%",cvr:"1.5-3%",roi:"1.5-3",cpm:"12-20元"},"食品饮料":{ctr:"2-3%",cvr:"2-3.5%",roi:"2-3.5",cpm:"10-18元"},"3C数码":{ctr:"1.5-3%",cvr:"1-2.5%",roi:"1.5-3",cpm:"20-35元"},"家居家装":{ctr:"1.5-2.5%",cvr:"1-2%",roi:"1.5-2.5",cpm:"15-28元"}};

  async function analyze(){
    if(!client)return;setLoading(true);setResult("");
    const bench=BENCH[client.industry]||{ctr:"2-3%",cvr:"2-3%",roi:"2-3",cpm:"15-25元"};
    const fuHist=[...(client.followUps||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3).map(fu=>`${fmtDate(fu.date)} ${fu.author}: ${fu.content}`).join("\n");
    const sys="你是抖音千川广告销售专家，根据客户完整档案和跟进历史给出精准可执行的分析报告。";
    const usr=`对以下客户进行【${type}】分析：

档案：${client.name}，${client.industry}/${client.type}，归属：${client.owner||"未知"}
数据：ROI ${client.roi||"未知"}（基准${bench.roi}），CTR ${client.ctr||"未知"}%（基准${bench.ctr}），CVR ${client.cvr||"未知"}%（基准${bench.cvr}），CPM ${client.cpm||"未知"}元（基准${bench.cpm}）
预算：${client.budgetRange}，状态：${client.status}，层级：${client.tier}级，风险：${client.risk}
最近联系：${client.daysSinceContact===0?"今天":`${client.daysSinceContact}天前`}，频率：${client.contactInterval}，标签：${client.tags||"无"}

最近3条跟进记录：
${fuHist||"暂无"}

输出详细${type}报告，数据驱动，给出具体可落地行动项。`;
    await callClaude(sys,usr,t=>{setResult(t);if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;});
    setLoading(false);
  }

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <ToolBlock clients={clients} selId={selId} onSel={setSelId} ph="输入客户名/归属销售搜索…" />
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
          <PrimaryBtn onClick={analyze} disabled={loading||!client} style={{width:"100%",justifyContent:"center",padding:"10px"}}>
            {loading?<><Spinner color="#fff" />分析中…</>:"🎯 开始分析"}
          </PrimaryBtn>
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
function MaterialTool({clients}) {
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
  const BENCH={"美妆护肤":{ctr:"2.5-4%",cvr:"2-4%",roi:"2.5-4",cpm:"15-25元"},"服装服饰":{ctr:"2-3.5%",cvr:"1.5-3%",roi:"1.5-3",cpm:"12-20元"},"食品饮料":{ctr:"2-3%",cvr:"2-3.5%",roi:"2-3.5",cpm:"10-18元"},"3C数码":{ctr:"1.5-3%",cvr:"1-2.5%",roi:"1.5-3",cpm:"20-35元"}};

  async function diag(){
    if(!client)return;
    const roi=useOv?ov.roi:client.roi,ctr=useOv?ov.ctr:client.ctr,cvr=useOv?ov.cvr:client.cvr,cpm=useOv?ov.cpm:client.cpm;
    let s=0;
    if(parseFloat(ctr)>=3)s+=30;else if(parseFloat(ctr)>=2)s+=20;else if(parseFloat(ctr)>=1)s+=10;
    if(parseFloat(cvr)>=3)s+=30;else if(parseFloat(cvr)>=2)s+=20;else if(parseFloat(cvr)>=1)s+=10;
    if(parseFloat(roi)>=3)s+=40;else if(parseFloat(roi)>=2)s+=28;else if(parseFloat(roi)>=1)s+=15;
    setScore(Math.min(s,100));setLoading(true);setResult("");
    const bench=BENCH[client.industry]||{ctr:"2-3%",cvr:"2-3%",roi:"2-3",cpm:"15-25元"};
    const sys="你是抖音千川广告素材诊断专家，精通各行业基准数据，给出可执行优化方案。";
    const usr=`素材诊断：

客户：${client.name}，${client.industry}/${client.type}
素材类型：${adType}，投放：${days}
数据 vs 基准：ROI ${roi||"未知"}（基准${bench.roi}），CTR ${ctr||"未知"}%（基准${bench.ctr}），CVR ${cvr||"未知"}%（基准${bench.cvr}），CPM ${cpm||"未知"}元（基准${bench.cpm}）
问题：${issue||"整体待优化"}

输出：
【问题定位】核心差距分析
【CTR优化】点击率提升方向（3-4条）
【CVR优化】转化率优化方向（3-4条）
【预算出价】投放策略建议
【素材迭代】下批素材方向
【7天计划】可落地执行排期`;
    await callClaude(sys,usr,t=>{setResult(t);if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;});
    setLoading(false);
  }

  const sc=score===null?"var(--t4)":score>=70?"var(--green)":score>=45?"var(--gold)":"var(--accent)";
  const sl=score===null?"—":score>=70?"优质":score>=45?"待优化":"需大改";

  return (
    <div style={{animation:"fadeUp .3s ease"}}>
      <ToolBlock clients={clients} selId={selId} onSel={id=>{setSelId(id);setUseOv(false);}} ph="输入客户名称搜索…" />
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
          <PrimaryBtn onClick={diag} disabled={loading||!client} style={{width:"100%",justifyContent:"center",padding:"10px"}}>
            {loading?<><Spinner color="#fff" />诊断中…</>:"🔬 开始素材诊断"}
          </PrimaryBtn>
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

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState(0);
  const [clients,setClients]=useState(initClients);
  const addClient=c=>setClients(p=>[...p,c]);
  const editClient=c=>setClients(p=>p.map(x=>x.id===c.id?c:x));
  const deleteClient=id=>setClients(p=>p.filter(x=>x.id!==id));
  const TABS=[{ic:"🗂️",l:"客户管理",s:"增删改查 · 分级分类"},{ic:"💬",l:"话术生成",s:"AI专属话术"},{ic:"📊",l:"客户诊断",s:"全面分析报告"},{ic:"🔬",l:"素材诊断",s:"投放优化方案"}];
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
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:11,color:"var(--t3)"}}>当前：</span>
              <div style={{width:28,height:28,borderRadius:"50%",background:"var(--pl)",border:"2px solid var(--pm)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"var(--primary)"}}>张</div>
              <span style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>张伟</span>
            </div>
          </div>
        </div>
        {/* Content */}
        <div style={{maxWidth:1160,margin:"0 auto",padding:"20px 24px"}}>
          {tab===0&&<CRMPage clients={clients} onAdd={addClient} onEdit={editClient} onDelete={deleteClient} />}
          {tab===1&&<ScriptTool clients={clients} />}
          {tab===2&&<AnalysisTool clients={clients} />}
          {tab===3&&<MaterialTool clients={clients} />}
        </div>
      </div>
    </>
  );
}
