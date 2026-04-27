# Configuration

UniRo is configured via environment variables. All variables are prefixed with `UNIRO_`.

---

## Setup

Create a `.env` file in the backend directory (or at `~/.uniro/.env`):

```bash
cp .env.example .env
```

---

## Environment Variables

### Server

| Variable | Default | Description |
|---|---|---|
| `UNIRO_PORT` | `8857` | Port the server listens on |
| `UNIRO_API_KEYS` | (empty) | Comma-separated API keys. Empty = open access |
| `UNIRO_LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warning`, `error` |

### Routing

| Variable | Default | Description |
|---|---|---|
| `UNIRO_SIMPLE_MODEL` | `gemini-2.5-flash` | Default model for simple queries |
| `UNIRO_COMPLEX_MODEL` | `gemini-2.5-pro` | Default model for complex queries |
| `UNIRO_CONFIDENCE_THRESHOLD` | `0.06` | Classifier confidence threshold. Lower = more queries routed to complex model |
| `UNIRO_ENCODER_TYPE` | `sentence-transformer` | Embedding encoder: `sentence-transformer` or `openai` |
| `UNIRO_FALLBACK_CHAIN` | (auto) | Comma-separated fallback models. Auto-built from configured tiers if not set |

### Provider API Keys

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |

### Gateway

| Variable | Default | Description |
|---|---|---|
| `UNIRO_PREFERRED_GATEWAY` | `openrouter` | Gateway provider: `openrouter`, `vercel`, or `custom` |
| `UNIRO_CUSTOM_GATEWAY_URL` | (none) | URL for custom gateway endpoint |

### Open-Weight Models

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_API_BASE` | `http://localhost:11434` | Ollama API base URL |
| `VLLM_API_BASE` | (none) | vLLM or TGI endpoint URL |

---

## Routing Profiles

Use routing profiles instead of specific model names to let UniRo optimize:

| Profile | Behavior | Use case |
|---|---|---|
| `auto` | Full 3D routing (complexity + cost + language) | Default — best for most use cases |
| `eco` | Route to cheapest model that meets quality threshold | Cost-sensitive applications |
| `premium` | Always use the best model | Quality-critical tasks |
| `free` | Route to open-weight models only ($0 token cost) | On-premise, budget-zero |
| `reasoning` | Use reasoning-capable model with chain-of-thought | Math, logic, code generation |

### Example

```python
# Let UniRo decide
response = client.chat.completions.create(model="auto", messages=messages)

# Force cheapest
response = client.chat.completions.create(model="eco", messages=messages)

# Bypass routing — use specific model
response = client.chat.completions.create(model="gemini-2.5-pro", messages=messages)
```

---

## Model Aliases

Short names that resolve to full model IDs:

| Alias | Resolves to |
|---|---|
| `flash` | `gemini-2.5-flash` |
| `pro` | `gemini-2.5-pro` |
| `sonnet` | `claude-sonnet-4-5-20250929` |
| `opus` | `claude-opus-4-6` |
| `gpt` | `gpt-5.4` |
| `deepseek` | `deepseek-chat` |

---

## Confidence Threshold Tuning

The `UNIRO_CONFIDENCE_THRESHOLD` controls when the classifier routes to the complex model:

- **Lower threshold (e.g., 0.03):** More queries go to the complex (expensive) model. Higher quality, higher cost.
- **Higher threshold (e.g., 0.10):** More queries go to the simple (cheap) model. Lower cost, may reduce quality for borderline queries.
- **Default (0.06):** Balanced — good starting point.

Monitor routing accuracy via the `/metrics` endpoint and adjust based on your quality requirements.
