<div align="center">

<img src="https://capsule-render.vercel.app/api?type=blur&color=0:000000,100:434343&height=240&section=header&text=AI%20Hub&fontSize=80&fontColor=00FFCC&animation=scaleIn&fontAlignY=38&desc=Discover.%20Build.%20Scale%20with%20AI&descAlignY=62&descSize=18" width="100%"/>

<br/>

[![Auto Update](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/auto-update.yml/badge.svg)](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/auto-update.yml)
[![Validate APIs](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/validate.yml/badge.svg)](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/validate.yml)
[![Weekly Report](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/weekly-report.yml/badge.svg)](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/weekly-report.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![APIs Count](https://img.shields.io/badge/APIs-150%2B-blue.svg?style=flat-square)](#)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![Stars](https://img.shields.io/github/stars/FluxeniteMC/Ai-hub?style=flat-square&color=yellow)](https://github.com/FluxeniteMC/Ai-hub/stargazers)

<br/>

> *"You don't need to know every AI API out there. You just need to know where to find them."*

<br/>

**This is the place.** A living, breathing directory of every AI API worth knowing about — from the ones that are completely free to the ones that cost more than a Tesla. Updated automatically every week by Gemini AI so you never have to wonder if the info is stale.

<br/>

[🆓 Free APIs](#-free-tier-apis) · [💸 Freemium](#-freemium-apis) · [💰 Paid](#-paid-apis) · [💎 Enterprise](#-enterprise--expensive-apis) · [🏠 Self-Host](#-open-source--self-hostable) · [📊 Pricing](#-pricing-comparison) · [🤝 Contribute](#-how-to-contribute)

</div>

---

## 👋 Hey, welcome!

I built this because I got tired of Googling "is there a free AI API for X" every single time I started a new project. There are *hundreds* of AI APIs out there and they change constantly — new ones launch, old ones die, pricing shifts every few months.

So this directory exists to answer one question: **"What AI API should I use for this?"** — whether you're a hobbyist on a $0 budget or an engineer at a company spending $50K/month on inference.

Everything here is:
- ✅ Organized by price tier AND category
- ✅ Auto-validated weekly (dead links get flagged)
- ✅ Refreshed by Gemini AI every Sunday
- ✅ Community-maintained (PRs very welcome)

Let's get into it. 👇

---

## 📋 Table of Contents

- [🆓 Free Tier APIs](#-free-tier-apis) — Zero cost, no CC needed
- [💸 Freemium APIs](#-freemium-apis) — Start free, scale paid
- [💰 Paid APIs](#-paid-apis) — Production-grade, token-based
- [💎 Enterprise APIs](#-enterprise--expensive-apis) — Big budgets, big features
- [🏠 Open Source / Self-Hostable](#-open-source--self-hostable) — Run it yourself
- [🧠 By Category](#-by-category)
  - [Large Language Models](#-large-language-models-llms)
  - [Image Generation](#-image-generation)
  - [Audio & Speech](#-audio--speech)
  - [Video Generation](#-video-generation)
  - [Embeddings & Vector Search](#-embeddings--vector-search)
  - [Code Generation](#-code-generation)
  - [Multimodal](#-multimodal)
  - [Specialized & Domain-Specific](#-specialized--domain-specific)
- [📊 Pricing Comparison](#-pricing-comparison)
- [🤖 How Automation Works](#-how-automation-works)
- [🤝 How to Contribute](#-how-to-contribute)
- [❓ FAQ](#-faq)

---

## 🆓 Free Tier APIs

> These APIs are genuinely free — not "free trial for 7 days" free, but actually free to use with real limits. Most don't even ask for a credit card. Perfect for side projects, prototypes, and learning.

| API | Provider | Category | Free Limit | What Makes It Special |
|-----|----------|----------|------------|----------------------|
| [Gemini API](https://ai.google.dev/) | Google | LLM + Multimodal | 15 RPM · 1M TPM | Gemini 1.5 Flash free — fast and surprisingly capable |
| [Groq API](https://console.groq.com/) | Groq | LLM | 14,400 req/day | Insanely fast. Like, embarrassingly fast compared to others |
| [Cohere Trial](https://cohere.com/) | Cohere | LLM + Embeddings | 1,000 calls/month | Great embeddings, no CC needed |
| [HuggingFace Inference](https://huggingface.co/inference-api) | HuggingFace | Everything | Rate limited | Access to thousands of community models |
| [Mistral Free](https://mistral.ai/) | Mistral AI | LLM | Limited RPM | European-made, surprisingly good at reasoning |
| [Together AI](https://www.together.ai/) | Together AI | LLM | $25 credit on signup | Runs most open models at competitive speed |
| [Fireworks AI](https://fireworks.ai/) | Fireworks | LLM | $1 free credit | Fast inference on open source models |
| [OpenRouter Free](https://openrouter.ai/) | OpenRouter | LLM Router | Select free models | One API to rule them all — routes to 50+ providers |
| [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) | Cloudflare | LLM + Vision | 10K neurons/day | Run AI at the edge, globally |
| [Ollama](https://ollama.ai/) | Ollama | LLM (local) | Unlimited | Run models 100% locally, zero network calls |
| [Perplexity API](https://www.perplexity.ai/api) | Perplexity | LLM + Search | $5 credit | Search-augmented LLM — knows what happened yesterday |
| [Replicate](https://replicate.com/) | Replicate | Multi | $0.50 credit | Run any model from the community with one API call |
| [Stability AI](https://platform.stability.ai/) | Stability AI | Image Gen | 25 free credits | SD models, good for experimentation |
| [DeepInfra](https://deepinfra.com/) | DeepInfra | LLM | $1.80 free | Cheap inference, lots of open models |
| [Cerebras](https://cloud.cerebras.ai/) | Cerebras | LLM | Free during beta | Custom silicon, ridiculous throughput |
| [SambaNova Cloud](https://cloud.sambanova.ai/) | SambaNova | LLM | Free tier | Fast inference on large models |
| [NVIDIA NIM](https://build.nvidia.com/) | NVIDIA | LLM + Multimodal | 1,000 credits/month | NVIDIA's own model hosting — solid performance |
| [Mistral Le Chat](https://chat.mistral.ai/) | Mistral AI | LLM | Free chat interface | Not an API, but useful for testing |

---

## 💸 Freemium APIs

> Start free, pay when you grow. These are the APIs most developers use in production — you get real capacity for free, and pricing kicks in at scale. Ideal for building products without upfront cost.

| API | Provider | Category | Free Tier | Paid Starts At |
|-----|----------|----------|-----------|----------------|
| [OpenAI API](https://platform.openai.com/) | OpenAI | LLM + Multimodal | $5 credit (new accounts) | ~$0.15/1M tokens (mini) |
| [Anthropic Claude](https://www.anthropic.com/api) | Anthropic | LLM | $5 credit (new) | $0.25/1M tokens (Haiku) |
| [Azure OpenAI](https://azure.microsoft.com/ai-services/openai-service) | Microsoft | LLM + Multimodal | $200 credit (new Azure) | Pay-as-you-go |
| [AWS Bedrock](https://aws.amazon.com/bedrock/) | Amazon | LLM + Multimodal | AWS Free Tier applies | Pay-as-you-go |
| [Vertex AI](https://cloud.google.com/vertex-ai) | Google Cloud | LLM + Multimodal | $300 credit (new GCP) | Pay-as-you-go |
| [Cohere](https://cohere.com/) | Cohere | LLM + Embeddings | Trial API key | From $0.40/1M tokens |
| [Deepgram](https://deepgram.com/) | Deepgram | Speech-to-Text | $200 credit | $0.0043/min |
| [ElevenLabs](https://elevenlabs.io/) | ElevenLabs | Text-to-Speech | 10K characters/month | $5/month (22K chars) |
| [AssemblyAI](https://www.assemblyai.com/) | AssemblyAI | Speech AI | $50 credit | $0.013/min |
| [Pinecone](https://www.pinecone.io/) | Pinecone | Vector DB | 1 free index (2GB) | $70/month |
| [Weaviate Cloud](https://weaviate.io/) | Weaviate | Vector DB | Free sandbox (14 days) | $25/month |
| [Voyage AI](https://www.voyageai.com/) | Voyage | Embeddings | 50M tokens/month | $0.06/1M tokens |
| [Jina AI](https://jina.ai/) | Jina | Embeddings + Rerank | 1M tokens free | $0.018/1M tokens |
| [Unstructured](https://unstructured.io/) | Unstructured | Document Parsing | Free tier | Custom pricing |
| [Eden AI](https://www.edenai.co/) | Eden AI | Multi-provider wrapper | Free tier | Pay-as-you-go |
| [Roboflow](https://roboflow.com/) | Roboflow | Computer Vision | 1K images/month | $249/month |
| [Clarifai](https://www.clarifai.com/) | Clarifai | Vision + LLM | 1K operations/month | From $30/month |
| [Speechify](https://speechify.com/api) | Speechify | TTS | Free tier | From $99/year |

---

## 💰 Paid APIs

> These are the workhorse APIs that power real products. Some have tiny free credits to get started, but they're fundamentally token-based, production-grade services. The quality is generally excellent — you get what you pay for.

| API | Provider | Category | Pricing Model | Approx Cost |
|-----|----------|----------|---------------|-------------|
| [OpenAI GPT-4o](https://platform.openai.com/) | OpenAI | LLM | Per token | $5 / $15 per 1M tokens in/out |
| [Claude 3.5 Sonnet](https://www.anthropic.com/api) | Anthropic | LLM | Per token | $3 / $15 per 1M tokens |
| [Claude 3 Haiku](https://www.anthropic.com/api) | Anthropic | LLM | Per token | $0.25 / $1.25 per 1M tokens |
| [Gemini 1.5 Pro](https://ai.google.dev/) | Google | LLM + Multimodal | Per token | $3.50 / $10.50 per 1M tokens |
| [Gemini 1.5 Flash](https://ai.google.dev/) | Google | LLM | Per token | $0.075 / $0.30 per 1M tokens |
| [Mistral Large](https://mistral.ai/) | Mistral AI | LLM | Per token | $8 / $24 per 1M tokens |
| [Mistral Small](https://mistral.ai/) | Mistral AI | LLM | Per token | $1 / $3 per 1M tokens |
| [Command R+](https://cohere.com/) | Cohere | LLM | Per token | $3 / $15 per 1M tokens |
| [DeepSeek V3](https://www.deepseek.com/) | DeepSeek | LLM | Per token | $0.14 / $0.28 per 1M tokens 🔥 |
| [Llama API](https://www.llama-api.com/) | Meta (via partners) | LLM | Per token | Varies by host |
| [DALL-E 3](https://platform.openai.com/) | OpenAI | Image Gen | Per image | $0.04 – $0.12/image |
| [Midjourney](https://docs.midjourney.com/) | Midjourney | Image Gen | Subscription | From $10/month |
| [Adobe Firefly](https://developer.adobe.com/firefly-services/) | Adobe | Image Gen | Per credit | Custom |
| [Ideogram API](https://ideogram.ai/) | Ideogram | Image Gen | Per image | $0.08/image |
| [Flux 1.1 Pro](https://replicate.com/black-forest-labs) | Black Forest Labs | Image Gen | Per run | $0.04/image |
| [Kling API](https://klingai.com/) | Kuaishou | Video Gen | Per credit | Custom |
| [RunwayML](https://runwayml.com/) | Runway | Video Gen | Per credit | From $15/month |
| [Pika API](https://pika.art/) | Pika | Video Gen | Per credit | Custom |
| [Suno API](https://suno.com/) | Suno | Music Gen | Subscription | From $10/month |
| [Udio API](https://www.udio.com/) | Udio | Music Gen | Subscription | Custom |
| [PlayHT](https://play.ht/) | PlayHT | TTS | Per character | $0.003/1K chars |
| [Cartesia](https://cartesia.ai/) | Cartesia | TTS | Per character | Custom |
| [Resemble AI](https://www.resemble.ai/) | Resemble | Voice Cloning | Per minute | Custom |
| [Tavily](https://tavily.com/) | Tavily | Search AI | Per search | $0.001/search |
| [Exa AI](https://exa.ai/) | Exa | Semantic Search | Per search | $0.005/search |
| [Serper](https://serper.dev/) | Serper | Web Search | Per search | $0.001/search |

---

## 💎 Enterprise / Expensive APIs

> These are the APIs that come with account managers, SLAs, compliance certifications, and pricing that requires a procurement process. If you need HIPAA, SOC 2, or private VPC deployment — this is your section.

| API | Provider | Category | Minimum Cost | What You're Actually Paying For |
|-----|----------|----------|--------------|--------------------------------|
| [OpenAI Enterprise](https://openai.com/enterprise) | OpenAI | LLM Platform | Custom | SSO, no training on your data, admin controls |
| [Anthropic Claude Enterprise](https://www.anthropic.com/) | Anthropic | LLM Platform | Custom | 500K context window, usage policies, audit logs |
| [AWS Bedrock Enterprise](https://aws.amazon.com/bedrock/) | Amazon | AI Platform | $500+/month | VPC deployment, compliance guardrails, AWS ecosystem |
| [Azure OpenAI Enterprise](https://azure.microsoft.com/) | Microsoft | AI Platform | $1,000+/month | Private endpoints, compliance certifications |
| [Google Vertex AI Enterprise](https://cloud.google.com/vertex-ai) | Google | AI Platform | $1,000+/month | MLOps platform, model registry, Gemini access |
| [IBM Watsonx](https://www.ibm.com/watsonx) | IBM | AI Platform | Custom | Governance, explainability, hybrid cloud |
| [Salesforce Einstein](https://www.salesforce.com/products/einstein/) | Salesforce | CRM AI | Bundled with CRM | Deeply embedded in Sales/Service Cloud |
| [Oracle AI Services](https://www.oracle.com/ai/) | Oracle | Enterprise AI | Custom | Oracle ecosystem integration |
| [SAP AI Core](https://www.sap.com/products/artificial-intelligence.html) | SAP | Enterprise AI | Custom | Built for SAP business processes |
| [Palantir AIP](https://www.palantir.com/platforms/aip/) | Palantir | Operational AI | $500K+/year | Defense, intelligence, critical infrastructure |
| [Scale AI](https://scale.com/) | Scale | Data + Fine-tuning | $50K+/project | Human-in-the-loop data labeling + model fine-tuning |
| [Cohere Enterprise](https://cohere.com/) | Cohere | LLM | Custom | HIPAA, private cloud, on-prem option |
| [Writer Enterprise](https://writer.com/) | Writer | LLM (Enterprise) | $18/user/month+ | Built for enterprise content workflows |
| [Glean](https://www.glean.com/) | Glean | Enterprise Search | Custom | Workplace AI that knows your internal docs |
| [Moveworks](https://www.moveworks.com/) | Moveworks | IT Automation AI | Custom | Automates IT helpdesk with AI |
| [Vectara](https://vectara.com/) | Vectara | RAG Platform | Custom | Enterprise RAG with hallucination control |

---

## 🏠 Open Source / Self-Hostable

> Why pay per token when you can run it yourself? These tools let you host models on your own hardware — unlimited usage, full privacy, no vendor lock-in. The tradeoff: you need the GPU for it.

| Project | Category | Model Size Support | License | Why People Love It |
|---------|----------|--------------------|---------|-------------------|
| [Ollama](https://ollama.ai/) | LLM Runner | Any (GGUF) | MIT | One command to run any model. The easiest self-host experience. |
| [LM Studio](https://lmstudio.ai/) | LLM Runner | Any | Free (proprietary) | Beautiful GUI, great for non-developers |
| [LocalAI](https://localai.io/) | LLM API Server | Any | MIT | Drop-in OpenAI replacement, 100% local |
| [Llama.cpp](https://github.com/ggerganov/llama.cpp) | Inference Engine | Any (GGUF) | MIT | The OG. Runs LLMs on CPU. Surprisingly fast. |
| [vLLM](https://github.com/vllm-project/vllm) | LLM Serving | Any (HF) | Apache 2.0 | Production-grade serving with PagedAttention |
| [Text Generation WebUI](https://github.com/oobabooga/text-generation-webui) | LLM UI | Any | AGPL-3.0 | Feature-rich web interface, tons of extensions |
| [Jan](https://jan.ai/) | LLM Desktop App | Any | AGPL-3.0 | Clean desktop app, no technical setup needed |
| [GPT4All](https://gpt4all.io/) | LLM Runner | Various | MIT | Runs on CPU, dead simple, good for beginners |
| [Open WebUI](https://openwebui.com/) | LLM UI | Any | MIT | ChatGPT-like interface for local models |
| **Models you can self-host:** | | | | |
| [Llama 3.1 / 3.2](https://llama.meta.com/) | LLM | 8B · 70B · 405B | Meta License | Meta's flagship open models. 70B rivals GPT-4 |
| [Mistral / Mixtral](https://mistral.ai/models/) | LLM | 7B · 8x7B · 8x22B | Apache 2.0 | Excellent efficiency, strong reasoning |
| [DeepSeek R1](https://huggingface.co/deepseek-ai) | LLM | 7B · 70B | MIT | Reasoning model, open weights, wild performance |
| [Qwen 2.5](https://huggingface.co/Qwen) | LLM | 0.5B → 72B | Apache 2.0 | Alibaba's multilingual monster |
| [Phi-3 / Phi-4](https://huggingface.co/microsoft) | LLM | 3.8B · 14B | MIT | Microsoft's small but mighty models |
| [Gemma 2](https://huggingface.co/google) | LLM | 2B · 9B · 27B | Gemma License | Google's lightweight open models |
| [Stable Diffusion XL](https://huggingface.co/stabilityai) | Image Gen | — | CreativeML | The image generation backbone. Run it locally. |
| [Whisper](https://github.com/openai/whisper) | Speech-to-Text | Tiny → Large | MIT | OpenAI's transcription model. Runs offline. |
| [Bark](https://github.com/suno-ai/bark) | Text-to-Speech | — | MIT | Expressive TTS, can do laughing/sighing/etc |
| [Coqui TTS](https://github.com/coqui-ai/TTS) | Text-to-Speech | Various | MPL 2.0 | Voice cloning, many languages |
| [Tortoise TTS](https://github.com/neonbjb/tortoise-tts) | Text-to-Speech | — | Apache 2.0 | Slow but very human-like voices |
| [Chroma](https://www.trychroma.com/) | Vector DB | — | Apache 2.0 | Easiest vector DB to self-host. Works great with LangChain |
| [Qdrant](https://qdrant.tech/) | Vector DB | — | Apache 2.0 | Fast, production-ready, great Rust performance |
| [Milvus](https://milvus.io/) | Vector DB | — | Apache 2.0 | Battle-tested at scale, billion-vector support |

---

## 🧠 By Category

### 🗣 Large Language Models (LLMs)

> The models that read, write, reason, and talk. The core of most AI products.

| Model | Provider | Context Window | Best For | Cost Tier |
|-------|----------|----------------|----------|-----------|
| GPT-4o | OpenAI | 128K | General purpose, tool use | 💰 Paid |
| GPT-4o mini | OpenAI | 128K | Fast, cheap everyday tasks | 💸 Freemium |
| o1 / o3 | OpenAI | 200K | Deep reasoning, math, science | 💰 Paid |
| Claude 3.5 Sonnet | Anthropic | 200K | Writing, coding, long documents | 💰 Paid |
| Claude 3.5 Haiku | Anthropic | 200K | Speed + cost balance | 💸 Freemium |
| Gemini 1.5 Pro | Google | 1M (!!) | Massive documents, video | 💰 Paid |
| Gemini 1.5 Flash | Google | 1M | Fast, free tier available | 🆓 Free |
| Llama 3.1 405B | Meta | 128K | Best open model, self-host | 🏠 Open |
| DeepSeek V3 | DeepSeek | 128K | Cheapest capable model | 💰 Paid |
| Mistral Large | Mistral | 128K | European compliance, strong reasoning | 💰 Paid |
| Qwen 2.5 72B | Alibaba | 128K | Multilingual, coding | 🏠 Open |
| Command R+ | Cohere | 128K | RAG, enterprise search | 💰 Paid |

---

### 🎨 Image Generation

> From pixel art to photorealism. These APIs turn text into images (and images into images).

| API | Provider | Style | Speed | Cost |
|-----|----------|-------|-------|------|
| [DALL-E 3](https://platform.openai.com/) | OpenAI | Photorealistic + artistic | Medium | $0.04–$0.12/image |
| [Midjourney](https://docs.midjourney.com/) | Midjourney | Highly artistic, dreamy | Slow | From $10/month |
| [Flux 1.1 Pro](https://replicate.com/black-forest-labs) | Black Forest Labs | Photorealistic | Fast | $0.04/image |
| [Flux Schnell](https://replicate.com/black-forest-labs) | Black Forest Labs | Good quality | Very fast | $0.003/image 🔥 |
| [Ideogram v2](https://ideogram.ai/) | Ideogram | Best for text in images | Medium | $0.08/image |
| [Adobe Firefly](https://developer.adobe.com/firefly-services/) | Adobe | Commercially safe | Medium | Custom |
| [Stable Diffusion XL](https://stability.ai/) | Stability AI | Flexible | Fast | Free (self-host) |
| [Kandinsky 3](https://huggingface.co/) | Sber | Artistic | Medium | Free (HF) |
| [Leonardo AI](https://leonardo.ai/) | Leonardo | Game assets, concept art | Medium | Freemium |

---

### 🎙 Audio & Speech

> Turn text to voice, voice to text, or voice to different voice. The audio stack is booming.

| API | Type | Languages | Free Tier | Standout Feature |
|-----|------|-----------|-----------|-----------------|
| [Whisper](https://platform.openai.com/) | STT | 99 languages | Via API credit | Best open-source transcription model |
| [Deepgram](https://deepgram.com/) | STT | 30+ | $200 credit | Real-time streaming, ultra-low latency |
| [AssemblyAI](https://www.assemblyai.com/) | STT + Analysis | 20+ | $50 credit | Speaker diarization, content moderation |
| [ElevenLabs](https://elevenlabs.io/) | TTS + Clone | 29 | 10K chars/month | Most realistic voice cloning on the market |
| [PlayHT](https://play.ht/) | TTS + Clone | 142 | Limited | 900+ voices, ultra-realistic |
| [Cartesia](https://cartesia.ai/) | TTS | 10+ | — | Lowest latency TTS for real-time apps |
| [OpenAI TTS](https://platform.openai.com/) | TTS | Many | Via credit | 6 voices, very natural, simple API |
| [Google Cloud TTS](https://cloud.google.com/text-to-speech) | TTS | 220+ | 1M chars/month | Widest language support |
| [Azure Speech](https://azure.microsoft.com/speech-service/) | TTS + STT | 140+ | 5 hours STT free | Neural voices, real-time translation |
| [Coqui TTS](https://github.com/coqui-ai/TTS) | TTS + Clone | Many | Free (self-host) | Open source voice cloning |
| [Resemble AI](https://www.resemble.ai/) | Voice Cloning | English | — | 3 second clone, emotion control |
| [Suno](https://suno.com/) | Music Gen | — | Free plan | Full song generation from text |
| [Udio](https://www.udio.com/) | Music Gen | — | Free plan | High quality music generation |

---

### 🎬 Video Generation

> 2024 was the year video AI got real. These APIs can generate seconds-to-minutes of video from text or images.

| API | Provider | Max Length | Resolution | Notes |
|-----|----------|------------|------------|-------|
| [Sora](https://sora.com/) | OpenAI | 60 seconds | 1080p | OpenAI's flagship video model |
| [Runway Gen-3 Alpha](https://runwayml.com/) | Runway | 10 seconds | 720p | Best for creative / cinematic |
| [Kling 1.6](https://klingai.com/) | Kuaishou | 3 minutes | 1080p | Long duration, great motion |
| [Pika 2.0](https://pika.art/) | Pika | 10 seconds | 720p | Image-to-video, text-to-video |
| [Luma Dream Machine](https://lumalabs.ai/) | Luma | 30 seconds | 720p | Fast generation, smooth motion |
| [Hailuo AI](https://hailuoai.com/) | MiniMax | 6 seconds | 720p | Very realistic human motion |
| [Wan 2.1](https://github.com/Wan-Video/Wan2.1) | Wanx | Variable | 720p | Open source, self-hostable |
| [Stable Video Diffusion](https://stability.ai/) | Stability AI | 4 seconds | 576p | Open source, local GPU |

---

### 🔢 Embeddings & Vector Search

> Embeddings are how AI understands meaning. If you're building search, RAG, or recommendations — you need these.

| Model | Provider | Dimensions | Context | Best For |
|-------|----------|------------|---------|----------|
| text-embedding-3-large | OpenAI | 3072 | 8K | Highest quality general embeddings |
| text-embedding-3-small | OpenAI | 1536 | 8K | Good quality, much cheaper |
| Voyage-3-large | Voyage AI | 1024 | 32K | Best retrieval performance for RAG |
| Cohere embed-v3 | Cohere | 1024 | 512 | Multilingual, 100+ languages |
| Jina embeddings v3 | Jina AI | 1024 | 8K | Multi-task, free tier |
| Nomic Embed | Nomic | 768 | 8K | Open source, great on long docs |
| BGE-M3 | BAAI | 1024 | 8K | Open, multilingual, free |
| GTE-large | Alibaba | 1024 | 8K | Strong performance, open source |

**Vector Databases to pair with these:**

| DB | Hosting | Free Tier | Notes |
|----|---------|-----------|-------|
| [Pinecone](https://pinecone.io/) | Managed | 1 index | Most popular, great DX |
| [Weaviate](https://weaviate.io/) | Both | Sandbox | GraphQL, multi-modal |
| [Qdrant](https://qdrant.tech/) | Both | Self-host free | Fast, Rust-based |
| [Chroma](https://trychroma.com/) | Self-host | Free | Easiest to start with |
| [Milvus](https://milvus.io/) | Both | Self-host free | Scales to billions |
| [pgvector](https://github.com/pgvector/pgvector) | Self-host | Free | Postgres extension, zero new infra |

---

### 💻 Code Generation

> AI that writes, reviews, explains, and debugs code. The category that changed software development.

| API | Best Language Support | Context | Special Ability |
|-----|----------------------|---------|-----------------|
| Claude 3.5 Sonnet | All major languages | 200K | Best at understanding entire codebases |
| GPT-4o | All | 128K | Great for tool use and multi-step coding |
| DeepSeek Coder V2 | 338 languages | 128K | Code-first training, surprisingly strong |
| Qwen2.5-Coder-32B | All | 128K | Open source, strong math + code |
| Codestral | 80+ languages | 32K | Fill-in-the-middle for autocomplete |
| Starcoder2 15B | 600+ languages | 16K | Open, good for rare languages |
| CodeLlama 70B | All major | 100K | Meta's dedicated code model |

---

### 🌐 Multimodal

> APIs that can see images, read documents, watch videos, and listen to audio — not just text.

| API | Inputs Supported | Notes |
|-----|-----------------|-------|
| GPT-4o | Text · Image · Audio | Full multimodal, real-time audio mode |
| Gemini 1.5 Pro | Text · Image · Video · Audio · Code | 1M context, can watch hour-long videos |
| Claude 3.5 Sonnet | Text · Image · PDF | Best at reading complex documents |
| Gemini 1.5 Flash | Text · Image · Video | Fast + cheap version of Pro |
| LLaVA 1.6 | Text · Image | Open source, self-hostable |
| Qwen-VL | Text · Image · Video | Open, multilingual vision |
| PaliGemma 2 | Text · Image | Google's compact vision model |
| InternVL2 | Text · Image | Open, strong on Chinese + English |

---

### 🔬 Specialized & Domain-Specific

> AI models trained specifically for one field — often better than general-purpose models for their domain.

| API | Domain | Provider | Access |
|-----|--------|----------|--------|
| [BioMedLM](https://huggingface.co/stanford-crfm/BioMedLM) | Biomedical NLP | Stanford | HuggingFace (free) |
| [Med-PaLM 2](https://cloud.google.com/vertex-ai) | Medical Q&A | Google | Vertex AI (waitlist) |
| [BloombergGPT](https://huggingface.co/bloomberg) | Finance | Bloomberg | Research only |
| [FinGPT](https://github.com/AI4Finance-Foundation/FinGPT) | Finance | AI4Finance | Open source |
| [AlphaFold API](https://alphafold.ebi.ac.uk/) | Protein Folding | DeepMind / EMBL-EBI | Free for research |
| [ESM-2](https://huggingface.co/facebook/esm2_t33_650M_UR50D) | Protein Language | Meta | HuggingFace (free) |
| [LegalBERT](https://huggingface.co/nlpaueb/legal-bert-base-uncased) | Legal Text | AUEB | HuggingFace (free) |
| [StarCoder2](https://huggingface.co/bigcode/starcoder2-15b) | Code (600 langs) | BigCode | HuggingFace (free) |
| [Galactica](https://huggingface.co/facebook/galactica-120b) | Scientific Text | Meta | HuggingFace |
| [BioBERT](https://huggingface.co/dmis-lab/biobert-v1.1) | Biomedical | DMIS Lab | HuggingFace (free) |
| [ClinicalBERT](https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT) | Clinical Notes | Emily Alsentzer | HuggingFace (free) |

---

## 📊 Pricing Comparison

> Numbers current as of early 2025. AI pricing changes constantly — always verify on official pages before budgeting.

### LLM Cost per 1M Tokens (Input → Output)

```
Model                  Input ($)    Output ($)   Context    Tier
────────────────────────────────────────────────────────────────
o1                     $15.00       $60.00       200K       💰
GPT-4o                 $5.00        $15.00       128K       💰
Claude 3.5 Sonnet      $3.00        $15.00       200K       💰
Gemini 1.5 Pro         $3.50        $10.50       1M         💰
Mistral Large          $8.00        $24.00       128K       💰
Command R+             $3.00        $15.00       128K       💰
────────────────────────────────────────────────────────────────
GPT-4o mini            $0.15        $0.60        128K       💸
Claude 3.5 Haiku       $0.25        $1.25        200K       💸
Gemini 1.5 Flash       $0.075       $0.30        1M         💸
Mistral Small          $1.00        $3.00        128K       💸
────────────────────────────────────────────────────────────────
DeepSeek V3            $0.14        $0.28        128K       💰 🔥
Llama 3.3 70B (Groq)   ~$0.59       ~$0.79       128K       🆓
Gemini Flash (free)    FREE         FREE         1M         🆓
────────────────────────────────────────────────────────────────
Llama 3.1 70B (self)   $0.00        $0.00        128K       🏠
Mistral 7B (self)      $0.00        $0.00        32K        🏠
```

### Image Generation Cost

```
Model                  Cost/Image   Resolution    Notes
──────────────────────────────────────────────────────────
Midjourney             ~$0.02       Custom        Subscription-based
Flux Schnell           $0.003       Custom        Fastest option 🔥
DALL-E 3 Standard      $0.04        1024×1024     OpenAI quality
Flux 1.1 Pro           $0.04        Custom        High quality
Ideogram v2            $0.08        1024×1024     Best for text
DALL-E 3 HD            $0.08–$0.12  1024×1024     Highest detail
Adobe Firefly          Custom       Custom        Commercial-safe
SD XL (self-hosted)    ~$0.001      Custom        GPU electricity cost
```

### Speech-to-Text Cost

```
Provider               Cost/min     Real-time?   Accuracy
──────────────────────────────────────────────────────────
OpenAI Whisper         $0.006       No           Excellent
Deepgram Nova-2        $0.0043      Yes ✓        Excellent
AssemblyAI             $0.013       Yes ✓        Good + features
Google STT             $0.016       Yes ✓        Good
Azure Speech           $0.016       Yes ✓        Good
Whisper (self-host)    ~$0.00       No           Same as OpenAI
```

---

## 🤖 How Automation Works

This repo uses **5 GitHub Actions workflows** all powered by the Gemini API to keep itself up to date. Here's exactly what runs and when:

| Workflow | Schedule | What It Does |
|----------|----------|--------------|
| `auto-update.yml` | Every Sunday at midnight UTC | Asks Gemini to check for pricing changes, new APIs, and deprecated ones |
| `validate.yml` | Every Wednesday at 6 AM UTC | Checks every single link in the README is still alive |
| `weekly-report.yml` | Every Saturday at 8 AM UTC | Generates a Markdown digest of AI API news for the week |
| `pr-automation.yml` | Every PR opened | Auto-labels PRs using Gemini, posts welcome message |
| `changelog.yml` | Every release | Generates a formatted changelog from commit history |

### Setting It Up in Your Fork

```
1. Fork this repo
2. Go to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name:  GEMINI_API_KEY
   Value: your key from aistudio.google.com (it's free!)
5. Done — workflows run automatically from here
```

You can also trigger any workflow manually from the **Actions** tab → select workflow → **Run workflow**.

---

## 🤝 How to Contribute

This directory is only as good as the people who maintain it. If you know of an API that's missing, pricing that's wrong, or a link that's dead — please fix it!

### Adding a New API

1. Fork this repo
2. Find the right section in `README.md`
3. Add a row following the exact table format
4. Submit a PR with title: `add: [API Name] - [Category]`

Gemini will auto-label your PR. A maintainer will review and merge.

### Reporting Issues

- **Dead link?** → Open an issue or just fix it in a PR
- **Wrong pricing?** → Please include a source URL
- **Missing API?** → Use the Add API issue template

### Guidelines

- ✅ One API per PR (keeps reviews clean)
- ✅ Include a working link
- ✅ Pricing must be accurate with a source
- ✅ Choose the right tier (free / freemium / paid / enterprise)
- ❌ No affiliate links
- ❌ No self-promotion without disclosure

---

## ❓ FAQ

**Q: How often is this updated?**
A: Automatically every Sunday via Gemini AI. Links are validated every Wednesday. You can also manually trigger updates anytime.

**Q: I found wrong pricing — how do I report it?**
A: Open an issue using the "Update Pricing" template, or just submit a PR with a source link. Pricing changes fast in this space.

**Q: Can I use this data in my own project?**
A: Yes! MIT licensed. Credit this repo if you can.

**Q: What's the difference between free and freemium?**
A: Free = genuinely free with permanent limits, no CC required. Freemium = free to start but designed to convert you to a paid plan.

**Q: Is Gemini actually updating the README automatically?**
A: It updates the last-updated date and logs pricing/new API suggestions to the `data/` folder. Manual merging is still required for actual content changes — Gemini doesn't directly edit the README without human review.

**Q: My API isn't listed — can I add it?**
A: Absolutely. Open a PR or use the issue template. If it's a real, functional API with documented pricing, it belongs here.

---

## 📄 License

MIT — do whatever you want with it. See [LICENSE](LICENSE).

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

**Found this useful? Give it a ⭐ — it helps others find it too.**

[🐛 Report an Issue](https://github.com/FluxeniteMC/Ai-hub/issues) · [➕ Add an API](https://github.com/FluxeniteMC/Ai-hub/issues/new?template=add_api.yml) · [💰 Update Pricing](https://github.com/FluxeniteMC/Ai-hub/issues/new?template=update_pricing.yml) · [📖 Setup Guide](SETUP.md)

*Auto-updated every Sunday by Gemini AI · Validated every Wednesday · Maintained with ❤️ by the community*

</div>
