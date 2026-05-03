[README (1).md](https://github.com/user-attachments/files/27319374/README.1.md)
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=blur&color=0:000000,100:434343&height=240&section=header&text=AI%20Hub&fontSize=80&fontColor=00FFCC&animation=scaleIn&fontAlignY=38&desc=Discover.%20Build.%20Scale%20with%20AI&descAlignY=62&descSize=18" width="100%"/>

<br/>

[![Auto Update](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/auto-update.yml/badge.svg)](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/auto-update.yml)
[![Validate APIs](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/validate.yml/badge.svg)](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/validate.yml)
[![Weekly Report](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/weekly-report.yml/badge.svg)](https://github.com/FluxeniteMC/Ai-hub/actions/workflows/weekly-report.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![APIs Count](https://img.shields.io/badge/APIs-300%2B-blue.svg?style=flat-square)](#)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![Stars](https://img.shields.io/github/stars/FluxeniteMC/Ai-hub?style=flat-square&color=yellow)](https://github.com/FluxeniteMC/Ai-hub/stargazers)
[![Last Updated](https://img.shields.io/badge/Updated-Weekly-brightgreen?style=flat-square)](#)
[![Coverage](https://img.shields.io/badge/Coverage-LLM%20%7C%20Vision%20%7C%20Audio%20%7C%20Video%20%7C%20Search-blueviolet?style=flat-square)](#)

<br/>

> *"You don't need to know every AI API out there. You just need to know where to find them."*

<br/>

**This is the place.** A living, breathing directory of every AI API worth knowing about — from the ones that are completely free to the ones that cost more than a Tesla. Updated automatically every week by Gemini AI so you never have to wonder if the info is stale. Over **300+ APIs and models** catalogued, compared, and organized so you can make a decision in minutes, not hours.

<br/>

[🆓 Free APIs](#-free-tier-apis) · [💸 Freemium](#-freemium-apis) · [💰 Paid](#-paid-apis) · [💎 Enterprise](#-enterprise--expensive-apis) · [🏠 Self-Host](#-open-source--self-hostable) · [🧠 By Category](#-by-category) · [📊 Pricing](#-pricing-comparison) · [🔧 Tools & Frameworks](#-developer-tools--frameworks) · [🚀 Getting Started](#-getting-started-guide) · [🤝 Contribute](#-how-to-contribute)

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
- ✅ Includes integration examples and SDK links
- ✅ Covers 300+ APIs across 15+ categories
- ✅ Notes on latency, rate limits, and real-world gotchas

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
  - [Image Editing & Enhancement](#-image-editing--enhancement)
  - [Audio & Speech](#-audio--speech)
  - [Video Generation](#-video-generation)
  - [Video Editing & Enhancement](#-video-editing--enhancement)
  - [Embeddings & Vector Search](#-embeddings--vector-search)
  - [Code Generation & Dev Tools](#-code-generation--dev-tools)
  - [Multimodal](#-multimodal)
  - [Search & Retrieval](#-search--retrieval)
  - [Document AI & OCR](#-document-ai--ocr)
  - [Computer Vision](#-computer-vision)
  - [Agents & Orchestration](#-agents--orchestration)
  - [Specialized & Domain-Specific](#-specialized--domain-specific)
  - [AI Safety & Moderation](#-ai-safety--moderation)
  - [Translation & Multilingual](#-translation--multilingual)
  - [Reasoning & Math](#-reasoning--math)
- [📊 Pricing Comparison](#-pricing-comparison)
- [🔧 Developer Tools & Frameworks](#-developer-tools--frameworks)
- [🚀 Getting Started Guide](#-getting-started-guide)
- [🤖 How Automation Works](#-how-automation-works)
- [🤝 How to Contribute](#-how-to-contribute)
- [❓ FAQ](#-faq)
- [📝 Changelog](#-changelog)

---

## 🆓 Free Tier APIs

> These APIs are genuinely free — not "free trial for 7 days" free, but actually free to use with real limits. Most don't even ask for a credit card. Perfect for side projects, prototypes, and learning.

| API | Provider | Category | Free Limit | Latency | What Makes It Special |
|-----|----------|----------|------------|---------|----------------------|
| [Gemini API](https://ai.google.dev/) | Google | LLM + Multimodal | 15 RPM · 1M TPM · 1500 req/day | Medium | Gemini 1.5 Flash free — fast, multimodal, long context |
| [Gemini 2.0 Flash](https://ai.google.dev/) | Google | LLM + Multimodal | 10 RPM · Free tier | Fast | Newest Gemini model with tool use support |
| [Groq API](https://console.groq.com/) | Groq | LLM | 14,400 req/day · 6000 TPM | 🔥 Ultra-fast | Custom LPU chip — fastest inference available anywhere |
| [Cohere Trial](https://cohere.com/) | Cohere | LLM + Embeddings | 1,000 calls/month | Medium | Great embeddings, no CC needed, multilingual |
| [HuggingFace Inference](https://huggingface.co/inference-api) | HuggingFace | Everything | Rate limited | Varies | Access to 500,000+ community models via one API |
| [Mistral Free](https://mistral.ai/) | Mistral AI | LLM | Limited RPM | Medium | European-made, strong at reasoning, GDPR-friendly |
| [Together AI](https://www.together.ai/) | Together AI | LLM | $25 credit on signup | Fast | 50+ open models, competitive pricing |
| [Fireworks AI](https://fireworks.ai/) | Fireworks | LLM | $1 free credit | Very fast | Function calling on open models |
| [OpenRouter Free](https://openrouter.ai/) | OpenRouter | LLM Router | Select free models (20+) | Varies | Single API key routes to 100+ models/providers |
| [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) | Cloudflare | LLM + Vision | 10K neurons/day | Very low | Run AI at the edge, zero cold starts, global PoPs |
| [Ollama](https://ollama.ai/) | Ollama | LLM (local) | Unlimited | Local | 100% local, zero network calls, 100+ models supported |
| [Perplexity API](https://www.perplexity.ai/api) | Perplexity | LLM + Search | $5 credit | Medium | Search-augmented responses — knows what happened today |
| [Replicate](https://replicate.com/) | Replicate | Multi | $0.50 credit | Varies | Run any community model with a single API call |
| [Stability AI](https://platform.stability.ai/) | Stability AI | Image Gen | 25 free credits | Medium | SD models, good for image experimentation |
| [DeepInfra](https://deepinfra.com/) | DeepInfra | LLM | $1.80 free | Fast | Wide model selection, extremely cheap at scale |
| [Cerebras](https://cloud.cerebras.ai/) | Cerebras | LLM | Free during beta | 🔥 Fastest | Custom silicon wafer-scale chip, insane throughput |
| [SambaNova Cloud](https://cloud.sambanova.ai/) | SambaNova | LLM | Free tier | Fast | Custom RDU chips, strong at large models |
| [NVIDIA NIM](https://build.nvidia.com/) | NVIDIA | LLM + Multimodal | 1,000 credits/month | Fast | NVIDIA's own model hosting, optimized inference |
| [AI21 Studio](https://www.ai21.com/) | AI21 Labs | LLM | 1,500 requests/month | Medium | Jurassic models, strong at long-form writing |
| [Aleph Alpha](https://www.aleph-alpha.com/) | Aleph Alpha | LLM | Limited trial | Medium | European, GDPR-compliant, explainability features |
| [Banana](https://www.banana.dev/) | Banana | Custom ML | Free tier | Varies | Deploy custom ML models in seconds |
| [Modal](https://modal.com/) | Modal | LLM + Custom | $30/month credit | Fast | Serverless GPU, great for custom models |
| [Lightning AI](https://lightning.ai/) | Lightning | LLM + Training | Free studio tier | Medium | Training + inference platform in one |
| [Gradient AI](https://gradient.ai/) | Gradient | LLM | Trial available | Medium | Fine-tuning focused, private model hosting |
| [Lepton AI](https://www.lepton.ai/) | Lepton | LLM | $10 credit | Fast | Clean API, open model hosting, good DX |
| [Anyscale](https://www.anyscale.com/) | Anyscale | LLM | Trial credits | Fast | Ray-based, built for distributed workloads |
| [Octo AI](https://octo.ai/) | OctoAI | LLM + Image | $10 free credit | Fast | Fast open model inference, image gen support |

---

## 💸 Freemium APIs

> Start free, pay when you grow. These are the APIs most developers use in production — you get real capacity for free, and pricing kicks in at scale. Ideal for building products without upfront cost.

| API | Provider | Category | Free Tier | Paid Starts At | Rate Limits | SDKs |
|-----|----------|----------|-----------|----------------|-------------|------|
| [OpenAI API](https://platform.openai.com/) | OpenAI | LLM + Multimodal | $5 credit (new accounts) | ~$0.15/1M tokens (mini) | Tier-based | Python, Node, Go, .NET |
| [Anthropic Claude](https://www.anthropic.com/api) | Anthropic | LLM | $5 credit (new) | $0.25/1M tokens (Haiku) | Tier-based | Python, TypeScript |
| [Azure OpenAI](https://azure.microsoft.com/ai-services/openai-service) | Microsoft | LLM + Multimodal | $200 credit (new Azure) | Pay-as-you-go | Per deployment | All major languages |
| [AWS Bedrock](https://aws.amazon.com/bedrock/) | Amazon | LLM + Multimodal | AWS Free Tier applies | Pay-as-you-go | Per model | AWS SDK (all langs) |
| [Vertex AI](https://cloud.google.com/vertex-ai) | Google Cloud | LLM + Multimodal | $300 credit (new GCP) | Pay-as-you-go | Per project | Python, Java, Go, Node |
| [Cohere](https://cohere.com/) | Cohere | LLM + Embeddings | Trial API key | From $0.40/1M tokens | 100 RPM (trial) | Python, Node, Go, Java |
| [Deepgram](https://deepgram.com/) | Deepgram | Speech-to-Text | $200 credit | $0.0043/min | Unlimited (paid) | Python, Node, Go, .NET, Rust |
| [ElevenLabs](https://elevenlabs.io/) | ElevenLabs | Text-to-Speech | 10K characters/month | $5/month (22K chars) | 2 concurrent (free) | Python, Node |
| [AssemblyAI](https://www.assemblyai.com/) | AssemblyAI | Speech AI | $50 credit | $0.013/min | — | Python, Node, Java, Ruby, Go |
| [Pinecone](https://www.pinecone.io/) | Pinecone | Vector DB | 1 free index (2GB) | $70/month | — | Python, Node, Java, Go |
| [Weaviate Cloud](https://weaviate.io/) | Weaviate | Vector DB | Free sandbox (14 days) | $25/month | — | Python, Go, Java, TS |
| [Voyage AI](https://www.voyageai.com/) | Voyage | Embeddings | 50M tokens/month | $0.06/1M tokens | 300 RPM | Python |
| [Jina AI](https://jina.ai/) | Jina | Embeddings + Rerank | 1M tokens free | $0.018/1M tokens | — | Python, Node, Bash |
| [Unstructured](https://unstructured.io/) | Unstructured | Document Parsing | Free tier | Custom pricing | — | Python |
| [Eden AI](https://www.edenai.co/) | Eden AI | Multi-provider wrapper | Free tier | Pay-as-you-go | — | Python, Node, REST |
| [Roboflow](https://roboflow.com/) | Roboflow | Computer Vision | 1K images/month | $249/month | — | Python, Node |
| [Clarifai](https://www.clarifai.com/) | Clarifai | Vision + LLM | 1K operations/month | From $30/month | — | Python, Node, Java |
| [Speechify](https://speechify.com/api) | Speechify | TTS | Free tier | From $99/year | — | REST |
| [Hugging Face Hub](https://huggingface.co/) | HuggingFace | Model Hub | Free public hosting | $9/month (private) | — | Python (transformers) |
| [Replicate](https://replicate.com/) | Replicate | Multi (any model) | $0.50 credit | Pay-per-run | — | Python, Node, Go, Elixir |
| [Fal.ai](https://fal.ai/) | Fal | Image + Video Gen | Free credits | Pay-per-run | — | Python, Node |
| [Baseten](https://www.baseten.co/) | Baseten | Custom Model Deploy | Free tier | Per compute hour | — | Python |
| [Zep](https://www.getzep.com/) | Zep | Memory for AI | Open source free | Cloud from $5/month | — | Python, Node |
| [LangSmith](https://smith.langchain.com/) | LangChain | LLM Observability | Free dev tier | $39/month (team) | — | Python, Node |
| [Weights & Biases](https://wandb.ai/) | W&B | ML Tracking | Free personal | $50/month (team) | — | Python |
| [Scale AI Eval](https://scale.com/spellbook) | Scale | LLM Evaluation | Limited free | Custom pricing | — | Web UI |
| [PromptLayer](https://promptlayer.com/) | PromptLayer | Prompt Management | Free tier | $199/month | — | Python, Node |
| [Helicone](https://helicone.ai/) | Helicone | LLM Observability | Free (10K req/month) | $20/month | — | REST proxy |

---

## 💰 Paid APIs

> These are the workhorse APIs that power real products. Some have tiny free credits to get started, but they're fundamentally token-based, production-grade services. The quality is generally excellent — you get what you pay for.

| API | Provider | Category | Pricing Model | Input Cost | Output Cost | Context | Notes |
|-----|----------|----------|---------------|------------|-------------|---------|-------|
| [OpenAI GPT-4o](https://platform.openai.com/) | OpenAI | LLM | Per token | $5/1M | $15/1M | 128K | The gold standard for tool use |
| [OpenAI GPT-4o mini](https://platform.openai.com/) | OpenAI | LLM | Per token | $0.15/1M | $0.60/1M | 128K | Great value, most popular model |
| [OpenAI o1](https://platform.openai.com/) | OpenAI | Reasoning LLM | Per token | $15/1M | $60/1M | 200K | Deep reasoning, math, science |
| [OpenAI o3-mini](https://platform.openai.com/) | OpenAI | Reasoning LLM | Per token | $1.10/1M | $4.40/1M | 200K | Affordable reasoning model |
| [Claude 3.5 Sonnet](https://www.anthropic.com/api) | Anthropic | LLM | Per token | $3/1M | $15/1M | 200K | Best for writing, coding, analysis |
| [Claude 3.5 Haiku](https://www.anthropic.com/api) | Anthropic | LLM | Per token | $0.25/1M | $1.25/1M | 200K | Fast + cheap, great for pipelines |
| [Claude 3 Opus](https://www.anthropic.com/api) | Anthropic | LLM | Per token | $15/1M | $75/1M | 200K | Most intelligent Claude model |
| [Gemini 1.5 Pro](https://ai.google.dev/) | Google | LLM + Multimodal | Per token | $3.50/1M | $10.50/1M | 1M | Massive context, video support |
| [Gemini 1.5 Flash](https://ai.google.dev/) | Google | LLM | Per token | $0.075/1M | $0.30/1M | 1M | Fastest Google model, huge context |
| [Gemini 2.0 Flash](https://ai.google.dev/) | Google | LLM + Multimodal | Per token | Custom | Custom | 1M | Latest Gemini, native tool use |
| [Mistral Large 2](https://mistral.ai/) | Mistral AI | LLM | Per token | $8/1M | $24/1M | 128K | European flagship, strong reasoning |
| [Mistral Small](https://mistral.ai/) | Mistral AI | LLM | Per token | $1/1M | $3/1M | 128K | Efficient, fast, good value |
| [Mistral Nemo](https://mistral.ai/) | Mistral AI | LLM | Per token | $0.15/1M | $0.15/1M | 128K | Tiny, efficient, 12B model |
| [Codestral](https://mistral.ai/) | Mistral AI | Code LLM | Per token | $0.20/1M | $0.60/1M | 32K | Code-focused, fill-in-middle |
| [Command R+](https://cohere.com/) | Cohere | LLM | Per token | $3/1M | $15/1M | 128K | Best for RAG, enterprise search |
| [Command R](https://cohere.com/) | Cohere | LLM | Per token | $0.50/1M | $1.50/1M | 128K | Affordable with grounded responses |
| [DeepSeek V3](https://www.deepseek.com/) | DeepSeek | LLM | Per token | $0.14/1M | $0.28/1M | 128K | 🔥 Cheapest capable large model |
| [DeepSeek R1](https://www.deepseek.com/) | DeepSeek | Reasoning LLM | Per token | $0.55/1M | $2.19/1M | 128K | Open weights, reasoning rival to o1 |
| [Llama API](https://www.llama-api.com/) | Meta (hosted) | LLM | Per token | Varies | Varies | 128K | Official hosted Llama access |
| [Perplexity API](https://www.perplexity.ai/api) | Perplexity | LLM + Search | Per token + searches | $1/1M | $1/1M | 128K | Real-time web search included |
| [DALL-E 3](https://platform.openai.com/) | OpenAI | Image Gen | Per image | $0.04–$0.12 | — | — | Best prompt adherence of any model |
| [DALL-E 2](https://platform.openai.com/) | OpenAI | Image Gen | Per image | $0.016–$0.020 | — | — | Older, cheaper, good for edits |
| [Midjourney](https://docs.midjourney.com/) | Midjourney | Image Gen | Subscription | From $10/month | — | — | Most aesthetically impressive outputs |
| [Adobe Firefly](https://developer.adobe.com/firefly-services/) | Adobe | Image Gen | Per credit | Custom | — | — | Commercially safe, no copyright risk |
| [Ideogram API](https://ideogram.ai/) | Ideogram | Image Gen | Per image | $0.08/image | — | — | Best text-in-image of any model |
| [Flux 1.1 Pro](https://replicate.com/black-forest-labs) | Black Forest Labs | Image Gen | Per run | $0.04/image | — | — | Photorealistic, fast |
| [Flux Schnell](https://replicate.com/black-forest-labs) | Black Forest Labs | Image Gen | Per run | $0.003/image | — | — | 🔥 Fastest + cheapest good quality |
| [Stable Image Ultra](https://platform.stability.ai/) | Stability AI | Image Gen | Per credit | $0.08/image | — | — | Highest quality Stability model |
| [Stable Image Core](https://platform.stability.ai/) | Stability AI | Image Gen | Per credit | $0.03/image | — | — | Good quality/price balance |
| [Leonardo AI](https://leonardo.ai/) | Leonardo | Image Gen | Subscription | From $10/month | — | — | Game art, concept art, consistent chars |
| [Kling API](https://klingai.com/) | Kuaishou | Video Gen | Per credit | Custom | — | — | Long video, great motion quality |
| [RunwayML Gen-3](https://runwayml.com/) | Runway | Video Gen | Per credit | From $15/month | — | — | Best for cinematic, creative video |
| [Pika 2.0 API](https://pika.art/) | Pika | Video Gen | Per credit | Custom | — | — | Image-to-video, lipsyncing |
| [Suno API](https://suno.com/) | Suno | Music Gen | Subscription | From $10/month | — | — | Full track generation from prompts |
| [Udio API](https://www.udio.com/) | Udio | Music Gen | Subscription | Custom | — | — | High fidelity music generation |
| [PlayHT](https://play.ht/) | PlayHT | TTS | Per character | $0.003/1K chars | — | — | 900+ voices, 142 languages |
| [Cartesia](https://cartesia.ai/) | Cartesia | TTS | Per character | Custom | — | — | Lowest latency realtime TTS |
| [Resemble AI](https://www.resemble.ai/) | Resemble | Voice Cloning | Per minute | Custom | — | — | 3-second clone, emotion control |
| [Tavily](https://tavily.com/) | Tavily | Search AI | Per search | $0.001/search | — | — | Purpose-built for AI agents |
| [Exa AI](https://exa.ai/) | Exa | Semantic Search | Per search | $0.005/search | — | — | Neural web search, great for RAG |
| [Serper](https://serper.dev/) | Serper | Web Search | Per search | $0.001/search | — | — | Google results without Google API |
| [Apify](https://apify.com/) | Apify | Web Scraping | Per actor run | $5/month | — | — | 1000+ ready scrapers, great for AI data |
| [Firecrawl](https://firecrawl.dev/) | Firecrawl | Web Scraping | Per page | $0.001/page | — | — | AI-ready web scraping, markdown output |
| [Browserbase](https://www.browserbase.com/) | Browserbase | Browser Automation | Per session | Custom | — | — | Headless browser for agents |
| [Diffbot](https://www.diffbot.com/) | Diffbot | Web Extraction | Per call | Custom | — | — | Structured data extraction from web |
| [OpenAI Whisper API](https://platform.openai.com/) | OpenAI | Speech-to-Text | Per minute | $0.006/min | — | — | Best accuracy, supports 97 languages |
| [Deepgram Nova-2](https://deepgram.com/) | Deepgram | STT | Per minute | $0.0043/min | — | — | Fastest realtime STT, great accuracy |
| [OpenAI TTS](https://platform.openai.com/) | OpenAI | TTS | Per character | $0.015/1K chars | — | — | 6 voices, very natural sounding |
| [ElevenLabs Pro](https://elevenlabs.io/) | ElevenLabs | TTS + Clone | Per character | Custom | — | — | Most realistic voice synthesis |
| [Azure Speech](https://azure.microsoft.com/) | Microsoft | TTS + STT | Per character/min | $1/1M chars (neural) | — | — | 400+ voices, 140+ languages |

---

## 💎 Enterprise / Expensive APIs

> These are the APIs that come with account managers, SLAs, compliance certifications, and pricing that requires a procurement process. If you need HIPAA, SOC 2, or private VPC deployment — this is your section.

| API | Provider | Category | Minimum Cost | Compliance | Key Enterprise Features |
|-----|----------|----------|--------------|------------|------------------------|
| [OpenAI Enterprise](https://openai.com/enterprise) | OpenAI | LLM Platform | Custom (est. $20K+/yr) | SOC 2, GDPR | SSO, zero data retention, admin controls, 99.9% SLA |
| [Anthropic Claude Enterprise](https://www.anthropic.com/) | Anthropic | LLM Platform | Custom | SOC 2, HIPAA | 500K context, usage policies, audit logs, fine-tuning |
| [AWS Bedrock Enterprise](https://aws.amazon.com/bedrock/) | Amazon | AI Platform | $500+/month | HIPAA, SOC, FedRAMP | VPC deployment, guardrails, AWS ecosystem integration |
| [Azure OpenAI Enterprise](https://azure.microsoft.com/) | Microsoft | AI Platform | $1,000+/month | HIPAA, SOC 2, FedRAMP | Private endpoints, Azure Active Directory, audit logs |
| [Google Vertex AI Enterprise](https://cloud.google.com/vertex-ai) | Google | AI Platform | $1,000+/month | HIPAA, SOC 2, ISO 27001 | MLOps platform, model registry, Gemini + PaLM access |
| [IBM Watsonx](https://www.ibm.com/watsonx) | IBM | AI Platform | Custom | SOC 2, HIPAA, ISO | Governance, explainability, hybrid cloud, on-prem |
| [Salesforce Einstein](https://www.salesforce.com/products/einstein/) | Salesforce | CRM AI | Bundled with CRM | SOC 2, HIPAA | Deep CRM integration, no-code AI for sales/service |
| [Oracle AI Services](https://www.oracle.com/ai/) | Oracle | Enterprise AI | Custom | Multiple certs | Oracle Cloud integration, OCI infrastructure |
| [SAP AI Core](https://www.sap.com/products/artificial-intelligence.html) | SAP | Enterprise AI | Custom | SAP certifications | Built for SAP business processes, BTP integration |
| [Palantir AIP](https://www.palantir.com/platforms/aip/) | Palantir | Operational AI | $500K+/year | FedRAMP High, IL5 | Defense, intelligence, critical infrastructure use cases |
| [Scale AI](https://scale.com/) | Scale | Data + Fine-tuning | $50K+/project | SOC 2 | HITL data labeling, RLHF, model fine-tuning at scale |
| [Cohere Enterprise](https://cohere.com/) | Cohere | LLM | Custom | HIPAA, SOC 2 | Private cloud, on-prem, custom fine-tuning |
| [Writer Enterprise](https://writer.com/) | Writer | LLM (Enterprise) | $18/user/month+ | SOC 2, HIPAA | Purpose-built for content teams, brand voice control |
| [Glean](https://www.glean.com/) | Glean | Enterprise Search | Custom (est. $50K+/yr) | SOC 2, GDPR | Workplace AI that indexes all internal knowledge |
| [Moveworks](https://www.moveworks.com/) | Moveworks | IT Automation AI | Custom | SOC 2, ISO 27001 | AI helpdesk automation, ITSM integrations |
| [Vectara](https://vectara.com/) | Vectara | RAG Platform | Custom | SOC 2 | Enterprise RAG with hallucination control, FLAIR |
| [Kore.ai](https://kore.ai/) | Kore.ai | Conversational AI | Custom | HIPAA, SOC 2 | No-code bot builder, omnichannel, banking/healthcare focus |
| [Veritone](https://www.veritone.com/) | Veritone | Media AI Platform | Custom | SOC 2 | Media workflows, legal, government, sports |
| [DataRobot](https://www.datarobot.com/) | DataRobot | AutoML Platform | $50K+/year | SOC 2, HIPAA | Automated ML, model governance, explainability |
| [C3.ai](https://c3.ai/) | C3.ai | Enterprise AI | Custom | SOC 2, FedRAMP | Industry-specific AI apps, manufacturing, financial |
| [H2O.ai](https://h2o.ai/) | H2O | AutoML + GenAI | Custom | HIPAA | Driverless AI, H2OGPT, enterprise MLOps |
| [Avaamo](https://avaamo.ai/) | Avaamo | Conversational AI | Custom | HIPAA, SOC 2 | Focused on healthcare, BFSI, retail verticals |
| [Uniphore](https://www.uniphore.com/) | Uniphore | Conversation AI | Custom | GDPR, SOC 2 | Call center automation, real-time agent guidance |

---

## 🏠 Open Source / Self-Hostable

> Why pay per token when you can run it yourself? These tools let you host models on your own hardware — unlimited usage, full privacy, no vendor lock-in. The tradeoff: you need the GPU for it.

### 🖥 LLM Runners & Servers

| Project | Category | License | Min GPU VRAM | Notes |
|---------|----------|---------|--------------|-------|
| [Ollama](https://ollama.ai/) | LLM Runner | MIT | 4GB | Best DX for local models. One command install. `ollama run llama3` |
| [LM Studio](https://lmstudio.ai/) | LLM GUI | Proprietary (free) | 4GB | Drag-and-drop model loading, no CLI needed |
| [LocalAI](https://localai.io/) | LLM API Server | MIT | 4GB | Full OpenAI API compatibility, drop-in replacement |
| [Llama.cpp](https://github.com/ggerganov/llama.cpp) | Inference Engine | MIT | 4GB | OG local inference. CPU support. Quantized GGUF models |
| [vLLM](https://github.com/vllm-project/vllm) | LLM Serving | Apache 2.0 | 16GB+ | Production-grade. PagedAttention. Up to 24x faster serving |
| [TGI (Text Gen Inference)](https://github.com/huggingface/text-generation-inference) | LLM Serving | HuggingFace | 16GB+ | HuggingFace's production inference server, Docker-ready |
| [Text Generation WebUI](https://github.com/oobabooga/text-generation-webui) | LLM UI | AGPL-3.0 | 4GB | Feature-rich, many extensions, supports every format |
| [Jan](https://jan.ai/) | LLM Desktop | AGPL-3.0 | 4GB | Clean ChatGPT-like desktop app, no setup required |
| [GPT4All](https://gpt4all.io/) | LLM Runner | MIT | 4GB (CPU ok) | Runs on CPU alone. Perfect for old machines |
| [Open WebUI](https://openwebui.com/) | LLM UI | MIT | None (frontend) | ChatGPT-style interface for Ollama / LocalAI |
| [Kobold.cpp](https://github.com/LostRuins/koboldcpp) | LLM Server | AGPL-3.0 | 4GB | Great for creative writing, roleplay, very configurable |
| [llm (CLI)](https://github.com/simonw/llm) | CLI Tool | Apache 2.0 | None | Simon Willison's tool — LLM queries from terminal |
| [ExLlamaV2](https://github.com/turboderp/exllamav2) | Inference Engine | MIT | 8GB | Fastest quantized inference for consumer GPUs |
| [MLC LLM](https://github.com/mlc-ai/mlc-llm) | LLM Runtime | Apache 2.0 | Varies | Runs on phones, browsers, GPUs — universal runtime |
| [PowerInfer](https://github.com/SJTU-IPADS/PowerInfer) | Inference Engine | MIT | Low | Uses CPU+GPU split for models that don't fit VRAM |
| [Llama Edge](https://github.com/LlamaEdge/LlamaEdge) | Edge Inference | Apache 2.0 | None | WASM-based, runs at the edge or in browser |

### 🧠 Open Source Models

| Model | Creator | Size Options | License | Benchmark |
|-------|---------|--------------|---------|-----------|
| [Llama 3.3 70B](https://llama.meta.com/) | Meta | 70B | Meta Llama License | Beats GPT-3.5, approaches GPT-4 |
| [Llama 3.2](https://llama.meta.com/) | Meta | 1B · 3B · 11B · 90B | Meta Llama License | Vision support in 11B/90B variants |
| [Llama 3.1](https://llama.meta.com/) | Meta | 8B · 70B · 405B | Meta Llama License | 405B matches GPT-4 on most benchmarks |
| [Mistral 7B](https://mistral.ai/) | Mistral AI | 7B | Apache 2.0 | Outperforms older 13B models |
| [Mixtral 8x7B](https://mistral.ai/) | Mistral AI | 47B (MoE) | Apache 2.0 | MoE architecture, fast, strong reasoning |
| [Mixtral 8x22B](https://mistral.ai/) | Mistral AI | 141B (MoE) | Apache 2.0 | Near-frontier performance, MoE efficiency |
| [DeepSeek V3](https://huggingface.co/deepseek-ai) | DeepSeek | 685B (MoE) | MIT | State-of-art open model, rivals Claude 3.5 |
| [DeepSeek R1](https://huggingface.co/deepseek-ai) | DeepSeek | 7B · 70B · 671B | MIT | Reasoning model, o1-competitive, open weights |
| [Qwen 2.5](https://huggingface.co/Qwen) | Alibaba | 0.5B · 1.5B · 3B · 7B · 14B · 32B · 72B | Apache 2.0 | Strong multilingual, coding, math |
| [Qwen 2.5-Coder](https://huggingface.co/Qwen) | Alibaba | 7B · 32B | Apache 2.0 | Top open code model |
| [Phi-4](https://huggingface.co/microsoft/phi-4) | Microsoft | 14B | MIT | Small but powerful, strong at reasoning |
| [Phi-3.5](https://huggingface.co/microsoft) | Microsoft | 3.8B · 7B | MIT | Runs on phones, surprisingly capable |
| [Gemma 2](https://huggingface.co/google) | Google | 2B · 9B · 27B | Gemma License | Google's lightweight open release |
| [Falcon 180B](https://huggingface.co/tiiuae) | TII UAE | 180B | Falcon License | One of the largest truly open models |
| [OLMo 2](https://huggingface.co/allenai) | Allen AI | 7B · 13B | Apache 2.0 | Fully open (training data, code, weights) |
| [Orca 2](https://huggingface.co/microsoft) | Microsoft | 7B · 13B | MIT | Fine-tuned for reasoning and explanation |
| [Yi 1.5](https://huggingface.co/01-ai) | 01.ai | 6B · 9B · 34B | Apache 2.0 | Strong multilingual, long context (200K) |
| [Solar Pro](https://huggingface.co/upstage) | Upstage | 22B | Apache 2.0 | Outperforms similar-size models on reasoning |
| [Command R (open)](https://huggingface.co/CohereForAI) | Cohere | 35B | CC-BY-NC | RAG-optimized, tool use, open weights |
| [DBRX](https://huggingface.co/databricks/dbrx-base) | Databricks | 132B (MoE) | Open RAIL | Enterprise-grade open MoE model |
| [Aya 23](https://huggingface.co/CohereForAI) | Cohere | 8B · 35B | CC-BY-NC | 23 language multilingual model |
| [InternLM 2.5](https://huggingface.co/internlm) | Shanghai AI Lab | 7B · 20B | Apache 2.0 | Strong at math, code, long contexts |
| [Granite 3](https://huggingface.co/ibm-granite) | IBM | 2B · 8B | Apache 2.0 | Business-focused, enterprise fine-tuning |

### 🎨 Open Source Image Models

| Model | Creator | License | Notes |
|-------|---------|---------|-------|
| [Stable Diffusion XL](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) | Stability AI | CreativeML | Industry-standard open image model |
| [Stable Diffusion 3.5](https://huggingface.co/stabilityai/stable-diffusion-3.5-large) | Stability AI | Stability NCSA | Latest SD, improved prompt adherence |
| [FLUX.1 Dev](https://huggingface.co/black-forest-labs/FLUX.1-dev) | Black Forest Labs | FLUX.1 License | High quality, 12B params, non-commercial |
| [FLUX.1 Schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) | Black Forest Labs | Apache 2.0 | 🔥 Apache licensed, fastest FLUX variant |
| [Playground v2.5](https://huggingface.co/playgroundai/playground-v2.5-1024px-aesthetic) | Playground AI | Playground v2.5 | Aesthetic quality focus |
| [Würstchen](https://huggingface.co/warp-ai/wuerstchen) | Warp AI | MIT | Fast, efficient latent diffusion |
| [DeciDiffusion 2.0](https://huggingface.co/Deci/DeciDiffusion-v2-0) | Deci AI | Apache 2.0 | Efficient architecture, good performance |
| [OpenJourney](https://huggingface.co/prompthero/openjourney) | PromptHero | CreativeML | Midjourney-like style |
| [DreamShaper XL](https://civitai.com/models/112902) | Community | SDXL based | Popular community fine-tune |

### 🎙 Open Source Audio Models

| Model | Creator | License | Notes |
|-------|---------|---------|-------|
| [Whisper Large v3](https://github.com/openai/whisper) | OpenAI | MIT | Best open STT, 97 languages, state of art |
| [Faster Whisper](https://github.com/SYSTRAN/faster-whisper) | SYSTRAN | MIT | 4x faster Whisper using CTranslate2 |
| [WhisperX](https://github.com/m-bain/whisperX) | Max Bain | BSD-2 | Whisper + diarization + alignment |
| [Bark](https://github.com/suno-ai/bark) | Suno | MIT | Expressive TTS, laughing/sighing/etc |
| [Coqui TTS](https://github.com/coqui-ai/TTS) | Coqui AI | MPL 2.0 | Voice cloning, 100+ models, many languages |
| [Tortoise TTS](https://github.com/neonbjb/tortoise-tts) | James Betker | Apache 2.0 | Very human-like, slow but high quality |
| [XTTS v2](https://huggingface.co/coqui/XTTS-v2) | Coqui AI | Coqui Public | Multilingual voice cloning |
| [StyleTTS 2](https://github.com/yl4579/StyleTTS2) | Various | MIT | Diffusion-based, near human-level |
| [MeloTTS](https://github.com/myshell-ai/MeloTTS) | MyShell | MIT | Fast, multilingual, good quality |
| [AudioCraft](https://github.com/facebookresearch/audiocraft) | Meta | MIT | Music + sound generation (MusicGen, AudioGen) |
| [MusicGen](https://huggingface.co/facebook/musicgen-large) | Meta | CC-BY-NC | Text-to-music, multiple sizes |
| [Stable Audio](https://huggingface.co/stabilityai) | Stability AI | Custom | Music generation, variable length |

### 🎬 Open Source Video Models

| Model | Creator | License | Notes |
|-------|---------|---------|-------|
| [Wan 2.1](https://github.com/Wan-Video/Wan2.1) | Alibaba Wanx | Apache 2.0 | State-of-art open video gen, text-to-video |
| [Stable Video Diffusion](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt) | Stability AI | SVD License | Image-to-video, 25 frames |
| [CogVideoX](https://huggingface.co/THUDM/CogVideoX-5b) | THUDM | CogVideoX License | 5B model, good motion quality |
| [AnimateDiff](https://github.com/guoyww/AnimateDiff) | Community | Apache 2.0 | Animate SD images, widely supported |
| [Open-Sora](https://github.com/hpcaitech/Open-Sora) | HPC-AI Tech | Apache 2.0 | Open attempt to replicate Sora |
| [LTX Video](https://huggingface.co/Lightricks/LTX-Video) | Lightricks | Open | Fast, real-time capable video generation |

### 🗃 Open Source Vector Databases

| DB | Language | License | Hosting | Why Use It |
|----|----------|---------|---------|------------|
| [Chroma](https://www.trychroma.com/) | Python | Apache 2.0 | Self-host or cloud | Easiest to start, great for RAG prototypes |
| [Qdrant](https://qdrant.tech/) | Rust | Apache 2.0 | Self-host or cloud | Fast, production-ready, Docker-native |
| [Milvus](https://milvus.io/) | Go | Apache 2.0 | Self-host or cloud | Scales to billions of vectors |
| [Weaviate](https://weaviate.io/) | Go | BSD-3 | Self-host or cloud | GraphQL API, multi-modal support |
| [pgvector](https://github.com/pgvector/pgvector) | C | PostgreSQL | Self-host | Postgres extension — zero new infra needed |
| [LanceDB](https://lancedb.github.io/lancedb/) | Rust | Apache 2.0 | Self-host | Embedded, serverless, disk-based |
| [Faiss](https://github.com/facebookresearch/faiss) | C++ | MIT | Library only | Meta's blazing fast similarity search library |
| [Annoy](https://github.com/spotify/annoy) | C++ | Apache 2.0 | Library only | Spotify's ANN library, memory-mapped |
| [HNSWlib](https://github.com/nmslib/hnswlib) | C++ | Apache 2.0 | Library only | HNSW algorithm, pure library, very fast |
| [Vespa](https://vespa.ai/) | Java | Apache 2.0 | Self-host | Combined search + ML platform |

---

## 🧠 By Category

### 🗣 Large Language Models (LLMs)

> The models that read, write, reason, and talk. The core of most AI products. Organized by capability tier.

**Frontier / Best-in-Class**

| Model | Provider | Context | Strengths | Cost |
|-------|----------|---------|-----------|------|
| GPT-4o | OpenAI | 128K | Tool use, vision, real-time audio | 💰 $5/$15 per 1M |
| o1 | OpenAI | 200K | Math, science, deep reasoning | 💰 $15/$60 per 1M |
| Claude 3.5 Sonnet | Anthropic | 200K | Writing, coding, analysis, docs | 💰 $3/$15 per 1M |
| Claude 3 Opus | Anthropic | 200K | Most intelligent Anthropic model | 💰 $15/$75 per 1M |
| Gemini 1.5 Pro | Google | 1M | Massive docs, video understanding | 💰 $3.50/$10.50 per 1M |
| Gemini 2.0 Flash | Google | 1M | Latest Google, fast + capable | 💸 Freemium |

**Fast & Efficient**

| Model | Provider | Context | Strengths | Cost |
|-------|----------|---------|-----------|------|
| GPT-4o mini | OpenAI | 128K | Cheap, fast, very capable | 💸 $0.15/$0.60 per 1M |
| Claude 3.5 Haiku | Anthropic | 200K | Fastest Claude, great for pipelines | 💸 $0.25/$1.25 per 1M |
| Gemini 1.5 Flash | Google | 1M | Fast, free tier, huge context | 🆓 Free / $0.075 per 1M |
| Mistral Small | Mistral | 128K | European, cheap, reliable | 💸 $1/$3 per 1M |
| Mistral Nemo | Mistral | 128K | Tiny 12B, very affordable | 💸 $0.15/$0.15 per 1M |
| Llama 3.3 70B (Groq) | Meta/Groq | 128K | Free tier, insanely fast | 🆓 Free |

**Ultra Cheap**

| Model | Provider | Context | Strengths | Cost |
|-------|----------|---------|-----------|------|
| DeepSeek V3 | DeepSeek | 128K | Best capability/$ ratio available | 💰 $0.14/$0.28 per 1M |
| DeepSeek R1 | DeepSeek | 128K | Reasoning, open weights | 💰 $0.55/$2.19 per 1M |
| Gemini Flash (free) | Google | 1M | Literally free | 🆓 Free |
| Groq (free tier) | Groq | 32K | Free + fastest inference | 🆓 Free |

**Reasoning Specialists**

| Model | Provider | Context | Notes |
|-------|----------|---------|-------|
| o1 | OpenAI | 200K | Chain-of-thought at scale, best at math/code |
| o3-mini | OpenAI | 200K | Affordable reasoning, strong STEM |
| DeepSeek R1 | DeepSeek | 128K | Open weights reasoning rival to o1 |
| Gemini Thinking | Google | — | Experimental extended thinking mode |
| QwQ-32B | Alibaba | 32K | Open source reasoning model |
| Llama 3.1 (instruct) | Meta | 128K | Long reasoning chains with proper prompting |

---

### 🎨 Image Generation

> From pixel art to photorealism. These APIs turn text into images (and images into images).

| API | Provider | Best For | Style | Speed | Cost |
|-----|----------|---------|-------|-------|------|
| [DALL-E 3](https://platform.openai.com/) | OpenAI | Prompt adherence, creativity | Diverse | Medium | $0.04–$0.12/image |
| [DALL-E 2](https://platform.openai.com/) | OpenAI | Inpainting, editing | Older style | Fast | $0.016–$0.020/image |
| [Midjourney v6.1](https://docs.midjourney.com/) | Midjourney | Artistic quality, aesthetics | Painterly | Slow | From $10/month |
| [Flux 1.1 Pro](https://replicate.com/black-forest-labs) | Black Forest Labs | Photorealism, portraits | Realistic | Fast | $0.04/image |
| [Flux 1.1 Pro Ultra](https://replicate.com/black-forest-labs) | Black Forest Labs | Highest quality, 4MP | Realistic | Medium | $0.06/image |
| [Flux Schnell](https://replicate.com/black-forest-labs) | Black Forest Labs | Speed, prototyping | Good quality | Very fast | $0.003/image 🔥 |
| [Flux Dev](https://replicate.com/black-forest-labs) | Black Forest Labs | Creative, non-commercial | Artistic | Fast | Free (weights) |
| [Ideogram v2](https://ideogram.ai/) | Ideogram | Text in images, typography | Clean | Medium | $0.08/image |
| [Ideogram v2 Turbo](https://ideogram.ai/) | Ideogram | Fast text-in-image | Clean | Fast | $0.05/image |
| [Adobe Firefly](https://developer.adobe.com/) | Adobe | Commercial use, safe output | Polished | Medium | Custom pricing |
| [Stable Image Ultra](https://platform.stability.ai/) | Stability AI | Detail, realism | High quality | Medium | $0.08/image |
| [Stable Image Core](https://platform.stability.ai/) | Stability AI | General use | Good quality | Fast | $0.03/image |
| [Stable Diffusion 3.5](https://stability.ai/) | Stability AI | Custom workflows | Flexible | Fast | Weights available |
| [Leonardo AI](https://leonardo.ai/) | Leonardo | Game art, consistent chars | Artistic | Medium | Freemium |
| [Playground v3](https://playground.com/) | Playground | Aesthetic photography | Polished | Medium | Freemium |
| [DreamStudio](https://dreamstudio.ai/) | Stability AI | SD models, easy UI | Varied | Fast | Credit-based |
| [Getimg.ai](https://getimg.ai/) | Getimg | Multiple model access | Varied | Fast | Freemium |
| [NightCafe](https://nightcafe.studio/) | NightCafe | Many styles, community | Artistic | Medium | Freemium |
| [StarryAI](https://starryai.com/) | StarryAI | Mobile-first, easy | Artistic | Slow | Freemium |
| [Canva AI](https://www.canva.com/) | Canva | Design integration | Polished | Fast | Included in Canva |

---

### 🖼 Image Editing & Enhancement

> Not just generating — also editing, upscaling, removing backgrounds, and transforming images.

| API | Provider | Function | Cost | Notes |
|-----|----------|---------|------|-------|
| [OpenAI DALL-E Edit](https://platform.openai.com/) | OpenAI | Inpainting | $0.016/image | Mask-based editing |
| [Adobe Firefly Edit](https://developer.adobe.com/) | Adobe | Generative fill | Custom | Best commercial-safe editing |
| [Stability AI Edit](https://platform.stability.ai/) | Stability AI | Inpaint, outpaint | Credit-based | Multiple editing modes |
| [Clipdrop](https://clipdrop.co/apis) | Stability AI | Remove BG, upscale, relight | Freemium | Great background removal |
| [Remove.bg](https://www.remove.bg/api) | Remove.bg | Background removal | $0.20/image | Best-in-class BG removal |
| [Photoroom](https://www.photoroom.com/api) | Photoroom | Product photography | Freemium | E-commerce focused |
| [Upscale.media](https://upscale.media/) | Upscale | AI upscaling | Freemium | 2x/4x upscaling |
| [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) | xinntao | Upscaling | Free (self-host) | Best open upscaler |
| [Topaz Labs](https://www.topazlabs.com/topaz-api) | Topaz | Upscaling, denoising | Custom | Professional quality |
| [Deep Image](https://deep-image.ai/) | Deep Image | Enhancement, upscaling | Freemium | API for batch processing |
| [Picwish](https://picwish.com/api) | Picwish | Background removal, editing | Freemium | Good for e-commerce |
| [Luminar AI](https://skylum.com/) | Skylum | Photo enhancement | Subscription | AI sky replacement etc |
| [Runway Inpaint](https://runwayml.com/) | Runway | Video/image inpainting | Credits | Professional editing |
| [ControlNet](https://huggingface.co/lllyasviel) | lllyasviel | Controlled generation | Free (weights) | Pose, depth, edge-guided gen |
| [IP-Adapter](https://huggingface.co/h94) | h94 | Style/content transfer | Free (weights) | Image prompt for SD models |

---

### 🎙 Audio & Speech

> Turn text to voice, voice to text, or voice to a completely different voice. The audio stack has exploded in quality.

**Speech-to-Text**

| API | Provider | Languages | WER | Real-time | Cost | Notes |
|-----|----------|-----------|-----|-----------|------|-------|
| [Whisper API](https://platform.openai.com/) | OpenAI | 97 | Best | No | $0.006/min | Most accurate, no RT support |
| [Deepgram Nova-2](https://deepgram.com/) | Deepgram | 30+ | Excellent | Yes | $0.0043/min | Fastest real-time STT |
| [AssemblyAI](https://www.assemblyai.com/) | AssemblyAI | 20+ | Very good | Yes | $0.013/min | Diarization, content mod |
| [Google STT v2](https://cloud.google.com/speech-to-text) | Google | 125 | Very good | Yes | $0.016/min | Widest language support |
| [Azure Speech](https://azure.microsoft.com/) | Microsoft | 85+ | Very good | Yes | $0.016/min | Neural, real-time |
| [AWS Transcribe](https://aws.amazon.com/transcribe/) | Amazon | 75+ | Good | Yes | $0.024/min | AWS ecosystem fit |
| [Rev.ai](https://www.rev.ai/) | Rev | English+ | Good | Yes | $0.02/min | Human + AI hybrid option |
| [Speechmatics](https://www.speechmatics.com/) | Speechmatics | 50+ | Very good | Yes | Custom | Strong in noisy audio |
| [Gladia](https://www.gladia.io/) | Gladia | 99 | Very good | Yes | $0.00025/sec | Fast, multilingual, affordable |
| [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) | ggerganov | 97 | Best | No | Free (self-host) | Runs locally, C++ port of Whisper |
| [Faster Whisper](https://github.com/SYSTRAN/faster-whisper) | SYSTRAN | 97 | Best | No | Free (self-host) | 4x faster than original Whisper |

**Text-to-Speech**

| API | Provider | Languages | Voice Quality | Voices | Cost | Standout |
|-----|----------|-----------|--------------|--------|------|---------|
| [ElevenLabs](https://elevenlabs.io/) | ElevenLabs | 29 | 🔥 Best-in-class | 1000+ | $5/month | Most realistic cloning |
| [OpenAI TTS](https://platform.openai.com/) | OpenAI | Many | Excellent | 6 | $0.015/1K chars | Simple, consistent |
| [PlayHT 2.0](https://play.ht/) | PlayHT | 142 | Excellent | 900+ | $0.003/1K chars | Fastest real-time voices |
| [Cartesia Sonic](https://cartesia.ai/) | Cartesia | 10+ | Excellent | Many | Custom | Lowest latency for realtime |
| [Azure Neural TTS](https://azure.microsoft.com/) | Microsoft | 140+ | Very good | 400+ | $1/1M chars | Widest language coverage |
| [Google Cloud TTS](https://cloud.google.com/text-to-speech) | Google | 220+ | Very good | 380+ | $16/1M chars | Best multilingual |
| [Murf.ai](https://murf.ai/) | Murf | 20+ | Very good | 120+ | $19/month | Video voiceover focused |
| [Lovo](https://lovo.ai/) | Lovo | 100+ | Good | 500+ | $24/month | Podcast, content creation |
| [Resemble AI](https://www.resemble.ai/) | Resemble | Many | Very good | Cloned | Custom | Voice clone in 3 seconds |
| [Speechify](https://speechify.com/api) | Speechify | Many | Very good | Many | Custom | Celebrity voices |
| [Kokoro TTS](https://huggingface.co/hexgrad/Kokoro-82M) | hexgrad | EN + others | Very good | 8 | Free (weights) | 82M params, surprisingly realistic |
| [XTTS v2](https://huggingface.co/coqui/XTTS-v2) | Coqui | 17 | Good | Cloned | Free (weights) | Multilingual voice cloning |
| [Edge TTS](https://github.com/rany2/edge-tts) | Microsoft | Many | Very good | Many | Free (unofficial) | Uses MS Edge's TTS API |

**Voice Cloning & Conversion**

| API | Provider | Clone Time | Quality | Cost |
|-----|----------|------------|---------|------|
| [ElevenLabs](https://elevenlabs.io/) | ElevenLabs | 1 min sample | Best | From $22/month |
| [Resemble AI](https://www.resemble.ai/) | Resemble | 3 seconds | Very good | Custom |
| [HeyGen Voice Clone](https://www.heygen.com/) | HeyGen | 2 min | Very good | Included in plan |
| [Speechify Clone](https://speechify.com/) | Speechify | 30 sec | Good | Custom API |
| [RVC (Real-time Voice Clone)](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI) | Community | Minutes | Very good | Free (self-host) |
| [SoVITS](https://github.com/svc-develop-team/so-vits-svc) | Community | Minutes | Good | Free (self-host) |
| [VALL-E X](https://huggingface.co/microsoft) | Microsoft | 3 seconds | Good | Research only |

**Music Generation**

| API | Provider | Style Control | Max Length | Cost |
|-----|----------|---------------|------------|------|
| [Suno v4](https://suno.com/) | Suno | Text prompt | 4 minutes | From $10/month |
| [Udio](https://www.udio.com/) | Udio | Text prompt | 3 minutes | Freemium |
| [MusicGen](https://huggingface.co/facebook/musicgen-large) | Meta | Text + melody | 30 sec | Free (self-host) |
| [AudioCraft](https://github.com/facebookresearch/audiocraft) | Meta | Text + audio | Variable | Free (self-host) |
| [Stable Audio](https://stability.ai/) | Stability AI | Text + timing | 3 minutes | Free tier |
| [Boomy](https://boomy.com/) | Boomy | Genre-based | Full songs | Freemium |
| [Soundraw](https://soundraw.io/) | Soundraw | Mood + genre | Full songs | From $16/month |
| [AIVA](https://www.aiva.ai/) | AIVA | Influence tracks | Full songs | From $15/month |
| [Mubert](https://mubert.com/) | Mubert | Genre + energy | Continuous | From $14/month |

---

### 🎬 Video Generation

> 2024-2025 was the year video AI got real. These APIs can generate seconds-to-minutes of video from text or images.

| API | Provider | Input | Max Length | Max Res | Notes |
|-----|----------|-------|------------|---------|-------|
| [Sora](https://sora.com/) | OpenAI | Text + Image | 60 seconds | 1080p | OpenAI's flagship, incredible quality |
| [Runway Gen-3 Alpha](https://runwayml.com/) | Runway | Text + Image | 10 seconds | 720p | Best cinematic/creative quality |
| [Runway Gen-3 Turbo](https://runwayml.com/) | Runway | Text + Image | 10 seconds | 720p | 4x faster than Alpha |
| [Kling 1.6 Pro](https://klingai.com/) | Kuaishou | Text + Image | 3 minutes | 1080p | Longest duration, great motion |
| [Pika 2.0](https://pika.art/) | Pika | Text + Image | 10 seconds | 720p | Good lipsyncing, scene changes |
| [Luma Dream Machine](https://lumalabs.ai/) | Luma | Text + Image | 30 seconds | 720p | Fast, photorealistic, smooth |
| [Hailuo AI](https://hailuoai.com/) | MiniMax | Text + Image | 6 seconds | 720p | Very realistic human motion |
| [Vidu](https://www.vidu.studio/) | Vidu | Text + Image | 8 seconds | 1080p | Strong consistency, Chinese provider |
| [Haiper 2.0](https://haiper.ai/) | Haiper | Text + Image | 8 seconds | 720p | Good quality, generous free tier |
| [Wan 2.1](https://github.com/Wan-Video/Wan2.1) | Alibaba | Text + Image | Variable | 720p | Open source, self-hostable |
| [Stable Video Diffusion](https://stability.ai/) | Stability AI | Image | 4 seconds | 576p | Open weights, local GPU |
| [CogVideoX](https://huggingface.co/THUDM/CogVideoX-5b) | THUDM | Text + Image | ~10 seconds | 720p | Open source, good quality |
| [Emu Video](https://ai.meta.com/research/emu/) | Meta | Text + Image | 4 seconds | Research | Research preview |
| [HeyGen](https://www.heygen.com/) | HeyGen | Avatar | Unlimited | 1080p | AI avatar video, lip sync |
| [Synthesia](https://www.synthesia.io/) | Synthesia | Avatar + Script | Unlimited | 1080p | Enterprise avatar videos |
| [D-ID](https://www.d-id.com/) | D-ID | Photo + Audio | Minutes | 720p | Photo-to-talking-video |
| [Tavus](https://www.tavus.io/) | Tavus | Clone + Script | Variable | 1080p | Personalized AI video at scale |

---

### ✏️ Video Editing & Enhancement

| API | Provider | Function | Cost |
|-----|----------|---------|------|
| [Topaz Video AI](https://www.topazlabs.com/) | Topaz | Upscaling, denoising | $299 one-time |
| [Runway Inpainting](https://runwayml.com/) | Runway | Remove objects, fill | Credits |
| [Magnific AI](https://magnific.ai/) | Magnific | Upscaling, enhancing | From $39/month |
| [Descript](https://www.descript.com/) | Descript | Edit video via transcript | From $12/month |
| [Kapwing AI](https://www.kapwing.com/) | Kapwing | Auto-subtitle, trim, effects | Freemium |
| [Captions.ai](https://www.captions.ai/) | Captions | Auto-captions, eye contact | Freemium |
| [Submagic](https://www.submagic.co/) | Submagic | Auto-captions, highlights | From $20/month |
| [Pictory](https://pictory.ai/) | Pictory | Article-to-video | From $19/month |
| [InVideo AI](https://invideo.io/) | InVideo | Script-to-video | From $20/month |
| [Fliki](https://fliki.ai/) | Fliki | Text-to-video + voiceover | From $21/month |

---

### 🔢 Embeddings & Vector Search

> Embeddings are how AI understands meaning. If you're building search, RAG, or recommendations — you need these.

**Embedding Models**

| Model | Provider | Dimensions | Context | MTEB Score | Cost |
|-------|----------|------------|---------|------------|------|
| text-embedding-3-large | OpenAI | 3072 | 8K | 64.6 | $0.13/1M tokens |
| text-embedding-3-small | OpenAI | 1536 | 8K | 62.3 | $0.02/1M tokens |
| Voyage-3-large | Voyage AI | 1024 | 32K | 68.8 | $0.06/1M tokens |
| Voyage-3 | Voyage AI | 1024 | 32K | 67.1 | $0.03/1M tokens |
| Voyage-3-lite | Voyage AI | 512 | 32K | 64.4 | $0.02/1M tokens |
| Cohere embed-v3 english | Cohere | 1024 | 512 | 64.5 | $0.10/1M tokens |
| Cohere embed-v3 multilingual | Cohere | 1024 | 512 | 62.0 | $0.10/1M tokens |
| Jina embeddings v3 | Jina AI | 1024 | 8K | 65.1 | $0.018/1M tokens |
| Nomic Embed 1.5 | Nomic | 768 | 8K | 62.5 | Free (self-host) |
| BGE-M3 | BAAI | 1024 | 8K | 66.9 | Free (self-host) |
| GTE-Qwen2-7B | Alibaba | 3584 | 131K | 72.9 | Free (self-host) |
| E5-large-v2 | Microsoft | 1024 | 512 | 62.3 | Free (self-host) |
| all-MiniLM-L6-v2 | HuggingFace | 384 | 256 | 56.3 | Free (self-host) |
| BAAI/bge-large-en-v1.5 | BAAI | 1024 | 512 | 64.2 | Free (self-host) |
| Amazon Titan Embed v2 | Amazon | 1024 | 8K | ~63 | $0.02/1M tokens |
| Mistral Embed | Mistral | 1024 | 8K | 63.4 | $0.10/1M tokens |

**Vector Databases Comparison**

| DB | Best For | Query Speed | Scale | Filters | Self-host | Cost |
|----|----------|-------------|-------|---------|-----------|------|
| Pinecone | Production RAG | Fast | 1B+ | Good | No | $70/month |
| Weaviate | Multi-modal | Fast | 1B+ | Excellent | Yes | $25/month |
| Qdrant | High-perf apps | Very fast | 100M+ | Excellent | Yes | Free self-host |
| Chroma | Prototyping | Good | 10M | Basic | Yes | Free |
| Milvus | Enterprise scale | Very fast | 10B+ | Good | Yes | Free self-host |
| pgvector | Existing Postgres | Moderate | 10M | Full SQL | Yes | Postgres cost |
| LanceDB | Embedded apps | Fast | 100M | Good | Yes | Free |
| Marqo | E-commerce search | Fast | 10M | Good | Yes | Freemium |
| Redis Vector | Low-latency apps | Very fast | 100M | Basic | Yes | Redis cost |
| OpenSearch k-NN | AWS ecosystem | Good | 100M | Excellent | Yes | AWS cost |

---

### 💻 Code Generation & Dev Tools

> AI that writes, reviews, explains, and debugs code. The category that changed software development.

**Code Generation APIs**

| API/Model | Best Languages | Context | Special Ability | Cost |
|-----------|---------------|---------|-----------------|------|
| Claude 3.5 Sonnet | All major | 200K | Best for understanding entire codebases | $3/$15 per 1M |
| GPT-4o | All | 128K | Tool use, multi-step code workflows | $5/$15 per 1M |
| o3-mini | All | 200K | Complex algorithms, debugging | $1.10/$4.40 per 1M |
| DeepSeek Coder V2 | 338 languages | 128K | Code-first training, strong benchmarks | $0.14/$0.28 per 1M |
| Qwen2.5-Coder-32B | All major | 128K | Open source, math + code | Free (weights) |
| Codestral | 80+ languages | 32K | Fill-in-the-middle for IDEs | $0.20/$0.60 per 1M |
| CodeLlama 70B | All major | 100K | Meta's dedicated code model, open | Free (weights) |
| Starcoder2 15B | 600+ languages | 16K | Open, great for rare languages | Free (weights) |
| WizardCoder | Python/C++/Java | 128K | Instruction-following for code | Free (weights) |
| Phind-CodeLlama | Python/JS/TS | 16K | Trained on StackOverflow | Free (weights) |

**AI Coding Assistants (IDE Integration)**

| Tool | Provider | IDE Support | Free Tier | Notes |
|------|----------|-------------|-----------|-------|
| [GitHub Copilot](https://github.com/features/copilot) | GitHub/OpenAI | All major | No | Industry standard, GPT-4o powered |
| [Cursor](https://www.cursor.com/) | Cursor | VS Code fork | Limited | Best AI-native editor experience |
| [Codeium](https://codeium.com/) | Codeium | 70+ IDEs | Yes (unlimited) | Free forever, very good autocomplete |
| [Tabnine](https://www.tabnine.com/) | Tabnine | All major | Yes | Privacy-focused, private model option |
| [Continue.dev](https://continue.dev/) | Continue | VS Code, JetBrains | Yes (open source) | Open source, use any model |
| [Aider](https://aider.chat/) | Aider | Terminal | Yes (open source) | Pairs with Claude/GPT, whole-repo editing |
| [Claude Code](https://claude.ai/code) | Anthropic | Terminal | Via API | Agentic coding, whole project understanding |
| [Supermaven](https://supermaven.com/) | Supermaven | VS Code, JetBrains | Yes | Fastest autocomplete (300ms), 1M context |
| [JetBrains AI](https://www.jetbrains.com/ai/) | JetBrains | JetBrains | No | Native JetBrains integration |
| [Amazon CodeWhisperer](https://aws.amazon.com/codewhisperer/) | Amazon | VS Code, JetBrains | Yes | AWS ecosystem, security scanning |
| [Replit AI](https://replit.com/) | Replit | Replit | Limited | In-browser IDE with AI |

---

### 🌐 Multimodal

> APIs that can see images, read documents, watch videos, and listen to audio — not just text.

| API | Text | Image | Video | Audio | PDF | Code | Notes |
|-----|------|-------|-------|-------|-----|------|-------|
| GPT-4o | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Real-time audio/video via API |
| GPT-4o mini | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Cheaper vision model |
| Claude 3.5 Sonnet | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Best at reading complex PDFs |
| Claude 3 Haiku | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Fast, cheap vision |
| Gemini 1.5 Pro | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1M context, can watch 1h video |
| Gemini 1.5 Flash | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Fast version of Pro |
| Gemini 2.0 Flash | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Latest, with real-time streaming |
| Llama 3.2 Vision | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | Open source vision, 11B/90B |
| LLaVA 1.6 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | Open source, self-hostable |
| Qwen-VL-Max | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Strong multilingual vision |
| InternVL2 | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | Open, strong Chinese+English |
| PaliGemma 2 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Google compact vision model |
| Pixtral Large | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | Mistral's multimodal flagship |
| Molmo | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Allen AI, pointing capability |

---

### 🔍 Search & Retrieval

> AI-powered search — whether that's searching the web, your documents, or a knowledge base.

**Web Search APIs**

| API | Provider | Results Quality | Real-time | Cost |
|-----|----------|-----------------|-----------|------|
| [Tavily](https://tavily.com/) | Tavily | Excellent (AI-tuned) | Yes | $0.001/search |
| [Exa AI](https://exa.ai/) | Exa | Excellent (neural) | Yes | $0.005/search |
| [Perplexity API](https://www.perplexity.ai/api) | Perplexity | Excellent | Yes | Included in model cost |
| [Serper.dev](https://serper.dev/) | Serper | Good (Google) | Yes | $0.001/search |
| [SerpApi](https://serpapi.com/) | SerpApi | Good (Google/Bing) | Yes | $0.002/search |
| [BrightData](https://brightdata.com/) | BrightData | Excellent | Yes | Custom pricing |
| [Google Custom Search](https://developers.google.com/custom-search) | Google | Good | Yes | $5/1000 queries |
| [Bing Search API](https://www.microsoft.com/bing/apis) | Microsoft | Good | Yes | $7/1000 queries |
| [You.com API](https://api.you.com/) | You.com | Very good | Yes | $20/month |
| [Brave Search API](https://brave.com/search/api/) | Brave | Good | Yes | $5/1000 queries |

**Enterprise Knowledge Base / RAG**

| API | Provider | Type | Cost |
|-----|----------|------|------|
| [Vectara](https://vectara.com/) | Vectara | Managed RAG | Custom |
| [Glean](https://www.glean.com/) | Glean | Workplace search | Custom |
| [Guru](https://www.getguru.com/) | Guru | Company wiki AI | From $10/user |
| [Notion AI](https://www.notion.com/product/ai) | Notion | Workspace Q&A | $10/user/month |
| [Confluence AI](https://www.atlassian.com/) | Atlassian | Wiki search | Bundled |
| [SharePoint Copilot](https://www.microsoft.com/) | Microsoft | Document search | M365 bundle |
| [Elastic AI](https://www.elastic.co/) | Elastic | Hybrid search | Custom |
| [Algolia AI](https://www.algolia.com/) | Algolia | Product/app search | From $1/month |

---

### 📄 Document AI & OCR

> Extract structured data from PDFs, forms, invoices, and unstructured documents.

| API | Provider | Function | Formats | Cost |
|-----|----------|---------|---------|------|
| [Amazon Textract](https://aws.amazon.com/textract/) | Amazon | OCR + form extraction | PDF, Images | $0.0015/page |
| [Google Document AI](https://cloud.google.com/document-ai) | Google | Form, invoice, ID parsing | PDF, Images | $0.005/page |
| [Azure Form Recognizer](https://azure.microsoft.com/) | Microsoft | Form + invoice extraction | PDF, Images | $0.01/page |
| [Unstructured](https://unstructured.io/) | Unstructured | All document types | 25+ formats | Freemium |
| [LlamaIndex Parse](https://docs.llamaindex.ai/) | LlamaIndex | PDF/doc parsing for LLM | PDF, DOCX | Free + paid |
| [Reducto](https://reducto.ai/) | Reducto | Complex PDFs, tables | PDF | $0.003/page |
| [Mathpix](https://mathpix.com/) | Mathpix | Math OCR, LaTeX | Images, PDF | Freemium |
| [Rossum](https://rossum.ai/) | Rossum | Invoice/form automation | PDF | Custom |
| [Nanonets](https://nanonets.com/) | Nanonets | Custom document extraction | Any | From $499/month |
| [Docparser](https://docparser.com/) | Docparser | Template-based extraction | PDF, Word | From $29/month |
| [Abbyy](https://www.abbyy.com/) | ABBYY | Enterprise OCR | All | Custom |
| [Tesseract](https://github.com/tesseract-ocr/tesseract) | Google | Open-source OCR | Images | Free |
| [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) | Baidu | Multilingual OCR | Images | Free |
| [EasyOCR](https://github.com/JaidedAI/EasyOCR) | JaidedAI | 80-language OCR | Images | Free |
| [Docling](https://github.com/DS4SD/docling) | IBM | Doc conversion for LLMs | PDF, DOCX | Free |
| [Marker](https://github.com/VikParuchuri/marker) | VikParuchuri | PDF to Markdown | PDF | Free |

---

### 👁 Computer Vision

> APIs that can identify, classify, detect, and understand images and video at scale.

| API | Provider | Function | Cost |
|-----|----------|---------|------|
| [Google Vision AI](https://cloud.google.com/vision) | Google | Label, face, OCR, landmark | $1.50/1K images |
| [Azure Computer Vision](https://azure.microsoft.com/) | Microsoft | Multi-function vision | $1/1K images |
| [Amazon Rekognition](https://aws.amazon.com/rekognition/) | Amazon | Detection, comparison, moderation | $1/1K images |
| [Clarifai](https://www.clarifai.com/) | Clarifai | Custom model training | From $30/month |
| [Roboflow](https://roboflow.com/) | Roboflow | Object detection training | From $249/month |
| [Ultralytics](https://ultralytics.com/) | Ultralytics | YOLOv8/v11 models | Freemium |
| [Detectron2](https://github.com/facebookresearch/detectron2) | Meta | Object detection | Free (self-host) |
| [CLIP](https://github.com/openai/CLIP) | OpenAI | Image-text similarity | Free (weights) |
| [DINO / DINOv2](https://github.com/facebookresearch/dinov2) | Meta | Feature extraction, seg | Free (weights) |
| [SAM 2](https://github.com/facebookresearch/segment-anything) | Meta | Segment anything | Free (weights) |
| [GroundingDINO](https://github.com/IDEA-Research/GroundingDINO) | IDEA Research | Zero-shot detection | Free (weights) |
| [DeepFace](https://github.com/serengil/deepface) | serengil | Face recognition | Free |
| [MediaPipe](https://developers.google.com/mediapipe) | Google | Hands, pose, face mesh | Free |
| [OpenCV](https://opencv.org/) | Community | Traditional CV | Free |
| [Hive Moderation](https://thehive.ai/) | Hive | Content moderation | Custom |
| [Sightengine](https://sightengine.com/) | Sightengine | NSFW, face, quality | $0.001/image |

---

### 🤖 Agents & Orchestration

> Frameworks, tools, and APIs for building autonomous AI agents that can take actions, use tools, and complete multi-step tasks.

**Agent Frameworks**

| Framework | Language | License | Best For |
|-----------|----------|---------|----------|
| [LangChain](https://langchain.com/) | Python, JS | MIT | Most popular, huge ecosystem |
| [LangGraph](https://langchain-ai.github.io/langgraph/) | Python, JS | MIT | Graph-based agent workflows |
| [LlamaIndex](https://www.llamaindex.ai/) | Python, TS | MIT | RAG-focused agents |
| [AutoGen](https://microsoft.github.io/autogen/) | Python | CC-BY-NC | Multi-agent conversations, Microsoft |
| [CrewAI](https://www.crewai.com/) | Python | MIT | Role-based multi-agent teams |
| [Swarm](https://github.com/openai/swarm) | Python | MIT | OpenAI's lightweight multi-agent |
| [Haystack](https://haystack.deepset.ai/) | Python | Apache 2.0 | Production NLP pipelines |
| [Semantic Kernel](https://learn.microsoft.com/semantic-kernel) | C#, Python | MIT | Microsoft's enterprise agent SDK |
| [Agno](https://github.com/agno-agi/agno) | Python | Mozilla | Fast multi-agent, memory built-in |
| [Pydantic AI](https://ai.pydantic.dev/) | Python | MIT | Type-safe agent development |
| [DSPy](https://dspy.ai/) | Python | MIT | Programmatic LLM optimization |
| [CAMEL](https://github.com/camel-ai/camel) | Python | Apache 2.0 | Communicative agents for exploration |
| [MetaGPT](https://github.com/geekan/MetaGPT) | Python | MIT | Software development teams |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Python | MIT | AI software engineer |

**Agent Infrastructure**

| Tool | Provider | Function | Cost |
|------|----------|---------|------|
| [E2B](https://e2b.dev/) | E2B | Code execution sandbox | $0.000014/sec |
| [Browserbase](https://www.browserbase.com/) | Browserbase | Browser automation | Custom |
| [Steel](https://steel.dev/) | Steel | Browser for agents | Freemium |
| [Playwright](https://playwright.dev/) | Microsoft | Browser automation | Free |
| [Puppeteer](https://pptr.dev/) | Google | Browser automation | Free |
| [Firecrawl](https://firecrawl.dev/) | Firecrawl | Web scraping for agents | $0.001/page |
| [Composio](https://composio.dev/) | Composio | 150+ tool integrations | Freemium |
| [Toolhouse](https://toolhouse.ai/) | Toolhouse | Pre-built AI tools | Freemium |
| [Langsmith](https://smith.langchain.com/) | LangChain | Agent tracing + eval | Freemium |
| [Langfuse](https://langfuse.com/) | Langfuse | Open-source LLM observability | Free (self-host) |
| [Arize Phoenix](https://phoenix.arize.com/) | Arize | LLM tracing, evals | Free (open source) |
| [Mem0](https://mem0.ai/) | Mem0 | Long-term agent memory | Freemium |

---

### 🔬 Specialized & Domain-Specific

> AI models trained specifically for one field — often dramatically better than general-purpose models for their domain.

**Medicine & Biology**

| API | Domain | Provider | Access |
|-----|--------|----------|--------|
| [Med-PaLM 2](https://cloud.google.com/vertex-ai) | Medical Q&A | Google | Vertex AI (waitlist) |
| [BioMedLM](https://huggingface.co/stanford-crfm/BioMedLM) | Biomedical NLP | Stanford | HuggingFace (free) |
| [BioBERT](https://huggingface.co/dmis-lab/biobert-v1.1) | Biomedical text | DMIS Lab | HuggingFace (free) |
| [ClinicalBERT](https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT) | Clinical notes | Emily Alsentzer | HuggingFace (free) |
| [AlphaFold API](https://alphafold.ebi.ac.uk/) | Protein folding | DeepMind/EMBL-EBI | Free (research) |
| [ESM-2](https://huggingface.co/facebook/esm2_t33_650M_UR50D) | Protein language | Meta | HuggingFace (free) |
| [RoseTTAFold](https://github.com/RosettaCommons/RoseTTAFold) | Protein structure | U Washington | Free (research) |
| [SciBERT](https://huggingface.co/allenai/scibert_scivocab_uncased) | Scientific text | AllenAI | HuggingFace (free) |
| [Galactica](https://huggingface.co/facebook/galactica-120b) | Scientific text | Meta | HuggingFace |
| [BioGPT](https://github.com/microsoft/BioGPT) | Biomedical | Microsoft | Free (weights) |

**Finance & Legal**

| API | Domain | Provider | Access |
|-----|--------|----------|--------|
| [BloombergGPT](https://huggingface.co/bloomberg) | Finance | Bloomberg | Research only |
| [FinGPT](https://github.com/AI4Finance-Foundation/FinGPT) | Finance | AI4Finance | Open source |
| [FinBERT](https://huggingface.co/ProsusAI/finbert) | Financial sentiment | Prosus AI | HuggingFace (free) |
| [LegalBERT](https://huggingface.co/nlpaueb/legal-bert-base-uncased) | Legal text | AUEB | HuggingFace (free) |
| [Harvey](https://www.harvey.ai/) | Legal AI | Harvey | Enterprise |
| [Casetext](https://casetext.com/) | Legal research | Casetext | Subscription |
| [Kira Systems](https://kirasystems.com/) | Legal doc review | Kira | Enterprise |
| [AlphaSense](https://www.alpha-sense.com/) | Financial research | AlphaSense | Enterprise |
| [Arize](https://arize.com/) | ML monitoring | Arize | Custom |

**Code & Security**

| API | Domain | Provider | Access |
|-----|--------|----------|--------|
| [StarCoder2](https://huggingface.co/bigcode/starcoder2-15b) | Code (600 langs) | BigCode | HuggingFace (free) |
| [DeepSeek Coder V2](https://huggingface.co/deepseek-ai) | Code | DeepSeek | API + weights |
| [Codestral](https://mistral.ai/) | Code | Mistral | API |
| [Snyk Code](https://snyk.io/) | Security scanning | Snyk | Freemium |
| [Semgrep](https://semgrep.dev/) | Static analysis | Semgrep | Freemium |
| [Socket.dev](https://socket.dev/) | Supply chain security | Socket | Freemium |
| [Veracode](https://www.veracode.com/) | App security | Veracode | Enterprise |

**Education**

| API | Domain | Provider | Access |
|-----|--------|----------|--------|
| [Khanmigo](https://www.khanacademy.org/khan-labs) | Tutoring | Khan Academy | Freemium |
| [Duolingo API](https://www.duolingo.com/) | Language learning | Duolingo | No public API |
| [Gradescope](https://www.gradescope.com/) | Automated grading | Gradescope | From $1/student |

---

### 🛡 AI Safety & Moderation

> APIs to detect harmful content, ensure safe outputs, and add guardrails to AI systems.

| API | Provider | Function | Cost |
|-----|----------|---------|------|
| [OpenAI Moderation](https://platform.openai.com/docs/api-reference/moderations) | OpenAI | Text moderation | Free with OpenAI account |
| [Perspective API](https://perspectiveapi.com/) | Google/Jigsaw | Toxicity detection | Free |
| [Azure Content Safety](https://azure.microsoft.com/products/ai-services/content-safety) | Microsoft | Multimodal moderation | $1/1K text calls |
| [AWS Rekognition Moderation](https://aws.amazon.com/rekognition/) | Amazon | Image/video moderation | $1/1K images |
| [Hive Moderation](https://thehive.ai/) | Hive | NSFW, violence, hate | Custom |
| [Sightengine](https://sightengine.com/) | Sightengine | Image + video safety | $0.001/call |
| [ActiveFence](https://www.activefence.com/) | ActiveFence | Trust & safety platform | Custom |
| [Llama Guard](https://huggingface.co/meta-llama/Llama-Guard-3-8B) | Meta | LLM input/output safety | Free (weights) |
| [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) | NVIDIA | Programmable LLM rails | Free (open source) |
| [Guardrails AI](https://www.guardrailsai.com/) | Guardrails AI | Validation, retry, fix | Open source |
| [Rebuff](https://github.com/protectai/rebuff) | ProtectAI | Prompt injection detection | Free (open source) |
| [LangKit](https://github.com/whylabs/langkit) | WhyLabs | LLM monitoring | Free (open source) |
| [Presidio](https://github.com/microsoft/presidio) | Microsoft | PII detection/anonymization | Free (open source) |

---

### 🌍 Translation & Multilingual

> APIs for translating text, detecting languages, and building multilingual AI applications.

| API | Provider | Languages | Quality | Cost |
|-----|----------|-----------|---------|------|
| [DeepL API](https://www.deepl.com/pro-api) | DeepL | 30+ | Best quality | $5.49/month (free tier) |
| [Google Translate API](https://cloud.google.com/translate) | Google | 135+ | Very good | $20/1M chars |
| [Azure Translator](https://azure.microsoft.com/products/ai-services/translator) | Microsoft | 100+ | Very good | $10/1M chars |
| [Amazon Translate](https://aws.amazon.com/translate/) | Amazon | 75+ | Good | $15/1M chars |
| [ModernMT](https://www.modernmt.com/) | ModernMT | 40+ | Good (adaptive) | Custom |
| [Systran](https://platform.systran.net/) | Systran | 50+ | Good | Custom |
| [NLLB-200](https://huggingface.co/facebook/nllb-200-3.3B) | Meta | 200 | Good | Free (weights) |
| [Helsinki-NLP](https://huggingface.co/Helsinki-NLP) | University of Helsinki | 1000+ pairs | Moderate | Free (weights) |
| [LibreTranslate](https://libretranslate.com/) | LibreTranslate | 30+ | Moderate | Free (self-host) |
| [Argos Translate](https://github.com/argosopentech/argos-translate) | Argos | 30+ | Moderate | Free (self-host) |

---

### 🧮 Reasoning & Math

> Models and APIs specialized in logical reasoning, mathematical computation, and formal verification.

| Model | Provider | Math Benchmark | Context | Notes |
|-------|----------|----------------|---------|-------|
| o1 | OpenAI | 94.8% (MATH) | 200K | Best reasoning, expensive |
| o3-mini | OpenAI | 90%+ (MATH) | 200K | Most affordable frontier reasoning |
| DeepSeek R1 | DeepSeek | 90.2% (MATH) | 128K | Open weights, o1-class |
| Gemini 2.0 Flash Thinking | Google | 89%+ | 1M | Extended thinking mode |
| QwQ-32B | Alibaba | 89% (MATH) | 32K | Open source reasoning model |
| Claude 3.5 Sonnet | Anthropic | 78.3% (MATH) | 200K | Strong reasoning without slowdown |
| Llama 3.1 405B | Meta | 73.8% (MATH) | 128K | Best open non-reasoning model |
| Mathstral | Mistral | 77.6% (MATH) | 32K | Math-specialized Mistral |
| NuminaMath | Numina | Competition | 4K | Trained on competition math |
| WolframAlpha API | Wolfram | Symbolic | — | Symbolic computation, proofs |

---

## 📊 Pricing Comparison

> Numbers current as of early 2025. AI pricing changes constantly — always verify on official pages before budgeting.

### LLM Cost Per 1M Tokens (Input → Output)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  FRONTIER MODELS                                                             ║
╠══════════════════╦══════════════╦══════════════╦═══════════╦════════════════╣
║  Model           ║  Input ($)   ║  Output ($)  ║  Context  ║  Best For      ║
╠══════════════════╬══════════════╬══════════════╬═══════════╬════════════════╣
║  o1              ║  $15.00      ║  $60.00      ║  200K     ║  Reasoning     ║
║  Claude 3 Opus   ║  $15.00      ║  $75.00      ║  200K     ║  Intelligence  ║
║  GPT-4o          ║  $5.00       ║  $15.00      ║  128K     ║  General/Tools ║
║  Claude 3.5 Son. ║  $3.00       ║  $15.00      ║  200K     ║  Writing/Code  ║
║  Gemini 1.5 Pro  ║  $3.50       ║  $10.50      ║  1M       ║  Docs/Video    ║
║  Mistral Large 2 ║  $8.00       ║  $24.00      ║  128K     ║  EU Compliance ║
║  Command R+      ║  $3.00       ║  $15.00      ║  128K     ║  RAG/Search    ║
╠══════════════════╩══════════════╩══════════════╩═══════════╩════════════════╣
║  EFFICIENT MODELS                                                            ║
╠══════════════════╦══════════════╦══════════════╦═══════════╦════════════════╣
║  o3-mini         ║  $1.10       ║  $4.40       ║  200K     ║  Cheap reason. ║
║  GPT-4o mini     ║  $0.15       ║  $0.60       ║  128K     ║  General tasks ║
║  Claude 3.5 Hku  ║  $0.25       ║  $1.25       ║  200K     ║  Fast pipeline ║
║  Gemini 1.5 Flash║  $0.075      ║  $0.30       ║  1M       ║  High volume   ║
║  Mistral Small   ║  $1.00       ║  $3.00       ║  128K     ║  EU, efficient ║
║  Mistral Nemo    ║  $0.15       ║  $0.15       ║  128K     ║  Ultra cheap   ║
╠══════════════════╩══════════════╩══════════════╩═══════════╩════════════════╣
║  ULTRA CHEAP / FREE                                                          ║
╠══════════════════╦══════════════╦══════════════╦═══════════╦════════════════╣
║  DeepSeek V3     ║  $0.14  🔥   ║  $0.28  🔥   ║  128K     ║  Best $/cap   ║
║  DeepSeek R1     ║  $0.55       ║  $2.19       ║  128K     ║  Cheap reason. ║
║  Gemini Flash 🆓 ║  FREE        ║  FREE        ║  1M       ║  Free+capable  ║
║  Groq (free) 🆓  ║  FREE        ║  FREE        ║  32K      ║  Free+fastest  ║
╠══════════════════╩══════════════╩══════════════╩═══════════╩════════════════╣
║  SELF-HOSTED (electricity cost only)                                         ║
╠══════════════════╦══════════════╦══════════════╦═══════════╦════════════════╣
║  Llama 3.1 405B  ║  ~$0.00      ║  ~$0.00      ║  128K     ║  Frontier open ║
║  DeepSeek R1 671B║  ~$0.00      ║  ~$0.00      ║  128K     ║  Open reason.  ║
║  Mixtral 8x22B   ║  ~$0.00      ║  ~$0.00      ║  65K      ║  MoE open      ║
║  Qwen 2.5 72B    ║  ~$0.00      ║  ~$0.00      ║  128K     ║  Multilingual  ║
╚══════════════════╩══════════════╩══════════════╩═══════════╩════════════════╝
```

### Image Generation Cost Comparison

```
╔═══════════════════════════╦══════════════╦══════════════╦══════════════════╗
║  Model                    ║  Cost/Image  ║  Resolution  ║  Notes           ║
╠═══════════════════════════╬══════════════╬══════════════╬══════════════════╣
║  Flux Schnell             ║  $0.003 🔥   ║  Configurable║  Fastest + cheap ║
║  SD SDXL (self-host)      ║  ~$0.001     ║  1024×1024   ║  Electricity only║
║  DALL-E 2                 ║  $0.016      ║  1024×1024   ║  Older model     ║
║  Stable Image Core        ║  $0.03       ║  Configurable║  Good balance    ║
║  Midjourney (sub)         ║  ~$0.02–0.04 ║  Custom      ║  Best aesthetics ║
║  DALL-E 3 Standard        ║  $0.04       ║  1024×1024   ║  Great adherence ║
║  Flux 1.1 Pro             ║  $0.04       ║  Configurable║  High quality    ║
║  Ideogram v2 Turbo        ║  $0.05       ║  1024×1024   ║  Fast text-in-img║
║  Flux 1.1 Pro Ultra       ║  $0.06       ║  Up to 4MP   ║  Highest quality ║
║  Ideogram v2              ║  $0.08       ║  1024×1024   ║  Best text render║
║  Stable Image Ultra       ║  $0.08       ║  Configurable║  Premium Stab AI ║
║  DALL-E 3 HD              ║  $0.08–$0.12 ║  1024×1024   ║  Highest detail  ║
╚═══════════════════════════╩══════════════╩══════════════╩══════════════════╝
```

### Speech-to-Text Cost

```
╔══════════════════════════╦══════════════╦══════════════╦═══════════════╗
║  Provider                ║  Cost/min    ║  Real-time?  ║  Accuracy     ║
╠══════════════════════════╬══════════════╬══════════════╬═══════════════╣
║  Deepgram Nova-2         ║  $0.0043 🔥  ║  Yes         ║  Excellent    ║
║  OpenAI Whisper          ║  $0.006      ║  No          ║  Excellent    ║
║  Whisper (self-host)     ║  ~$0.00      ║  No          ║  Excellent    ║
║  AssemblyAI              ║  $0.013      ║  Yes         ║  Very good    ║
║  Rev.ai                  ║  $0.020      ║  Yes         ║  Very good    ║
║  Google STT v2           ║  $0.016      ║  Yes         ║  Very good    ║
║  Azure Speech            ║  $0.016      ║  Yes         ║  Very good    ║
║  AWS Transcribe          ║  $0.024      ║  Yes         ║  Good         ║
╚══════════════════════════╩══════════════╩══════════════╩═══════════════╝
```

### Text-to-Speech Cost

```
╔══════════════════════════╦══════════════╦══════════════╦═══════════════╗
║  Provider                ║  Cost/1K ch  ║  Voices      ║  Quality      ║
╠══════════════════════════╬══════════════╬══════════════╬═══════════════╣
║  Kokoro TTS (self-host)  ║  ~$0.00      ║  8           ║  Very good    ║
║  Google Cloud TTS (free) ║  FREE 1M/mo  ║  380+        ║  Good         ║
║  PlayHT                  ║  $0.003      ║  900+        ║  Excellent    ║
║  OpenAI TTS              ║  $0.015      ║  6           ║  Excellent    ║
║  ElevenLabs              ║  Varies      ║  1000+       ║  Best-in-class║
║  Azure Neural TTS        ║  $0.001      ║  400+        ║  Very good    ║
╚══════════════════════════╩══════════════╩══════════════╩═══════════════╝
```

---

## 🔧 Developer Tools & Frameworks

> Beyond the APIs themselves — the SDKs, frameworks, and tooling that make working with AI APIs faster and more reliable.

### LLM Orchestration & RAG

| Tool | Language | Focus | License |
|------|----------|-------|---------|
| [LangChain](https://langchain.com/) | Python, JS | Full-stack LLM apps | MIT |
| [LlamaIndex](https://www.llamaindex.ai/) | Python, TS | RAG, data ingestion | MIT |
| [Haystack](https://haystack.deepset.ai/) | Python | Production NLP pipelines | Apache 2.0 |
| [DSPy](https://dspy.ai/) | Python | Optimizing LLM programs | MIT |
| [Instructor](https://useinstructor.com/) | Python, TS | Structured LLM outputs | MIT |
| [Guardrails AI](https://www.guardrailsai.com/) | Python | Output validation | Apache 2.0 |
| [LMQL](https://lmql.ai/) | Python | Constrained LLM generation | Apache 2.0 |
| [Marvin](https://www.askmarvin.ai/) | Python | Lightweight AI function calls | Apache 2.0 |
| [Outlines](https://github.com/outlines-dev/outlines) | Python | Structured text generation | Apache 2.0 |
| [Guidance](https://github.com/guidance-ai/guidance) | Python | Constrained generation | MIT |

### Prompt Management

| Tool | Provider | Features | Cost |
|------|----------|---------|------|
| [PromptLayer](https://promptlayer.com/) | PromptLayer | Versioning, tracking, testing | From $0 |
| [LangSmith](https://smith.langchain.com/) | LangChain | Tracing, datasets, eval | From $0 |
| [Langfuse](https://langfuse.com/) | Langfuse | Open source observability | From $0 |
| [Pezzo](https://pezzo.ai/) | Pezzo | Prompt management + testing | Open source |
| [Helicone](https://helicone.ai/) | Helicone | Proxy + analytics | From $0 |
| [Braintrust](https://braintrust.dev/) | Braintrust | Evals + prompts | Freemium |
| [Weights & Biases](https://wandb.ai/) | W&B | Experiment tracking | Freemium |

### LLM Testing & Evaluation

| Tool | Provider | Type | Cost |
|------|----------|------|------|
| [Evals (OpenAI)](https://github.com/openai/evals) | OpenAI | Benchmark library | Free |
| [RAGAS](https://github.com/explodinggradients/ragas) | Exploding Gradients | RAG evaluation | Free |
| [TruLens](https://www.trulens.org/) | TruEra | RAG eval + tracing | Free |
| [DeepEval](https://github.com/confident-ai/deepeval) | Confident AI | Unit testing for LLMs | Free |
| [Promptfoo](https://www.promptfoo.dev/) | Promptfoo | Red teaming, testing | Free |
| [Arthur AI](https://www.arthur.ai/) | Arthur | Model monitoring | Custom |
| [Giskard](https://www.giskard.ai/) | Giskard | LLM quality testing | Open source |

### Fine-Tuning Platforms

| Platform | Models | GPU Access | Cost |
|----------|--------|------------|------|
| [OpenAI Fine-tuning](https://platform.openai.com/docs/guides/fine-tuning) | GPT-4o mini, GPT-3.5 | Managed | $8/1M tokens |
| [Together AI Fine-tune](https://www.together.ai/blog/fine-tuning) | Llama, Mistral + | Managed | $3/M tokens |
| [Replicate Fine-tune](https://replicate.com/docs/guides/fine-tune-a-model) | Flux, Llama + | Managed | Per run |
| [Axolotl](https://github.com/OpenAccess-AI-Collective/axolotl) | Any HF model | Your GPU | Free |
| [Unsloth](https://github.com/unslothai/unsloth) | Any GGUF/HF model | Your GPU | Free |
| [Torchtune](https://github.com/pytorch/torchtune) | Any HF model | Your GPU | Free |
| [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory) | Any HF model | Your GPU | Free |
| [Modal Fine-tune](https://modal.com/) | Any | Serverless GPU | Per second |
| [Runpod](https://www.runpod.io/) | Any | Serverless GPU | From $0.19/hr |
| [Lambda Labs](https://lambdalabs.com/) | Any | Dedicated GPU | From $1.25/hr |
| [Vast.ai](https://vast.ai/) | Any | Spot GPU market | Variable |

### API Routing & Proxy

| Tool | Provider | Features | Cost |
|------|----------|---------|------|
| [OpenRouter](https://openrouter.ai/) | OpenRouter | 100+ models, one key | Per token |
| [LiteLLM](https://github.com/BerriAI/litellm) | BerriAI | Open-source proxy | Free (self-host) |
| [Portkey](https://portkey.ai/) | Portkey | Observability + routing | Freemium |
| [Martian](https://withmartian.com/) | Martian | Smart routing by task | Custom |
| [Not Diamond](https://notdiamond.ai/) | Not Diamond | Routing for quality/cost | Freemium |

---

## 🚀 Getting Started Guide

> New to AI APIs? Here's a practical roadmap based on your use case.

### If you're building a chatbot or assistant:
1. **Start with**: Gemini 1.5 Flash (free tier) or GPT-4o mini
2. **Add memory**: Mem0, Zep, or just a vector DB + embeddings
3. **Add guardrails**: OpenAI Moderation API (free)
4. **Scale to**: Claude 3.5 Sonnet or GPT-4o for complex tasks

### If you're building a RAG application:
1. **Embeddings**: Start with OpenAI text-embedding-3-small
2. **Vector DB**: Chroma (local) → Pinecone (managed)
3. **LLM**: Claude 3.5 Sonnet (best at reading documents)
4. **Evaluate**: RAGAS or TruLens for quality metrics

### If you're building a code assistant:
1. **Start with**: GitHub Copilot or Codeium (free)
2. **For agentic coding**: Claude Code or Aider + Claude 3.5 Sonnet
3. **For custom tools**: DeepSeek Coder V2 (cheapest capable)
4. **Self-host**: Qwen2.5-Coder-32B with Ollama

### If you're building image generation:
1. **Prototype**: Flux Schnell ($0.003/image — barely anything)
2. **Production**: Flux 1.1 Pro or DALL-E 3 depending on style
3. **Commercial safety**: Adobe Firefly (no copyright risk)
4. **Self-host**: FLUX.1 Schnell (Apache 2.0 — truly free)

### If you're building voice apps:
1. **STT**: Deepgram Nova-2 (cheapest real-time)
2. **TTS**: OpenAI TTS (easiest) or ElevenLabs (most natural)
3. **Real-time**: Cartesia (lowest latency)
4. **Voice clone**: ElevenLabs ($22+/month for instant cloning)

### Quick Start Code Examples

**OpenAI Chat Completion:**
```python
from openai import OpenAI
client = OpenAI(api_key="your-key")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

**Anthropic Claude:**
```python
import anthropic
client = anthropic.Anthropic(api_key="your-key")

message = client.messages.create(
    model="claude-3-5-haiku-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)
```

**Google Gemini:**
```python
import google.generativeai as genai
genai.configure(api_key="your-key")

model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Hello!")
print(response.text)
```

**Groq (ultra-fast):**
```python
from groq import Groq
client = Groq(api_key="your-key")

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

**Ollama (local):**
```python
import ollama
response = ollama.chat(
    model="llama3.2",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response["message"]["content"])
```

**OpenAI Embeddings:**
```python
from openai import OpenAI
client = OpenAI(api_key="your-key")

response = client.embeddings.create(
    input="Your text here",
    model="text-embedding-3-small"
)
embedding = response.data[0].embedding  # List of 1536 floats
```

**Deepgram STT:**
```python
from deepgram import DeepgramClient
client = DeepgramClient("your-key")

with open("audio.mp3", "rb") as f:
    response = client.listen.prerecorded.v("1").transcribe_file(
        {"buffer": f.read(), "mimetype": "audio/mp3"},
        {"model": "nova-2"}
    )
print(response["results"]["channels"][0]["alternatives"][0]["transcript"])
```

**ElevenLabs TTS:**
```python
from elevenlabs import ElevenLabs, save
client = ElevenLabs(api_key="your-key")

audio = client.text_to_speech.convert(
    voice_id="21m00Tcm4TlvDq8ikWAM",
    text="Hello, world!",
    model_id="eleven_multilingual_v2"
)
save(audio, "output.mp3")
```

---

## 🤖 How Automation Works

This repo uses **5 GitHub Actions workflows** all powered by the Gemini API to keep itself up to date.

| Workflow | Schedule | What It Does | Trigger |
|----------|----------|--------------|---------|
| `auto-update.yml` | Every Sunday at midnight UTC | Asks Gemini to check for pricing changes, new APIs, deprecated entries | Scheduled + Manual |
| `validate.yml` | Every Wednesday at 6 AM UTC | Checks every single link in the README is still alive (HTTP 200) | Scheduled + Manual |
| `weekly-report.yml` | Every Saturday at 8 AM UTC | Generates a Markdown digest of AI API news for the week | Scheduled |
| `pr-automation.yml` | Every PR opened | Auto-labels PRs using Gemini, posts welcome message, checks format | PR Event |
| `changelog.yml` | Every release tag | Generates a formatted changelog from commit history using Gemini | Release Tag |

### Workflow Architecture

```
                    ┌─────────────────────────────────────┐
                    │          GitHub Actions              │
                    │                                     │
         Sunday     │  ┌───────────────┐                 │
         Midnight ──┼─▶│ auto-update   │──▶ Gemini API   │
                    │  └───────────────┘    │             │
                    │                       ▼             │
                    │                  Data Check         │
                    │                  + Suggestions      │
         Wednesday  │  ┌───────────────┐                 │
         6AM UTC ───┼─▶│   validate    │──▶ Link Checker │
                    │  └───────────────┘                 │
                    │                                     │
         Saturday   │  ┌───────────────┐                 │
         8AM UTC ───┼─▶│ weekly-report │──▶ Gemini API   │
                    │  └───────────────┘    │             │
                    │                       ▼             │
                    │                  Digest File        │
         PR Open ───┼─▶│ pr-automation │──▶ Gemini API   │
                    │  └───────────────┘                 │
                    └─────────────────────────────────────┘
```

### Setting It Up in Your Fork

```bash
# 1. Fork this repo on GitHub

# 2. Go to:
#    Settings → Secrets and variables → Actions → New repository secret

# 3. Add secret:
#    Name:  GEMINI_API_KEY
#    Value: your key from aistudio.google.com (it's free!)

# 4. That's it — workflows run automatically every week
```

You can also trigger any workflow manually from the **Actions** tab → select workflow → **Run workflow**.

### The `data/` Folder

Every time the auto-update workflow runs, it writes suggestions to `data/`:

```
data/
├── pricing-changes.md      # Detected pricing changes since last run
├── new-apis.md             # Newly discovered APIs Gemini suggests adding
├── deprecated-apis.md      # APIs that appear to have shut down
├── weekly-digest.md        # Latest weekly AI API news digest
└── validation-report.md    # Dead links found during validation
```

Human review is always required before changes go into the main README. Gemini suggests; humans approve.

---

## 🤝 How to Contribute

This directory is only as good as the people who maintain it. If you know of an API that's missing, pricing that's wrong, or a link that's dead — please fix it!

### Adding a New API

```
1. Fork this repo
2. Find the right section in README.md
3. Add a row following the exact table format
4. Submit a PR with title: add: [API Name] - [Category]
```

Gemini will auto-label your PR. A maintainer will review and merge, usually within 48 hours.

### Reporting Issues

- **Dead link?** → Open an issue or just fix it in a PR
- **Wrong pricing?** → Please include a source URL in your issue/PR
- **Missing API?** → Use the Add API issue template
- **Wrong category?** → Submit a PR moving it, explain why in the description

### PR Guidelines

| ✅ Do | ❌ Don't |
|-------|---------|
| One API per PR | Bundle multiple unrelated changes |
| Include a working link | Submit broken URLs |
| Verify pricing from official docs | Guess pricing |
| Choose the right tier | Put paid APIs in free section |
| Add a "What Makes It Special" note | Leave the last column blank |
| — | Use affiliate links |
| — | Add your own product without disclosure |

### Issue Templates

We have templates for:
- 🆕 **Add API** — structured form for suggesting new entries
- 💰 **Update Pricing** — form requiring a source URL
- 🔗 **Dead Link** — quick one-liner
- ❌ **Remove API** — for APIs that have shut down

---

## ❓ FAQ

**Q: How often is this updated?**
A: Automatically every Sunday via Gemini AI. Links are validated every Wednesday. You can also manually trigger updates anytime via the Actions tab.

**Q: I found wrong pricing — how do I report it?**
A: Open an issue using the "Update Pricing" template, or submit a PR with a source link. Pricing changes fast in this space — we appreciate the corrections.

**Q: Can I use this data in my own project?**
A: Yes! MIT licensed. Credit this repo if you can, but it's not required.

**Q: What's the difference between free and freemium?**
A: Free = genuinely free with permanent limits, no CC required. Freemium = free to start but designed to convert you to a paid plan. If it asks for a CC upfront, it goes in freemium or paid.

**Q: Is Gemini actually updating the README automatically?**
A: Gemini updates the `data/` folder with suggestions every Sunday. Direct edits to the README still require human review and a PR merge. We don't let an AI blindly rewrite the main document.

**Q: Which API should I use for [X]?**
A: The short answers: writing = Claude 3.5 Sonnet, speed = Groq, cheap = DeepSeek V3, free = Gemini Flash, images = Flux Schnell (cheap) or Midjourney (aesthetic), voice = ElevenLabs (TTS) + Deepgram (STT), local = Ollama + Llama 3.2.

**Q: My API isn't listed — can I add it?**
A: Absolutely. Open a PR or use the issue template. If it's a real, functional API with documented pricing (or clearly documented free tier), it belongs here.

**Q: How do I use multiple providers with one codebase?**
A: Use [LiteLLM](https://github.com/BerriAI/litellm) (open source) or [OpenRouter](https://openrouter.ai/) (managed). Both give you a single OpenAI-compatible API that routes to 100+ providers.

**Q: What's the best model for function/tool calling?**
A: GPT-4o is generally considered best-in-class for tool use. Claude 3.5 Sonnet is a close second and often preferred for complex multi-step reasoning. Llama 3.1/3.3 70B is the best open-source option.

**Q: Are there APIs with no rate limits?**
A: Self-hosted models have no rate limits (except your hardware). For managed APIs, Azure OpenAI, AWS Bedrock, and Google Vertex AI offer Provisioned Throughput options for guaranteed capacity.

**Q: What about privacy — which APIs don't train on my data?**
A: OpenAI Enterprise, Anthropic Claude (by policy), Azure OpenAI, AWS Bedrock, and Google Vertex AI all claim to not train on user data. Always verify their current data use agreements before trusting sensitive data to any provider.

**Q: What's the cheapest way to build a production AI app?**
A: Use Gemini 1.5 Flash (free up to limits, then $0.075/1M), store embeddings in pgvector (free if you already have Postgres), host on Cloudflare Workers AI for edge inference, and self-host Whisper for STT. You can get surprisingly far on near-zero cost.

---

## 📝 Changelog

> Recent significant updates to this directory.

| Date | Change | Type |
|------|--------|------|
| 2025-05-01 | Added Wan 2.1, CogVideoX open video models | ➕ Added |
| 2025-04-28 | Updated DeepSeek R1 pricing, added distilled models | 💰 Pricing |
| 2025-04-21 | Added Gemini 2.0 Flash and Thinking mode | ➕ Added |
| 2025-04-14 | Added Cartesia Sonic TTS, updated ElevenLabs tiers | ➕ Added |
| 2025-04-07 | Updated o3-mini pricing post general release | 💰 Pricing |
| 2025-03-31 | Added Agent Infrastructure section (E2B, Steel, etc) | ➕ Added |
| 2025-03-24 | Added Kokoro TTS, MeloTTS to open source audio | ➕ Added |
| 2025-03-17 | Updated Flux 1.1 Pro Ultra pricing | 💰 Pricing |
| 2025-03-10 | Added full Reasoning & Math models section | ➕ Added |
| 2025-03-03 | Added Docling, Marker to Document AI section | ➕ Added |
| 2025-02-24 | Added full AI Safety & Moderation section | ➕ Added |
| 2025-02-17 | Added Hailuo AI, Haiper 2.0 video APIs | ➕ Added |
| 2025-02-10 | Added Qwen 2.5 family (all sizes) | ➕ Added |
| 2025-02-03 | Added DeepSeek V3 + R1, updated cost tables | ➕ Added |
| 2025-01-27 | Initial expanded directory launch | 🎉 Launch |

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

**Found this useful? Give it a ⭐ — it helps others find it too.**

[🐛 Report an Issue](https://github.com/FluxeniteMC/Ai-hub/issues) · [➕ Add an API](https://github.com/FluxeniteMC/Ai-hub/issues/new?template=add_api.yml) · [💰 Update Pricing](https://github.com/FluxeniteMC/Ai-hub/issues/new?template=update_pricing.yml) · [📖 Setup Guide](SETUP.md) · [🤝 Contributing](CONTRIBUTING.md)

*Auto-updated every Sunday by Gemini AI · Validated every Wednesday · 300+ APIs catalogued · Maintained with ❤️ by the community*

</div>
