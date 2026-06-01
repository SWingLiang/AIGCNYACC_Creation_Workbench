import { resolveGradeAgentProfile } from "./grade_agent_profiles.js";
import { resolveContestAgentProfile } from "./contest_agent_profiles.js";

export const WORKFLOW_STAGE_PROFILES = {
  idea: { label: "灵感探索", goal: "听懂学生想法，补全主题、主体和方向", nextQuestion: "你最想让画面里出现谁？" },
  subject: { label: "主体确定", goal: "确定主角、物件或核心造型", nextQuestion: "它长什么样？" },
  scene: { label: "场景确定", goal: "确定地点、时间和画面环境", nextQuestion: "它在哪里？" },
  action: { label: "动作事件", goal: "确定角色正在做什么", nextQuestion: "它正在做什么？" },
  emotion: { label: "情绪氛围", goal: "确定开心、勇敢、神秘、安静等情绪", nextQuestion: "它是什么心情？" },
  style: { label: "风格选择", goal: "确定图像风格、色彩和质感", nextQuestion: "你想让它像动画片、童话书、蜡笔画，还是照片？" },
  prompt: { label: "提示词整理", goal: "把想法整理成可用于AI生成的提示词", nextQuestion: "要不要我把它整理成AI绘图提示词？" },
  generate: { label: "AI生成", goal: "调用生成模型得到候选作品", nextQuestion: "你想先生成一版看看吗？" },
  review: { label: "作品优化", goal: "检查视觉效果和材料缺项", nextQuestion: "你想优化颜色、主角，还是背景？" },
  submit: { label: "提交准备", goal: "检查截图、草图、说明和ZIP命名", nextQuestion: "我们现在检查参赛材料清单好吗？" },
  brief: { label: "任务定位", goal: "明确创作任务、用途、对象和交付标准", nextQuestion: "这个作品是偏角色造型、器物造型，还是视觉海报？" },
  form: { label: "形态设计", goal: "明确轮廓、比例、结构和造型语言", nextQuestion: "你希望它更圆润、锋利、机械，还是有机自然？" },
  material: { label: "材质系统", goal: "明确陶瓷、木材、金属、布料、透明材质等质感", nextQuestion: "你希望它是什么材质？" },
  selection: { label: "候选筛选", goal: "从多张生成结果中挑选方向", nextQuestion: "你更喜欢哪一版？为什么？" },
  optimization: { label: "迭代优化", goal: "根据评审标准优化视觉与说明", nextQuestion: "我们优先优化主体、色彩、构图，还是作品说明？" }
};

const FIELD_STAGE_MAP = [
  { keys: ["subject", "character", "mainRole", "visual_subject"], stage: "subject" },
  { keys: ["scene", "location", "background"], stage: "scene" },
  { keys: ["action", "event", "story"], stage: "action" },
  { keys: ["emotion", "mood"], stage: "emotion" },
  { keys: ["style", "color", "material"], stage: "style" },
  { keys: ["prompt"], stage: "generate" },
  { keys: ["finalImage", "final_image"], stage: "review" },
  { keys: ["description", "aigc_screenshots", "zip_name"], stage: "submit" }
];

export function inferWorkflowStage({ event, memory = {}, checklist = [], fallback = "idea" }) {
  const contest = resolveContestAgentProfile(event);
  const flow = contest.workflow || [];
  const doneChecklist = new Set((checklist || []).filter(i => i.status === "done").map(i => i.key));

  if (doneChecklist.has("zip") || doneChecklist.has("zip_name")) return "submit";
  for (const rule of FIELD_STAGE_MAP) {
    if (rule.keys.some(k => memory[k])) fallback = rule.stage;
  }
  if (!flow.includes(fallback)) return flow[0] || "idea";
  return fallback;
}

export function getWorkflowStageProfile(stage) {
  return WORKFLOW_STAGE_PROFILES[stage] || WORKFLOW_STAGE_PROFILES.idea;
}

export function buildWorkflowPrompt({ stage, event, checklist = [] }) {
  const contest = resolveContestAgentProfile(event);
  const s = getWorkflowStageProfile(stage);
  const missing = (checklist || []).filter(i => i.status !== "done").map(i => i.label || i.key);
  return `【工作流状态】${s.label}\n当前目标：${s.goal}\n建议下一问：${s.nextQuestion}\n赛事流程：${contest.workflow.join(" → ")}\n当前缺失材料：${missing.length ? missing.join("、") : "已基本完成"}`;
}

export function composeAgentContext({ profile, event, stage, checklist = [], memory = {} }) {
  const grade = resolveGradeAgentProfile(profile);
  const contest = resolveContestAgentProfile(event);
  const currentStage = stage || inferWorkflowStage({ event, memory, checklist });
  const workflow = getWorkflowStageProfile(currentStage);
  return {
    grade,
    contest,
    workflow,
    stage: currentStage,
    stageLabel: workflow.label,
    summary: `${contest.agentRole}｜${grade.label}｜${workflow.label}`,
    systemHints: [
      `年级人格：${grade.label}`,
      `赛事人格：${contest.label}`,
      `当前阶段：${workflow.label}`,
      `下一步目标：${workflow.goal}`
    ]
  };
}

export function getNextWorkflowStage({ event, currentStage }) {
  const contest = resolveContestAgentProfile(event);
  const flow = contest.workflow || [];
  const idx = flow.indexOf(currentStage);
  if (idx < 0) return flow[0] || currentStage;
  return flow[Math.min(idx + 1, flow.length - 1)] || currentStage;
}
