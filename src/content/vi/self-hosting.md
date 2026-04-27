# Tự Triển Khai (Self-Hosting)

Triển khai UniRo trên hạ tầng của riêng bạn để kiểm soát tối đa và đảm bảo chủ quyền dữ liệu.

---

## Bắt đầu nhanh với Docker

```bash
docker run -d \
  -p 8857:8857 \
  -e GEMINI_API_KEY=your-key \
  -e UNIRO_API_KEYS=my-secret-key \
  truongdo619/uniro:latest
```

Kiểm tra:

```bash
curl http://localhost:8857/health
```

---

## Docker Compose

Tạo file `docker-compose.yml`:

```yaml
version: "3.8"
services:
  uniro:
    image: truongdo619/uniro:latest
    ports:
      - "8857:8857"
    environment:
      - UNIRO_PORT=8857
      - UNIRO_API_KEYS=my-secret-key
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - UNIRO_SIMPLE_MODEL=gemini-2.5-flash
      - UNIRO_COMPLEX_MODEL=gemini-2.5-pro
      - UNIRO_CONFIDENCE_THRESHOLD=0.06
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8857/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Chạy:

```bash
docker compose up -d
```

---

## Kubernetes

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: uniro
spec:
  replicas: 2
  selector:
    matchLabels:
      app: uniro
  template:
    metadata:
      labels:
        app: uniro
    spec:
      containers:
        - name: uniro
          image: truongdo619/uniro:latest
          ports:
            - containerPort: 8857
          env:
            - name: UNIRO_PORT
              value: "8857"
            - name: GEMINI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: uniro-secrets
                  key: gemini-api-key
          readinessProbe:
            httpGet:
              path: /health
              port: 8857
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: uniro
spec:
  selector:
    app: uniro
  ports:
    - port: 80
      targetPort: 8857
  type: ClusterIP
```

---

## Tích hợp Ollama

Chạy các model mã nguồn mở cục bộ với chi phí API bằng không:

1. Cài đặt [Ollama](https://ollama.com):

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1
```

2. Trỏ UniRo đến Ollama:

```bash
OLLAMA_API_BASE=http://localhost:11434
UNIRO_SIMPLE_MODEL=ollama/llama3.1
```

3. Sử dụng routing profile `free` để chuyển mọi yêu cầu qua Ollama:

```python
response = client.chat.completions.create(
    model="free",
    messages=messages
)
```

---

## Giám sát (Monitoring)

UniRo cung cấp endpoint `/metrics` tương thích với Prometheus:

```bash
curl http://localhost:8857/metrics
```

Các metric chính:
- `uniro_requests_total` — Tổng số yêu cầu theo model và trạng thái
- `uniro_routing_decisions` — Phân bố routing profile
- `uniro_latency_seconds` — Biểu đồ độ trễ yêu cầu
- `uniro_token_usage` — Lượng token tiêu thụ theo model

### Cấu hình scrape cho Prometheus

```yaml
scrape_configs:
  - job_name: "uniro"
    static_configs:
      - targets: ["uniro:8857"]
    metrics_path: /metrics
    scrape_interval: 15s
```

---

## Cấu hình môi trường

Xem [Cấu hình](/docs/configuration) để biết danh sách đầy đủ các biến môi trường. Các biến quan trọng cho tự triển khai:

| Biến | Mục đích |
|---|---|
| `UNIRO_API_KEYS` | Bảo vệ instance của bạn bằng API key |
| `UNIRO_PORT` | Port của server (mặc định: 8857) |
| `UNIRO_LOG_LEVEL` | Mức độ chi tiết của log |
| `OLLAMA_API_BASE` | Endpoint Ollama cục bộ |
| `UNIRO_CONFIDENCE_THRESHOLD` | Độ nhạy định tuyến |
