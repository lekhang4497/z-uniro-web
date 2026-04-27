# Các Model Được Hỗ Trợ

UniRo hỗ trợ nhiều loại model từ nhiều nhà cung cấp khác nhau. Sử dụng routing profile hoặc chỉ định trực tiếp model.

---

## Routing Profile

Thay vì chọn model, hãy để UniRo chọn model tốt nhất:

| Profile | Hành vi | Phù hợp cho |
|---|---|---|
| `auto` | Định tuyến 3D (độ phức tạp + chi phí + ngôn ngữ) | Sử dụng chung — mặc định được khuyến nghị |
| `eco` | Model rẻ nhất đạt ngưỡng chất lượng | Ứng dụng nhạy cảm chi phí |
| `premium` | Luôn dùng model tốt nhất | Tác vụ yêu cầu chất lượng cao |
| `reasoning` | Model suy luận chain-of-thought | Toán, logic, lập trình |
| `free` | Chỉ dùng model mã nguồn mở (chi phí $0) | Triển khai nội bộ, ngân sách bằng không |

---

## Model trên Cloud

### Google Gemini

| Model | Cửa sổ ngữ cảnh | Điểm mạnh |
|---|---|---|
| `gemini-2.5-flash` | 1M token | Nhanh, rẻ, tuyệt vời cho tác vụ đơn giản |
| `gemini-2.5-pro` | 1M token | Chất lượng cao, phù hợp cho tác vụ phức tạp |
| `gemini-2.5-flash-lite` | 1M token | Nhanh nhất, rẻ nhất trong dòng Gemini |

### OpenAI

| Model | Cửa sổ ngữ cảnh | Điểm mạnh |
|---|---|---|
| `gpt-5.4` | 128K token | GPT mới nhất, mạnh toàn diện |
| `gpt-4.1-mini` | 128K token | Nhanh, hiệu quả chi phí |
| `o4-mini` | 200K token | Model suy luận |

### Anthropic

| Model | Cửa sổ ngữ cảnh | Điểm mạnh |
|---|---|---|
| `claude-sonnet-4-5-20250929` | 200K token | Xuất sắc cho lập trình và phân tích |
| `claude-opus-4-6` | 200K token | Model mạnh nhất của Anthropic |

### DeepSeek

| Model | Cửa sổ ngữ cảnh | Điểm mạnh |
|---|---|---|
| `deepseek-chat` | 64K token | Hiệu quả chi phí, hỗ trợ đa ngôn ngữ tốt |
| `deepseek-reasoner` | 64K token | Tập trung vào suy luận |

---

## Model mã nguồn mở (qua Ollama)

Chạy cục bộ với chi phí token $0:

| Model | Tham số | Điểm mạnh |
|---|---|---|
| `ollama/llama3.1` | 8B / 70B | Đa năng mạnh mẽ |
| `ollama/mistral` | 7B | Nhanh, hiệu quả |
| `ollama/codellama` | 34B | Sinh mã |
| `ollama/phi3` | 3.8B | Nhỏ gọn, nhanh |

Thiết lập `OLLAMA_API_BASE` và sử dụng routing profile `free`.

---

## Model Alias

Tên viết tắt cho tiện lợi:

| Alias | Ánh xạ đến |
|---|---|
| `flash` | `gemini-2.5-flash` |
| `pro` | `gemini-2.5-pro` |
| `sonnet` | `claude-sonnet-4-5-20250929` |
| `opus` | `claude-opus-4-6` |
| `gpt` | `gpt-5.4` |
| `deepseek` | `deepseek-chat` |

---

## Model tùy chỉnh qua Gateway

Nếu sử dụng gateway tùy chỉnh (OpenRouter, Vercel AI Gateway, v.v.), bất kỳ model nào có sẵn trên gateway đó đều có thể được sử dụng bằng cách chỉ định đầy đủ model ID:

```python
response = client.chat.completions.create(
    model="meta-llama/llama-3.1-405b-instruct",
    messages=messages
)
```

Xem [Cấu hình](/docs/configuration) để thiết lập gateway.
