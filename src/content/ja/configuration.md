# 設定

UniRo は環境変数で設定します。すべての変数には `UNIRO_` プレフィックスが付きます。

---

## セットアップ

backend ディレクトリ（または `~/.uniro/.env`）に `.env` ファイルを作成してください。

```bash
cp .env.example .env
```

---

## 環境変数

### サーバー

| 変数 | デフォルト | 説明 |
|---|---|---|
| `UNIRO_PORT` | `8857` | サーバーがリッスンするポート |
| `UNIRO_API_KEYS` | （空） | カンマ区切りの API キー。空の場合はオープンアクセス |
| `UNIRO_LOG_LEVEL` | `info` | ログレベル: `debug`、`info`、`warning`、`error` |

### ルーティング

| 変数 | デフォルト | 説明 |
|---|---|---|
| `UNIRO_SIMPLE_MODEL` | `gemini-2.5-flash` | シンプルなクエリ向けのデフォルトモデル |
| `UNIRO_COMPLEX_MODEL` | `gemini-2.5-pro` | 複雑なクエリ向けのデフォルトモデル |
| `UNIRO_CONFIDENCE_THRESHOLD` | `0.06` | 分類器の信頼度閾値。低いほど複雑モデルにルーティングされるクエリが増加 |
| `UNIRO_ENCODER_TYPE` | `sentence-transformer` | 埋め込みエンコーダー: `sentence-transformer` または `openai` |
| `UNIRO_FALLBACK_CHAIN` | （自動） | カンマ区切りのフォールバックモデル。未設定の場合、設定済みティアから自動構築 |

### プロバイダー API キー

| 変数 | 説明 |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API キー |
| `OPENAI_API_KEY` | OpenAI API キー |
| `ANTHROPIC_API_KEY` | Anthropic API キー |
| `OPENROUTER_API_KEY` | OpenRouter API キー |

### ゲートウェイ

| 変数 | デフォルト | 説明 |
|---|---|---|
| `UNIRO_PREFERRED_GATEWAY` | `openrouter` | ゲートウェイプロバイダー: `openrouter`、`vercel`、または `custom` |
| `UNIRO_CUSTOM_GATEWAY_URL` | （なし） | カスタムゲートウェイエンドポイントの URL |

### オープンウェイトモデル

| 変数 | デフォルト | 説明 |
|---|---|---|
| `OLLAMA_API_BASE` | `http://localhost:11434` | Ollama API ベース URL |
| `VLLM_API_BASE` | （なし） | vLLM または TGI エンドポイント URL |

---

## ルーティングプロファイル

特定のモデル名の代わりにルーティングプロファイルを使用すると、UniRo が最適化を行います。

| プロファイル | 動作 | ユースケース |
|---|---|---|
| `auto` | 完全な 3D ルーティング（複雑さ + コスト + 言語） | デフォルト — ほとんどのユースケースに最適 |
| `eco` | 品質基準を満たす最も安価なモデルにルーティング | コスト重視のアプリケーション |
| `premium` | 常に最高性能のモデルを使用 | 品質が重要なタスク |
| `free` | オープンウェイトモデルのみにルーティング（トークンコスト $0） | オンプレミス、予算ゼロ |
| `reasoning` | chain-of-thought 対応の推論モデルを使用 | 数学、論理、コード生成 |

### 使用例

```python
# UniRo に判断を任せる
response = client.chat.completions.create(model="auto", messages=messages)

# 最も安価なモデルを強制
response = client.chat.completions.create(model="eco", messages=messages)

# ルーティングをバイパス — 特定のモデルを使用
response = client.chat.completions.create(model="gemini-2.5-pro", messages=messages)
```

---

## モデルエイリアス

完全なモデル ID に解決される短縮名:

| エイリアス | 解決先 |
|---|---|
| `flash` | `gemini-2.5-flash` |
| `pro` | `gemini-2.5-pro` |
| `sonnet` | `claude-sonnet-4-5-20250929` |
| `opus` | `claude-opus-4-6` |
| `gpt` | `gpt-5.4` |
| `deepseek` | `deepseek-chat` |

---

## 信頼度閾値のチューニング

`UNIRO_CONFIDENCE_THRESHOLD` は、分類器が複雑モデルにルーティングするタイミングを制御します。

- **低い閾値（例: 0.03）:** より多くのクエリが複雑（高コスト）モデルに送られます。品質は向上しますが、コストも増加します。
- **高い閾値（例: 0.10）:** より多くのクエリがシンプル（低コスト）モデルに送られます。コストは下がりますが、境界線上のクエリでは品質が低下する可能性があります。
- **デフォルト（0.06）:** バランス型 — 良い出発点です。

`/metrics` エンドポイントでルーティング精度を監視し、品質要件に応じて調整してください。
