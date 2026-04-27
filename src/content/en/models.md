# Supported Models

UniRo supports a wide range of models across multiple providers. Use routing profiles or specify a model directly.

---

## Routing Profiles

Instead of choosing a model, let UniRo pick the best one:

| Profile | Behavior | Best for |
|---|---|---|
| `auto` | 3D routing (complexity + cost + language) | General use — recommended default |
| `eco` | Cheapest model meeting quality threshold | Cost-sensitive apps |
| `premium` | Always the best model | Quality-critical tasks |
| `reasoning` | Chain-of-thought reasoning model | Math, logic, code |
| `free` | Open-weight models only ($0 cost) | On-premise, zero budget |

---

## Cloud Models

### Google Gemini

| Model | Context Window | Strengths |
|---|---|---|
| `gemini-2.5-flash` | 1M tokens | Fast, cheap, great for simple tasks |
| `gemini-2.5-pro` | 1M tokens | High quality, good for complex tasks |
| `gemini-2.5-flash-lite` | 1M tokens | Fastest, cheapest Gemini option |

### OpenAI

| Model | Context Window | Strengths |
|---|---|---|
| `gpt-5.4` | 128K tokens | Latest GPT, strong all-around |
| `gpt-4.1-mini` | 128K tokens | Fast, cost-effective |
| `o4-mini` | 200K tokens | Reasoning model |

### Anthropic

| Model | Context Window | Strengths |
|---|---|---|
| `claude-sonnet-4-5-20250929` | 200K tokens | Great for coding and analysis |
| `claude-opus-4-6` | 200K tokens | Most capable Anthropic model |

### DeepSeek

| Model | Context Window | Strengths |
|---|---|---|
| `deepseek-chat` | 64K tokens | Cost-effective, strong multilingual |
| `deepseek-reasoner` | 64K tokens | Reasoning-focused |

---

## Open-Weight Models (via Ollama)

Run these locally for $0 token cost:

| Model | Parameters | Strengths |
|---|---|---|
| `ollama/llama3.1` | 8B / 70B | Strong general-purpose |
| `ollama/mistral` | 7B | Fast, efficient |
| `ollama/codellama` | 34B | Code generation |
| `ollama/phi3` | 3.8B | Tiny, fast |

Set `OLLAMA_API_BASE` and use the `free` routing profile.

---

## Model Aliases

Short names for convenience:

| Alias | Resolves to |
|---|---|
| `flash` | `gemini-2.5-flash` |
| `pro` | `gemini-2.5-pro` |
| `sonnet` | `claude-sonnet-4-5-20250929` |
| `opus` | `claude-opus-4-6` |
| `gpt` | `gpt-5.4` |
| `deepseek` | `deepseek-chat` |

---

## Custom Models via Gateway

If using a custom gateway (OpenRouter, Vercel AI Gateway, etc.), any model available on that gateway can be used by specifying its full model ID:

```python
response = client.chat.completions.create(
    model="meta-llama/llama-3.1-405b-instruct",
    messages=messages
)
```

See [Configuration](/docs/configuration) for gateway setup.
