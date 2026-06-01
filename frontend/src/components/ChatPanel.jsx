import React, { useMemo, useRef, useState } from "react";
import { chatWithAgent } from "../services/api.js";
import { composeAgentContext, getClientAgentDescription } from "../prompts/agentProfiles.js";
import { getNextWorkflowStage } from "../prompts/workflow_engine.js";

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function speakText(text, gradeNumber = 1) {
  if (!window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`>\-]/g, ""));
  utterance.lang = "zh-CN";
  utterance.rate = gradeNumber <= 2 ? 0.85 : 0.95;
  utterance.pitch = gradeNumber <= 2 ? 1.15 : 1.0;
  window.speechSynthesis.speak(utterance);
  return true;
}

export default function ChatPanel({ profile, event, checklist, onAgentPatch }) {
  const [messages, setMessages] = useState([
    { role:"assistant", content:"你好呀！我是你的小小创作陪伴员。你可以说一句想画什么，我会帮你慢慢变成参赛作品。" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceHint, setVoiceHint] = useState("");
  const recRef = useRef(null);
  const bottomRef = useRef(null);
  const [stage, setStage] = useState("idea");
  const [memory, setMemory] = useState({});

  const agentContext = useMemo(() => composeAgentContext({ profile, event, stage, checklist, memory }), [profile, event, stage, checklist, memory]);
  const agentDesc = useMemo(() => getClientAgentDescription({
    gradeKey: profile.gradeKey, gradeNumber: profile.gradeNumber, event, stage, checklist
  }), [profile.gradeKey, profile.gradeNumber, event, stage, checklist]);

  const quicks = profile.gradeNumber <= 2
    ? ["我想画小猫", "太空旅行", "彩虹城堡", "环保小卫士"]
    : ["帮我找主题", "整理材料清单", "生成图像提示词", "检查参赛包"];

  async function send(text = input) {
    const value = (text || "").trim();
    if (!value || busy) return;
    const next = [...messages, {role:"user", content:value}];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const data = await chatWithAgent({
        user_profile: profile,
        contest: event,
        stage,
        workflow_context: agentContext,
        memory,
        checklist,
        messages: next.map(m => ({ role:m.role, content:m.content }))
      });
      const reply = data.reply || "我理解了，我们继续下一步。";
      setMessages([...next, {role:"assistant", content:reply}]);
      if (profile.gradeNumber <= 2) speakText(reply, profile.gradeNumber);
      if (data.state_patch) {
        onAgentPatch?.(data.state_patch);
        if (data.state_patch.next_stage) setStage(data.state_patch.next_stage);
        else setStage(prev => getNextWorkflowStage({ event, currentStage: prev }));
        if (data.state_patch.memory) setMemory(prev => ({...prev, ...data.state_patch.memory}));
      } else {
        setStage(prev => getNextWorkflowStage({ event, currentStage: prev }));
      }
    } catch (err) {
      const fail = "后端或火山模型暂时没有连通：" + err.message;
      setMessages([...next, {role:"assistant", kind:"err", content:fail}]);
      speakText("生成失败，请检查网络或稍后再试。", profile.gradeNumber);
    } finally {
      setBusy(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({behavior:"smooth"}), 50);
    }
  }

  function voiceInsp() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      const msg = "当前浏览器暂不支持语音识别。请用 Chrome 或 Edge，并确认麦克风权限已允许。";
      setVoiceHint(msg);
      setMessages(m => [...m, {role:"assistant", kind:"system", content:msg}]);
      return;
    }

    if (listening && recRef.current) {
      recRef.current.stop();
      return;
    }

    try {
      const rec = new SpeechRecognition();
      recRef.current = rec;
      rec.lang = "zh-CN";
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      setListening(true);
      setVoiceHint("正在听你说话…说完会自动填到输入框。若浏览器询问麦克风权限，请选择允许。");

      let finalText = "";
      rec.onresult = e => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t;
          else interim += t;
        }
        setInput((finalText || interim).trim());
      };
      rec.onerror = e => {
        const reason = e?.error === "not-allowed" ? "麦克风权限未允许" : e?.error === "no-speech" ? "没有听到声音" : e?.error || "未知错误";
        const msg = `语音识别失败：${reason}。可以再点一次麦克风，或先用文字输入。`;
        setVoiceHint(msg);
        setMessages(m => [...m, {role:"assistant", kind:"err", content:msg}]);
      };
      rec.onend = () => {
        setListening(false);
        setVoiceHint(finalText ? "已识别到文字，可以点击发送。" : "语音已结束。如没有出现文字，请再试一次或使用文字输入。");
      };
      rec.start();
    } catch (err) {
      setListening(false);
      const msg = "语音识别启动失败：" + err.message;
      setVoiceHint(msg);
      setMessages(m => [...m, {role:"assistant", kind:"err", content:msg}]);
    }
  }

  function readMessage(content) {
    const ok = speakText(content, profile.gradeNumber);
    if (!ok) setVoiceHint("当前浏览器不支持文字朗读，请使用 Chrome 或 Edge。")
  }

  return (
    <div className="insp">
      <div className="ihd">
        <i className="ti ti-sparkles" style={{fontSize:13,color:"var(--amber)"}}></i>
        <span className="ilbl">灵感对话 Agent</span>
        <span className="iext" onClick={() => { setStage("prompt"); send("请把我的灵感整理成适合AI生成的提示词，并告诉我下一步材料清单。") }}>→ 提取咒语</span>
      </div>
      <div className="agent-card" style={{margin:"8px 9px 0"}}>
        <div className="agent-title"><span className="api-dot"></span>{agentDesc}</div>
        <div className="agent-sub">当前阶段：{agentContext.stageLabel}｜年级决定口吻，赛事决定内容，工作流决定下一步。</div>
      </div>
      <div className="quick-row">
        {quicks.map(q => <button key={q} className="quick-chip" onClick={() => send(q)}>{q}</button>)}
      </div>
      <div className="imsgs">
        {messages.map((m, i) => (
          <div key={i} className={`mi ${m.role === "user" ? "mi-u" : m.kind === "err" ? "mi-err" : m.kind === "system" ? "mi-system" : "mi-ai"}`}>
            <div>{m.content}</div>
            {m.role === "assistant" && !m.kind && <button className="read-btn" onClick={() => readMessage(m.content)}>🔊 朗读</button>}
          </div>
        ))}
        {busy && <div className="mi mi-ai loading-pulse">AI正在帮你理解想法，并整理下一步…</div>}
        <div ref={bottomRef}/>
      </div>
      <div className="ift">
        <div className="iin-row">
          <input className="iin" value={input} onChange={e=>setInput(e.target.value)}
            placeholder={profile.gradeNumber <= 2 ? "可以打字，也可以点语音说…" : "请输入创作想法…"}
            onKeyDown={e => { if (e.key === "Enter") send(); }} />
        </div>
        {voiceHint && <div className={`voice-hint ${listening ? "on" : ""}`}>{listening ? "🎙️ " : ""}{voiceHint}</div>}
        <div className="ib-row">
          <button className="ibtn" title="上传灵感材料">+</button>
          <button className={`ibtn ${listening ? "listening" : ""}`} title="语音输入" onClick={voiceInsp}>{listening ? "⏹" : "🎙️"}</button>
          <button className="ibtn" title="停止朗读" onClick={() => window.speechSynthesis?.cancel()}>🔇</button>
          <button className="isend" onClick={() => send()} disabled={busy}>{busy ? "…" : "发送"}</button>
        </div>
      </div>
    </div>
  );
}
