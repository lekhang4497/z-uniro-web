# Tài Liệu API

UniRo cung cấp REST API tương thích với OpenAI. Tất cả các endpoint nằm dưới đường dẫn `/v1/`.

---

## Xác thực

Tất cả yêu cầu đều cần Bearer token:

```
Authorization: Bearer your-uniro-key
```

Nếu `UNIRO_API_KEYS` chưa được thiết lập trên server, xác thực sẽ bị tắt (truy cập mở).

---

## POST /v1/chat/completions

Tạo một chat completion. Hỗ trợ cả streaming và non-streaming.

### Nội dung yêu cầu (Request body)

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `model` | string | Có | Tên model hoặc routing profile: `auto`, `eco`, `premium`, `reasoning`, hoặc một model ID cụ thể |
| `messages` | array | Có | Mảng các đối tượng message với `role` và `content` |
| `stream` | boolean | Không | Bật SSE streaming (mặc định: `false`) |
| `temperature` | number | Không | Nhiệt độ lấy mẫu (0-2, mặc định: tùy thuộc model) |
| `max_tokens` | number | Không | Số token tối đa trong phản hồi |
| `top_p` | number | Không | Tham số nucleus sampling |
| `stop` | string hoặc array | Không | Chuỗi dừng |
| `tools` | array | Không | Định nghĩa tool/function (kích hoạt agentic routing) |

### Đối tượng message

```json
{
  "role": "user",
  "content": "Your message here"
}
```

Các role được hỗ trợ: `system`, `user`, `assistant`, `tool`.

### Phản hồi (non-streaming)

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

### Phản hồi (streaming)

Khi `stream: true`, phản hồi là Server-Sent Events:

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}

data: [DONE]
```

### Phản hồi lỗi

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

Phân loại độ phức tạp của prompt mà không cần tạo completion.

### Nội dung yêu cầu (Request body)

```json
{
  "prompt": "Your prompt text here"
}
```

### Phản hồi

```json
{
  "classification": "complex",
  "confidence": 0.82,
  "recommended_model": "gemini-2.5-pro"
}
```

---

## GET /v1/models

Liệt kê các model khả dụng, alias và routing profile.

### Phản hồi

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

Endpoint kiểm tra sức khỏe. Trả về trạng thái server.

### Phản hồi

```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

---

## Giới hạn tốc độ (Rate Limits)

| Gói | Yêu cầu/phút | Yêu cầu/ngày |
|---|---|---|
| Free | 20 | 1.000 |
| Pro | 200 | Không giới hạn |
| Enterprise | Tùy chỉnh | Tùy chỉnh |

Các header giới hạn tốc độ được bao gồm trong mọi phản hồi:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
X-RateLimit-Reset: 1710100000
```
