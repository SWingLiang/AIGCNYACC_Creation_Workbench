import os
from typing import Dict, List, Optional

import requests
from openai import OpenAI


def get_client() -> OpenAI:
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    if not api_key:
        raise RuntimeError("ARK_API_KEY is not set. Copy .env.example to .env and fill your Volcengine Ark key.")
    return OpenAI(api_key=api_key, base_url=base_url)


def chat_completion(messages: List[Dict[str, str]], temperature: float = 0.7) -> str:
    client = get_client()
    model = os.getenv("ARK_MODEL", "doubao-seed-1-6-251015")
    resp = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )
    return resp.choices[0].message.content or ""


def image_generation(prompt: str, size: str = "1024x1024") -> Dict[str, Optional[str]]:
    """
    Ark image model APIs vary by enabled model/endpoint.
    This implementation first tries OpenAI-compatible images.generate.
    If your endpoint uses a different model name or task API, set ARK_IMAGE_MODEL in .env.
    """
    client = get_client()
    model = os.getenv("ARK_IMAGE_MODEL", "doubao-seedream-3-0-t2i-250415")
    try:
        resp = client.images.generate(
            model=model,
            prompt=prompt,
            size=size,
            n=1,
        )
        data = resp.data[0]
        url = getattr(data, "url", None)
        b64 = getattr(data, "b64_json", None)
        return {
            "text": "图像生成完成。" if url or b64 else "图像生成请求已返回，但未找到URL或base64。",
            "image_url": url,
            "b64_json": b64
        }
    except Exception as e:
        fallback = chat_completion([
            {"role":"system","content":"你是AI图像生成提示词专家。"},
            {"role":"user","content":"请把下面内容整理为专业图像生成提示词，并给出负面提示词与尺寸建议：\n" + prompt}
        ])
        return {
            "text": "图像接口未成功，已先生成可用于图像模型的专业提示词：\n\n" + fallback + f"\n\n原始图像接口错误：{str(e)}",
            "image_url": None,
            "b64_json": None
        }


def video_generation(prompt: str, duration: int = 5, ratio: str = "16:9") -> Dict[str, Optional[str]]:
    """
    Video generation in Ark is task based. This submits a generation task to
    /contents/generations/tasks and returns task id/status payload when available.
    Different video endpoints may require additional image_url or model-specific fields;
    when the endpoint rejects the request, the backend returns a structured fallback
    prompt package so the UI still guides the user correctly.
    """
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3").rstrip("/")
    model = os.getenv("ARK_VIDEO_MODEL")
    if not api_key:
        raise RuntimeError("ARK_API_KEY is not set.")
    if not model:
        raise RuntimeError("ARK_VIDEO_MODEL is not set.")

    enriched_prompt = (
        f"{prompt}\n\n"
        f"【视频参数】比例：{ratio}；时长：约{duration}秒；适合儿童/青少年赛事展示；画面安全、明亮、无恐怖暴力。"
    )
    payload = {
        "model": model,
        "content": [
            {"type": "text", "text": enriched_prompt}
        ]
    }
    try:
        resp = requests.post(
            f"{base_url}/contents/generations/tasks",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )
        data = resp.json() if resp.content else {}
        if resp.status_code >= 400:
            raise RuntimeError(data.get("message") or data.get("error") or resp.text)
        task_id = data.get("id") or data.get("task_id") or data.get("data", {}).get("id") or data.get("data", {}).get("task_id")
        video_url = data.get("video_url") or data.get("url") or data.get("data", {}).get("video_url") or data.get("data", {}).get("url")
        return {
            "text": "视频生成任务已提交。视频模型通常需要等待一段时间完成；如返回 task_id，请在火山方舟控制台或后续轮询接口查看结果。",
            "task_id": task_id,
            "video_url": video_url,
            "raw": data,
        }
    except Exception as e:
        fallback = chat_completion([
            {"role":"system","content":"你是AI视频生成提示词与分镜导演。"},
            {"role":"user","content":"请把下面内容整理为适合视频生成模型的提示词，包含：镜头、动作、时长、画面风格、字幕/旁白建议、负面提示词。\n" + enriched_prompt}
        ])
        return {
            "text": "视频接口未成功，已先生成可用于视频模型的专业视频提示词：\n\n" + fallback + f"\n\n原始视频接口错误：{str(e)}",
            "task_id": None,
            "video_url": None,
            "raw": None,
        }
