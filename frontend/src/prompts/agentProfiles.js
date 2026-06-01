import { buildGradePrompt, resolveGradeAgentProfile } from "./grade_agent_profiles.js";
import { buildContestPrompt, resolveContestAgentProfile } from "./contest_agent_profiles.js";
import { buildWorkflowPrompt, composeAgentContext } from "./workflow_engine.js";

export function getClientAgentDescription({ gradeKey, gradeNumber, event, stage = "idea", checklist = [] }) {
  const ctx = composeAgentContext({
    profile: { gradeKey, gradeNumber },
    event,
    stage,
    checklist
  });
  return ctx.summary;
}

export function buildClientAgentPrompt({ profile, event, stage, checklist = [], memory = {} }) {
  return [
    "你是 AIGCNYACC 青少年AIGC赛事平台的赛事创作导演型AI Agent。",
    buildGradePrompt(profile),
    buildContestPrompt(event),
    buildWorkflowPrompt({ stage, event, checklist }),
    `【当前记忆】${JSON.stringify(memory || {}, null, 2)}`,
    "【硬性要求】先复述理解，再推进一个最小步骤；低龄学生每次只问一个问题；不要替学生完全决定；必要时给2-4个选择。"
  ].join("\n\n");
}

export { resolveGradeAgentProfile, resolveContestAgentProfile, composeAgentContext };
