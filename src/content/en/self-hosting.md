# Self-Hosting

Deploy UniRo on your own infrastructure for maximum control and data sovereignty.

---

## Quick Start with Docker

```bash
docker run -d \
  -p 8857:8857 \
  -e GEMINI_API_KEY=your-key \
  -e UNIRO_API_KEYS=my-secret-key \
  truongdo619/uniro:latest
```

Test it:

```bash
curl http://localhost:8857/health
```

---

## Docker Compose

Create a `docker-compose.yml`:

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

Run:

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

## Ollama Integration

Run open-weight models locally with zero API cost:

1. Install [Ollama](https://ollama.com):

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1
```

2. Point UniRo to Ollama:

```bash
OLLAMA_API_BASE=http://localhost:11434
UNIRO_SIMPLE_MODEL=ollama/llama3.1
```

3. Use the `free` routing profile to route everything through Ollama:

```python
response = client.chat.completions.create(
    model="free",
    messages=messages
)
```

---

## Monitoring

UniRo exposes a `/metrics` endpoint compatible with Prometheus:

```bash
curl http://localhost:8857/metrics
```

Key metrics:
- `uniro_requests_total` — Total requests by model and status
- `uniro_routing_decisions` — Routing profile distribution
- `uniro_latency_seconds` — Request latency histogram
- `uniro_token_usage` — Token consumption by model

### Prometheus scrape config

```yaml
scrape_configs:
  - job_name: "uniro"
    static_configs:
      - targets: ["uniro:8857"]
    metrics_path: /metrics
    scrape_interval: 15s
```

---

## Environment Configuration

See [Configuration](/docs/configuration) for a full list of environment variables. Key variables for self-hosting:

| Variable | Purpose |
|---|---|
| `UNIRO_API_KEYS` | Protect your instance with API keys |
| `UNIRO_PORT` | Server port (default: 8857) |
| `UNIRO_LOG_LEVEL` | Logging verbosity |
| `OLLAMA_API_BASE` | Local Ollama endpoint |
| `UNIRO_CONFIDENCE_THRESHOLD` | Routing sensitivity |
