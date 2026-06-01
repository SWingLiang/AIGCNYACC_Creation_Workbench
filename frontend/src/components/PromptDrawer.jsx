import React, { useMemo, useState } from "react";
import { getPromptPacks } from "../data/promptPacks.js";

export default function PromptDrawer({ event, capKey, onPromptBuild }) {
  const [selected, setSelected] = useState([]);

  const packs = useMemo(() => getPromptPacks(event.id, capKey), [event.id, capKey]);

  function toggle(pack, item) {
    const id = `${capKey}:${pack.id}:${item[0]}`;
    const exists = selected.some(s => s.id === id);
    const next = exists
      ? selected.filter(s => s.id !== id)
      : [...selected, {id, mode:capKey, pack:pack.name, label:item[0], desc:item[1], cost:item[2], tier:pack.tier}];
    setSelected(next);
    onPromptBuild?.(next);
  }

  function clearAll() {
    setSelected([]);
    onPromptBuild?.([]);
  }

  const total = selected.reduce((s, x) => s + (x.cost || 0), 0);
  const modeName = capKey === "video" ? "视频生成" : capKey === "image" ? "图像生成" : capKey === "text" ? "文本生成" : "生成";

  return (
    <div className="magic-block">
      <div className="flow-panel">
        <div className="flow-head">
          <div>
            <div className="flow-title">{modeName}提示词流程</div>
            <div className="flow-sub">当前赛项：{event.id} · {event.name}。不同生成类型使用不同预设，不再混用图像/视频提示词。</div>
          </div>
          <span className="flow-free">基础流程 0+ 魔豆</span>
        </div>
        <div className="flow-steps">
          {(capKey === "video"
            ? ["先定视频比例", "再定镜头动作", "补充分镜", "提交视频任务"]
            : capKey === "image"
              ? ["先定画面主题", "再定主体场景", "补全风格情绪", "生成图像"]
              : ["先定文本形式", "再定主题", "补全语气", "生成说明"]
          ).map((x,i)=>(
            <div className="flow-card" key={x}>
              <div className="flow-card-title"><span className="flow-no">{i+1}</span>{x}</div>
              <div className="flow-card-desc">一步一步完成，预设会和下方自定义描述合并成最终提示词。</div>
            </div>
          ))}
        </div>
      </div>

      <div className="magic-head">
        <span className="magic-title">Prompt Magic · {modeName}</span>
        <span className="magic-cost-mini">已选 {selected.length} 项</span>
        <span className="magic-stat"><span className="total">预计 {total} 魔豆</span></span>
        <button className="magic-clear" onClick={clearAll}>清空</button>
      </div>

      {packs.length === 0 && <div className="hint-box">当前生成类型暂无预设，可直接在下方输入描述。</div>}

      {packs.map(pack => (
        <div className="magic-section" key={pack.id}>
          <div className={`magic-sec-title ${pack.tier === "advanced" ? "advanced" : "basic"}`}>
            {pack.name}
            <span className={pack.tier === "advanced" ? "pro-badge" : "free-badge"}>{pack.tier === "advanced" ? "高级" : "基础"}</span>
          </div>
          <div className="magic-row">
            {pack.items.map(item => {
              const id = `${capKey}:${pack.id}:${item[0]}`;
              const active = selected.some(s => s.id === id);
              return (
                <button key={id} className={`magic-chip ${pack.tier === "advanced" ? "pro" : ""} ${active ? "active" : ""}`} onClick={() => toggle(pack, item)} title={item[1]}>
                  {item[0]} <span className="mprice">{item[2] === 0 ? "0豆" : item[2] + "豆"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
