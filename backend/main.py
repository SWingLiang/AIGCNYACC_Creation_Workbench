
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import AgentChatRequest, TextGenerateRequest, ImageGenerateRequest, VideoGenerateRequest
from agents.prompt_builder import build_agent_messages, build_generation_messages
from services.ark_client import chat_completion, image_generation, video_generation

load_dotenv()

app = FastAPI(title="AIGCNYACC Ark Agent Backend", version="0.1.0")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],  # during prototype; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "ok": True,
        "ark_key_configured": bool(os.getenv("ARK_API_KEY")),
        "ark_base_url": os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3"),
        "ark_model": os.getenv("ARK_MODEL", "doubao-seed-1-6-251015"),
        "ark_image_model": os.getenv("ARK_IMAGE_MODEL", ""),
        "ark_video_model": os.getenv("ARK_VIDEO_MODEL", ""),
    }

@app.post("/api/agent/chat")
def agent_chat(req: AgentChatRequest):
    try:
        messages = build_agent_messages(req.model_dump())
        reply = chat_completion(messages, temperature=0.65)
        return {
            "reply": reply,
            "state_patch": {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate/text")
def generate_text(req: TextGenerateRequest):
    try:
        messages = build_generation_messages(req.prompt, req.mode, req.user_profile, req.contest)
        text = chat_completion(messages, temperature=0.75)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate/image")
def generate_image(req: ImageGenerateRequest):
    try:
        result = image_generation(req.prompt, req.size or "1024x1024")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate/video")
def generate_video(req: VideoGenerateRequest):
    try:
        result = video_generation(req.prompt, req.duration or 5, req.ratio or "16:9")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
