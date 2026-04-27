# Quick Start

Get up and running with UniRo in under 2 minutes.

---

## 1. Get your API key

Sign up at [uniro.vn](https://uniro.vn) and grab your API key from the dashboard. Your key looks like `uniro-key-xxx`.

## 2. Install your preferred SDK

UniRo is OpenAI-compatible, so use any OpenAI SDK:

**Python:**

```bash
pip install openai
```

**TypeScript / Node.js:**

```bash
npm install openai
```

## 3. Make your first request

**Python:**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.uniro.vn/v1",
    api_key="your-uniro-key"
)

response = client.chat.completions.create(
    model="auto",  # UniRo picks the best model
    messages=[{"role": "user", "content": "What is machine learning?"}]
)

print(response.choices[0].message.content)
```

**TypeScript:**

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.uniro.vn/v1",
  apiKey: "your-uniro-key",
});

const response = await client.chat.completions.create({
  model: "auto",
  messages: [{ role: "user", content: "What is machine learning?" }],
});

console.log(response.choices[0].message.content);
```

**cURL:**

```bash
curl https://api.uniro.vn/v1/chat/completions \
  -H "Authorization: Bearer your-uniro-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "What is machine learning?"}]
  }'
```

## 4. Choose a routing profile

Instead of `"auto"`, you can use these routing profiles:

| Profile | Behavior |
|---|---|
| `auto` | Smart routing — picks the best model for complexity, cost, and language |
| `eco` | Maximize savings — cheapest model that meets quality threshold |
| `premium` | Always use the best model |
| `reasoning` | Use a reasoning model (chain-of-thought) |

Or bypass routing entirely by specifying a model directly: `"gpt-5.4"`, `"gemini-2.5-pro"`, `"claude-opus-4.6"`.

## 5. Enable streaming

```python
stream = client.chat.completions.create(
    model="auto",
    messages=[{"role": "user", "content": "Explain microservices"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

---

That's it! UniRo handles routing, provider selection, and fallbacks automatically. Check the [API Reference](/docs/api-reference) for full endpoint documentation.
