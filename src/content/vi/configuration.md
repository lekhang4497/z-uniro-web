# Cấu Hình

UniRo được cấu hình thông qua các biến môi trường. Tất cả biến đều có tiền tố `UNIRO_`.

---

## Thiết lập

Tạo file `.env` trong thư mục backend (hoặc tại `~/.uniro/.env`):

```bash
cp .env.example .env
```

---

## Biến môi trường

### Server

| Biến | Mặc định | Mô tả |
|---|---|---|
| `UNIRO_PORT` | `8857` | Port mà server lắng nghe |
| `UNIRO_API_KEYS` | (trống) | Danh sách API key phân cách bằng dấu phẩy. Để trống = truy cập mở |
| `UNIRO_LOG_LEVEL` | `info` | Mức log: `debug`, `info`, `warning`, `error` |

### Định tuyến (Routing)

| Biến | Mặc định | Mô tả |
|---|---|---|
| `UNIRO_SIMPLE_MODEL` | `gemini-2.5-flash` | Model mặc định cho các truy vấn đơn giản |
| `UNIRO_COMPLEX_MODEL` | `gemini-2.5-pro` | Model mặc định cho các truy vấn phức tạp |
| `UNIRO_CONFIDENCE_THRESHOLD` | `0.06` | Ngưỡng tin cậy của bộ phân loại. Thấp hơn = nhiều truy vấn được chuyển đến model phức tạp hơn |
| `UNIRO_ENCODER_TYPE` | `sentence-transformer` | Bộ mã hóa embedding: `sentence-transformer` hoặc `openai` |
| `UNIRO_FALLBACK_CHAIN` | (tự động) | Danh sách model dự phòng phân cách bằng dấu phẩy. Tự động xây dựng từ các tầng đã cấu hình nếu không được thiết lập |

### API Key của nhà cung cấp

| Biến | Mô tả |
|---|---|
| `GEMINI_API_KEY` | API key của Google Gemini |
| `OPENAI_API_KEY` | API key của OpenAI |
| `ANTHROPIC_API_KEY` | API key của Anthropic |
| `OPENROUTER_API_KEY` | API key của OpenRouter |

### Gateway

| Biến | Mặc định | Mô tả |
|---|---|---|
| `UNIRO_PREFERRED_GATEWAY` | `openrouter` | Nhà cung cấp gateway: `openrouter`, `vercel`, hoặc `custom` |
| `UNIRO_CUSTOM_GATEWAY_URL` | (không có) | URL cho endpoint gateway tùy chỉnh |

### Model mã nguồn mở (Open-Weight)

| Biến | Mặc định | Mô tả |
|---|---|---|
| `OLLAMA_API_BASE` | `http://localhost:11434` | URL cơ sở của Ollama API |
| `VLLM_API_BASE` | (không có) | URL endpoint của vLLM hoặc TGI |

---

## Routing Profile

Sử dụng routing profile thay vì tên model cụ thể để UniRo tối ưu hóa:

| Profile | Hành vi | Trường hợp sử dụng |
|---|---|---|
| `auto` | Định tuyến 3D đầy đủ (độ phức tạp + chi phí + ngôn ngữ) | Mặc định — phù hợp nhất cho hầu hết trường hợp |
| `eco` | Chuyển đến model rẻ nhất đạt ngưỡng chất lượng | Ứng dụng nhạy cảm về chi phí |
| `premium` | Luôn sử dụng model tốt nhất | Tác vụ yêu cầu chất lượng cao |
| `free` | Chỉ chuyển đến model mã nguồn mở (chi phí token $0) | Triển khai nội bộ, ngân sách bằng không |
| `reasoning` | Sử dụng model có khả năng suy luận với chain-of-thought | Toán, logic, sinh mã |

### Ví dụ

```python
# Để UniRo quyết định
response = client.chat.completions.create(model="auto", messages=messages)

# Buộc chọn model rẻ nhất
response = client.chat.completions.create(model="eco", messages=messages)

# Bỏ qua routing — sử dụng model cụ thể
response = client.chat.completions.create(model="gemini-2.5-pro", messages=messages)
```

---

## Model Alias

Tên viết tắt được ánh xạ đến model ID đầy đủ:

| Alias | Ánh xạ đến |
|---|---|
| `flash` | `gemini-2.5-flash` |
| `pro` | `gemini-2.5-pro` |
| `sonnet` | `claude-sonnet-4-5-20250929` |
| `opus` | `claude-opus-4-6` |
| `gpt` | `gpt-5.4` |
| `deepseek` | `deepseek-chat` |

---

## Điều chỉnh ngưỡng tin cậy (Confidence Threshold)

`UNIRO_CONFIDENCE_THRESHOLD` kiểm soát khi nào bộ phân loại chuyển truy vấn đến model phức tạp:

- **Ngưỡng thấp (ví dụ: 0.03):** Nhiều truy vấn hơn được chuyển đến model phức tạp (đắt hơn). Chất lượng cao hơn, chi phí cao hơn.
- **Ngưỡng cao (ví dụ: 0.10):** Nhiều truy vấn hơn được chuyển đến model đơn giản (rẻ hơn). Chi phí thấp hơn, có thể giảm chất lượng cho các truy vấn ở ranh giới.
- **Mặc định (0.06):** Cân bằng — điểm khởi đầu tốt.

Theo dõi độ chính xác định tuyến qua endpoint `/metrics` và điều chỉnh dựa trên yêu cầu chất lượng của bạn.
