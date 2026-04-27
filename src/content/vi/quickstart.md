# Bắt Đầu Nhanh

Khởi chạy UniRo trong chưa đầy 2 phút.

---

## 1. Lấy API key của bạn

Đăng ký tại [uniro.vn](https://uniro.vn) và lấy API key từ bảng điều khiển. Key của bạn có dạng `uniro-key-xxx`.

## 2. Cài đặt SDK mà bạn muốn sử dụng

UniRo tương thích với OpenAI, vì vậy bạn có thể sử dụng bất kỳ SDK OpenAI nào:

**Python:**

```bash
pip install openai
```

**TypeScript / Node.js:**

```bash
npm install openai
```

## 3. Gửi yêu cầu đầu tiên

**Python:**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.uniro.vn/v1",
    api_key="your-uniro-key"
)

response = client.chat.completions.create(
    model="auto",  # UniRo chọn model tốt nhất
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

## 4. Chọn routing profile

Thay vì `"auto"`, bạn có thể sử dụng các routing profile sau:

| Profile | Hành vi |
|---|---|
| `auto` | Định tuyến thông minh — chọn model tốt nhất dựa trên độ phức tạp, chi phí và ngôn ngữ |
| `eco` | Tối ưu tiết kiệm — model rẻ nhất đạt ngưỡng chất lượng |
| `premium` | Luôn sử dụng model tốt nhất |
| `reasoning` | Sử dụng model suy luận (chain-of-thought) |

Hoặc bỏ qua routing hoàn toàn bằng cách chỉ định trực tiếp model: `"gpt-5.4"`, `"gemini-2.5-pro"`, `"claude-opus-4.6"`.

## 5. Bật streaming

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

Vậy là xong! UniRo tự động xử lý định tuyến, lựa chọn provider và fallback. Xem [Tài liệu API](/docs/api-reference) để biết đầy đủ về các endpoint.
