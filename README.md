# AIGCNYACC React + FastAPI + Volcengine Ark Agent

本项目由 `index_ui_optimized_prompt_freemium_flow.html` 升级而来，保留了：
- 学段 / 赛项选择
- 灵感对话 Agent
- 基础提示词免费流程
- 高级提示词魔豆结构
- 材料清单
- AIGC 生成入口

## 重要安全说明

不要把火山 Ark API Key 写入 React 前端。前端代码会暴露给浏览器用户。

正确做法是：

```txt
React 前端 → FastAPI 后端 → 火山方舟 Ark API
```

## 后端启动

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
```

编辑 `.env`：

```env
ARK_API_KEY=你的火山方舟API Key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_MODEL=你的文本模型或Endpoint ID
ARK_IMAGE_MODEL=你的图像模型或Endpoint ID
```

启动：

```bash
uvicorn main:app --reload --port 8000
```

测试：

```bash
python test_ark.py
```

## 前端启动

```bash
cd frontend
npm install
npm run dev
```

打开：

```txt
http://localhost:5173
```

## API Key 校验说明

当前沙盒无法保证直接访问外部火山服务，因此项目内提供 `backend/test_ark.py`。在你本地填入 `.env` 后运行即可校验 Key、模型名/Endpoint 是否可用。

## 默认模型说明

火山方舟兼容 OpenAI SDK 的调用方式：设置 `base_url`、`model`、`api_key` 即可调用。具体模型名/Endpoint ID 以你的火山方舟控制台为准。
