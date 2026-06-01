
import React, { useEffect, useMemo, useState } from "react";
import ChatPanel from "../components/ChatPanel.jsx";
import MaterialChecklist from "../components/MaterialChecklist.jsx";
import PromptDrawer from "../components/PromptDrawer.jsx";
import AIGCGenerator from "../components/AIGCGenerator.jsx";
import { CAP_META, CHECKLIST, EVENTS, GRADES, findEvent } from "../data/events.js";
import { healthCheck } from "../services/api.js";

export default function V1Page({ profile, setProfile }) {
  const event = useMemo(() => findEvent(profile.gradeKey, profile.eventId), [profile.gradeKey, profile.eventId]);
  const [capKey, setCapKey] = useState(event.main);
  const [checklist, setChecklist] = useState(CHECKLIST);
  const [selectedPromptItems, setSelectedPromptItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [apiOk, setApiOk] = useState(false);

  useEffect(() => { setCapKey(event.main); }, [event.id]);
  useEffect(() => { healthCheck().then(d => setApiOk(Boolean(d.ok))).catch(()=>setApiOk(false)); }, []);

  const progress = Math.round(checklist.filter(i => i.status === "done").length / checklist.length * 100);

  function pickGrade(key) {
    const nextEvent = EVENTS[key][0];
    setProfile(p => ({...p, gradeKey:key, gradeNumber: GRADES[key].defaultGradeNumber, eventId: nextEvent.id}));
  }

  function pickEvent(id) {
    setProfile(p => ({...p, eventId:id}));
  }

  function onAgentPatch(patch) {
    if (patch?.checklist_done) {
      setChecklist(items => items.map(i => patch.checklist_done.includes(i.key) ? {...i, status:"done"} : i));
    }
  }

  return (
    <div className="app">
      <div className="top">
        <span className="brand">AIGCNYACC</span>
        <div className="grade-pill">
          <span className="gp-lbl">学段</span>
          <select className="model-select" value={profile.gradeKey} onChange={e=>pickGrade(e.target.value)}>
            {Object.entries(GRADES).map(([k,g]) => <option key={k} value={k}>{g.label}</option>)}
          </select>
        </div>
        <span className="crumb-sep">/</span>
        <div className="ev-pill">
          <select className="model-select" value={event.id} onChange={e=>pickEvent(e.target.value)}>
            {EVENTS[profile.gradeKey].map(e => <option key={e.id} value={e.id}>{e.id} · {e.name}</option>)}
          </select>
        </div>
        <div className="tbr">
          <div className="pbar-wrap">
            <span style={{fontSize:"var(--fxs)", color:"var(--ink3)"}}>完整度</span>
            <div className="pbar"><div className="pf" style={{width:`${progress}%`}}></div></div>
            <span className="ppct">{progress}%</span>
          </div>
          <span className="saved"><span className={`api-dot ${apiOk ? "" : "off"}`}></span>{apiOk ? "后端已就绪" : "后端未连接"}</span>
          <div className="userbar">
            <span className="top-link"><i className="ti ti-settings" style={{fontSize:13}}></i>设置</span>
            <span className="user-pill"><span style={{fontSize:14}}>🐼</span><b>{profile.username}</b><span className="bean-pill">✨AI魔豆 {profile.beans}</span></span>
          </div>
        </div>
      </div>

      <div className="body">
        <div className="lsib">
          <div className="lhd">
            <div className="levname">{event.name}</div>
            <div className="levid">{event.id} · {GRADES[profile.gradeKey].label}组 · 默认{profile.gradeNumber}年级</div>
          </div>
          <div className="lsec">
            <div className="lsec-lbl">本赛项生成能力</div>
            {event.caps.map(c => (
              <button key={c} className={`cap-btn ${capKey === c ? "active" : ""}`} onClick={()=>setCapKey(c)}>
                <span className="cb-dot" style={{background:CAP_META[c]?.color || "#999"}}></span>
                <span className="cb-inf"><span className="cb-name">{CAP_META[c]?.label || c}</span><span className="cb-api">{CAP_META[c]?.api || "Ark"}</span></span>
                {event.main === c && <span className="cb-main">主</span>}
              </button>
            ))}
          </div>
          <ChatPanel profile={profile} event={event} checklist={checklist} onAgentPatch={onAgentPatch}/>
        </div>

        <div className="main">
          <div className="tabs">
            {event.caps.map(c => (
              <div key={c} className={`tt ${capKey === c ? "active" : ""}`} onClick={()=>setCapKey(c)}>
                <span className="tcdot" style={{background:CAP_META[c]?.color || "#999"}}></span>{CAP_META[c]?.label || c}
              </div>
            ))}
          </div>
          <div className="ups"><span className="ulbl">参考材料</span><button className="uplus"><i className="ti ti-plus"></i></button><div className="mpills"><span className="mpill">支持后续接入上传</span></div></div>
          <div className="panel">
            <div className="cap-hdr">
              <span className="cap-hdr-dot" style={{background:CAP_META[capKey]?.color}}></span>
              <span className="cap-hdr-name">{CAP_META[capKey]?.label}</span>
              <span className="api-badge">火山方舟 Ark API</span>
            </div>
            <PromptDrawer event={event} capKey={capKey} onPromptBuild={setSelectedPromptItems}/>
            <AIGCGenerator profile={profile} event={event} capKey={capKey} selectedPromptItems={selectedPromptItems} onHistory={h=>setHistory([h,...history])}/>
          </div>
          <div className="sbar"><div className="sdot"></div><span className="stxt">React + FastAPI + Volcengine Ark 已接入结构。真实生成需配置 backend/.env。</span></div>
        </div>

        <div className="rpanel">
          <MaterialChecklist items={checklist} setItems={setChecklist}/>
          <div className="rhist">
            <div className="histhd"><span className="histlbl">操作历史</span></div>
            <div className="hscroll">
              {history.length === 0 ? <div className="hempty">生成后自动追加记录</div> :
                history.map((h,i)=><div key={i} className="hitem"><span className="hdot" style={{background:CAP_META[h.type]?.color || "#999"}}></span><div className="hbody"><div className="hid">{h.title}</div><div className="htool">{h.text.slice(0,60)}…</div></div></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
