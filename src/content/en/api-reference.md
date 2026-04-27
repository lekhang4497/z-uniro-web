# API Reference

UniRo exposes an OpenAI-compatible REST API. All endpoints are under `/v1/`.

---

## Authentication

All requests require a Bearer token:

```
Authorization: Bearer your-uniro-key
```

If `UNIRO_API_KEYS` is not set on the server, authentication is disabled (open access).

---

## POST /v1/chat/completions

Create a chat completion. Supports streaming and non-streaming.

### Request body

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model` | string | Yes | Model name or routing profile: `auto`, `eco`, `premium`, `reasoning`, or a specific model ID |
| `messages` | array | Yes | Array of message objects with `role` and `content` |
| `stream` | boolean | No | Enable SSE streaming (default: `false`) |
| `temperature` | number | No | Sampling temperature (0-2, default: model-dependent) |
| `max_tokens` | number | No | Maximum tokens in response |
| `top_p` | number | No | Nucleus sampling parameter |
| `stop` | string or array | No | Stop sequences |
| `tools` | array | No | Tool/function definitions (triggers agentic routing) |

### Message object

```json
{
  "role": "user",
  "content": "Your message here"
}
```

Supported roles: `system`, `user`, `assistant`, `tool`.

### Response (non-streaming)

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gemini-2.5-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Response text here"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 150,
    "total_tokens": 175
  }
}
```

### Response (streaming)

When `stream: true`, the response is Server-Sent Events:

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}

data: [DONE]
```

### Error response

```json
{
  "error": {
    "message": "Invalid API key",
    "type": "authentication_error",
    "code": 401
  }
}
```

---

## POST /v1/classify

Classify prompt complexity without making a completion.

### Request body

```json
{
  "prompt": "Your prompt text here"
}
```

### Response

```json
{
  "classification": "complex",
  "confidence": 0.82,
  "recommended_model": "gemini-2.5-pro"
}
```

---

## GET /v1/models

List available models, aliases, and routing profiles.

### Response

```json
{
  "data": [
    {
      "id": "auto",
      "object": "model",
      "description": "Smart routing - optimal model for each request"
    },
    {
      "id": "gemini-2.5-flash",
      "object": "model",
      "description": "Google Gemini 2.5 Flash"
    }
  ]
}
```

---

## GET /health

Health check endpoint. Returns server status.

### Response

```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

---

## Rate Limits

| Plan | Requests/minute | Requests/day |
|---|---|---|
| Free | 20 | 1,000 |
| Pro | 200 | Unlimited |
| Enterprise | Custom | Custom |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
X-RateLimit-Reset: 1710100000
```
