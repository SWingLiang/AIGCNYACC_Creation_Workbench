
import React from "react";

export default function MaterialChecklist({ items, setItems }) {
  const done = items.filter(i => i.status === "done").length;
  const pct = Math.round(done / items.length * 100);

  function toggle(key) {
    setItems(items.map(i => i.key === key ? {
      ...i,
      status: i.status === "done" ? "idle" : "done"
    } : i));
  }

  return (
    <div className="rtop">
      <div className="rsec">
        <div className="rlbl">材料清单</div>
        {items.map(item => (
          <div key={item.key} className={`cli ${item.status}`} onClick={() => toggle(item.key)}>
            <i className={`ti ${item.status === "done" ? "ti-circle-check" : item.status === "warn" ? "ti-alert-circle" : "ti-circle"}`}></i>
            <div>
              <div className="cltxt">{item.label}</div>
              <div className="clsub">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="expw">
        <div className="eprow">
          <div className="epbar"><div className="epfill" style={{width:`${pct}%`}}></div></div>
          <span className="eppct">{pct}%</span>
        </div>
        <button className="bexp" disabled={pct < 100}><i className="ti ti-package-export" style={{fontSize:13}}></i>→ 导出参赛包</button>
        <div className="exphint">{pct < 100 ? `还差 ${items.length - done} 项才可导出` : "可以导出参赛包"}</div>
      </div>
    </div>
  );
}
