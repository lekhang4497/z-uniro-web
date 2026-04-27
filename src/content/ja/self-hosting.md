# セルフホスティング

自社インフラに UniRo をデプロイして、最大限の制御とデータ主権を確保しましょう。

---

## Docker でクイックスタート

```bash
docker run -d \
  -p 8857:8857 \
  -e GEMINI_API_KEY=your-key \
  -e UNIRO_API_KEYS=my-secret-key \
  truongdo619/uniro:latest
```

動作確認:

```bash
curl http://localhost:8857/health
```

---

## Docker Compose

`docker-compose.yml` を作成します。

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

実行:

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

## Ollama との連携

オープンウェイトモデルをローカルで実行し、API コストをゼロにできます。

1. [Ollama](https://ollama.com) をインストール:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1
```

2. UniRo を Ollama に接続:

```bash
OLLAMA_API_BASE=http://localhost:11434
UNIRO_SIMPLE_MODEL=ollama/llama3.1
```

3. `free` ルーティングプロファイルを使用して、すべてのリクエストを Ollama 経由にルーティング:

```python
response = client.chat.completions.create(
    model="free",
    messages=messages
)
```

---

## モニタリング

UniRo は Prometheus 互換の `/metrics` エンドポイントを提供しています。

```bash
curl http://localhost:8857/metrics
```

主要なメトリクス:
- `uniro_requests_total` — モデルおよびステータス別の総リクエスト数
- `uniro_routing_decisions` — ルーティングプロファイルの分布
- `uniro_latency_seconds` — リクエストレイテンシのヒストグラム
- `uniro_token_usage` — モデル別のトークン消費量

### Prometheus スクレイプ設定

```yaml
scrape_configs:
  - job_name: "uniro"
    static_configs:
      - targets: ["uniro:8857"]
    metrics_path: /metrics
    scrape_interval: 15s
```

---

## 環境設定

環境変数の完全な一覧については [設定](/docs/configuration) をご覧ください。セルフホスティングで重要な変数:

| 変数 | 用途 |
|---|---|
| `UNIRO_API_KEYS` | API キーでインスタンスを保護 |
| `UNIRO_PORT` | サーバーポート（デフォルト: 8857） |
| `UNIRO_LOG_LEVEL` | ログの詳細度 |
| `OLLAMA_API_BASE` | ローカル Ollama エンドポイント |
| `UNIRO_CONFIDENCE_THRESHOLD` | ルーティングの感度 |
