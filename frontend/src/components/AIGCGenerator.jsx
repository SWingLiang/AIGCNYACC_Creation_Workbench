import React, { useMemo, useState } from "react";
import { generateText, generateImage, generateVideo } from "../services/api.js";

function buildFinalPrompt(customPrompt, selectedPromptItems) {
  const presetText = (selectedPromptItems || [])
    .map((x, idx) => `${idx + 1}. 【${x.pack} / ${x.label}】${x.desc}`)
    .join("\n");
  return [
    customPrompt?.trim() ? `【用户自定义描述】\n${customPrompt.trim()}` : "",
    presetText ? `【已选预设参数】\n${presetText}` : ""
  ].filter(Boolean).join("\n\n");
}

export default function AIGCGenerator({ profile, event, capKey, selectedPromptItems, onHistory }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const finalPrompt = useMemo(() => buildFinalPrompt(prompt, selectedPromptItems), [prompt, selectedPromptItems]);
  const selectedCost = (selectedPromptItems || []).reduce((s, x) => s + (x.cost || 0), 0);
  const selectedForMode = (selectedPromptItems || []).filter(x => !x.mode || x.mode === capKey);

  async function runGenerate() {
    if (!finalPrompt.trim()) return;
    setBusy(true);
    setResult("");
    setImageUrl("");
    setVideoUrl("");
    try {
      if (capKey === "image") {
        const data = await generateImage({ prompt: finalPrompt, user_profile: profile, contest: event });
        setResult(data.text || data.message || "图像生成任务已提交。");
        if (data.image_url) setImageUrl(data.image_url);
        if (data.b64_json) setImageUrl(`data:image/png;base64,${data.b64_json}`);
        onHistory?.({type:"image", title:"图像生成", text:finalPrompt});
      } else if (capKey === "video") {
        const data = await generateVideo({ prompt: finalPrompt, user_profile: profile, contest: event });
        setResult(data.text || data.message || (data.task_id ? `视频生成任务已提交：${data.task_id}` : "视频生成任务已提交。"));
        if (data.video_url) setVideoUrl(data.video_url);
        onHistory?.({type:"video", title:"视频生成", text:finalPrompt});
      } else {
        const data = await generateText({ prompt: finalPrompt, mode: capKey, user_profile: profile, contest: event });
        setResult(data.text || "");
        onHistory?.({type:capKey, title: capKey === "text" ? "文本生成" : `${capKey}生成`, text:finalPrompt});
      }
    } catch (err) {
      setResult("生成失败：" + err.message + "\n\n请检查后端 .env 中对应模型是否正确：文本 ARK_MODEL，图像 ARK_IMAGE_MODEL，视频 ARK_VIDEO_MODEL。");
    } finally {
      setBusy(false);
    }
  }

  const buttonText = capKey === "image" ? "调用图像模型生成" : capKey === "video" ? "调用视频模型提交任务" : "调用文本模型生成";
  const buttonColor = capKey === "image" ? "#378ADD" : capKey === "video" ? "#BA7517" : "#7F77DD";

  return (
    <>
      <textarea className="pta" value={prompt} onChange={e=>setPrompt(e.target.value)}
        placeholder={capKey === "video"
          ? "例如：一只会飞的小猫，从彩虹上飞过，镜头慢慢推进，画面温暖可爱…"
          : profile.gradeNumber <= 2 ? "例如：一只会飞的小猫，在彩虹上帮助朋友…" : "请输入创作提示词，或通过左侧灵感对话提取…"} />

      {selectedForMode.length > 0 && (
        <div className="selected-under-input">
          <div className="selected-title">已选预设参数 · 会与上方自定义描述合并</div>
          <div className="selected-list">
            {selectedForMode.map(s => <span key={s.id} className={`sel-pill ${s.tier === "advanced" ? "pro" : ""}`}>{s.pack}：{s.label}</span>)}
          </div>
          <div className="selected-cost">预计消耗：{selectedCost} 魔豆</div>
        </div>
      )}

      {finalPrompt && <details className="hint-box final-prompt-box"><summary>查看最终组合提示词</summary><pre>{finalPrompt}</pre></details>}

      <div className="cost-row">
        <button className="bgen" style={{background: buttonColor}} onClick={runGenerate} disabled={busy || !finalPrompt.trim()}>
          {busy ? <span className="spin"></span> : <i className="ti ti-sparkles" style={{fontSize:14}}></i>}
          {buttonText}
        </button>
        <button className="bsm" onClick={()=>setPrompt("")}>清空描述</button>
        <span className="cost-note"><b>Ark</b> {capKey === "video" ? "Video" : capKey === "image" ? "Image" : "Text"}</span>
      </div>
      <div className="rb">{busy ? `正在调用后端 / 火山 Ark ${capKey} 模型…` : result || "生成结果将在这里显示。"}</div>
      {imageUrl && <div className="preview-grid"><div className="preview-card"><b>图像结果</b><img src={imageUrl} /></div></div>}
      {videoUrl && <div className="preview-grid"><div className="preview-card"><b>视频结果</b><video src={videoUrl} controls /></div></div>}
    </>
  );
}
