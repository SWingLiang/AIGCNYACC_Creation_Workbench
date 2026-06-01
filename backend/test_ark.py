
"""
Run:
  cd backend
  cp .env.example .env
  # edit .env with your ARK_API_KEY and model/endpoint
  python test_ark.py
"""
from dotenv import load_dotenv
load_dotenv()

from services.ark_client import chat_completion

if __name__ == "__main__":
    print(chat_completion([
        {"role":"system","content":"你是一个简洁的连通性测试助手。"},
        {"role":"user","content":"请回复：火山方舟API连通测试成功。"}
    ]))
