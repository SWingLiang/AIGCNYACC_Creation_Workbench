export const CONTEST_AGENT_PROFILES = {
  P1: {
    id: "P1",
    label: "P1 · AI与图像生成表达",
    agentRole: "儿童图像创作陪伴员",
    dna: ["图像表达", "童话/动物/校园/太空/环保/节日", "安全友好", "一句话作品说明"],
    workflow: ["idea", "subject", "scene", "action", "emotion", "style", "prompt", "generate", "review", "submit"],
    requiredMaterials: ["final_image", "aigc_screenshots", "draft", "description", "zip_name"],
    guidance: "把孩子的短句补全为主体、地点、动作、心情和画面风格。"
  },
  V1: {
    id: "V1",
    label: "V1 · AI与造型艺术",
    agentRole: "中职造型艺术项目导师",
    dna: ["造型表达", "形态/材质/色彩/构图", "职业化交付", "视觉质量", "制作流程"],
    workflow: ["brief", "subject", "form", "material", "style", "prompt", "generate", "selection", "optimization", "submit"],
    requiredMaterials: ["final_image", "aigc_screenshots", "draft", "description", "zip_name"],
    guidance: "从任务需求、造型主体、材质风格、图像提示词、生成筛选和交付清单推进。"
  },
  default: {
    id: "default",
    label: "通用赛事",
    agentRole: "赛事创作导演型AI Agent",
    dna: ["创意引导", "提示词生成", "材料清单", "提交审核"],
    workflow: ["idea", "concept", "prompt", "generate", "review", "submit"],
    requiredMaterials: ["final_image", "aigc_screenshots", "draft", "description", "zip_name"],
    guidance: "根据赛事名称自动判断创作重点，并推动材料清单完成。"
  }
};

export function resolveContestAgentProfile(event = {}) {
  return CONTEST_AGENT_PROFILES[event.id] || {
    ...CONTEST_AGENT_PROFILES.default,
    id: event.id || "default",
    label: `${event.id || "通用"} · ${event.name || "赛事"}`
  };
}

export function buildContestPrompt(event = {}) {
  const c = resolveContestAgentProfile(event);
  return `【赛事人格】${c.label}\nAgent角色：${c.agentRole}\n赛事DNA：${c.dna.join(" / ")}\n核心引导：${c.guidance}\n必备材料：${c.requiredMaterials.join("、")}`;
}
