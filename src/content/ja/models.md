# 対応モデル

UniRo は複数のプロバイダーにまたがる幅広いモデルをサポートしています。ルーティングプロファイルを使用するか、モデルを直接指定できます。

---

## ルーティングプロファイル

モデルを選ぶ代わりに、UniRo に最適なモデルを選択させましょう。

| プロファイル | 動作 | 最適な用途 |
|---|---|---|
| `auto` | 3D ルーティング（複雑さ + コスト + 言語） | 一般的な用途 — 推奨デフォルト |
| `eco` | 品質基準を満たす最も安価なモデル | コスト重視のアプリ |
| `premium` | 常に最高性能のモデル | 品質が重要なタスク |
| `reasoning` | chain-of-thought 推論モデル | 数学、論理、コード |
| `free` | オープンウェイトモデルのみ（コスト $0） | オンプレミス、予算ゼロ |

---

## クラウドモデル

### Google Gemini

| モデル | コンテキストウィンドウ | 強み |
|---|---|---|
| `gemini-2.5-flash` | 1M tokens | 高速、低コスト、シンプルなタスクに最適 |
| `gemini-2.5-pro` | 1M tokens | 高品質、複雑なタスクに最適 |
| `gemini-2.5-flash-lite` | 1M tokens | 最速、最も安価な Gemini オプション |

### OpenAI

| モデル | コンテキストウィンドウ | 強み |
|---|---|---|
| `gpt-5.4` | 128K tokens | 最新の GPT、オールラウンドに優秀 |
| `gpt-4.1-mini` | 128K tokens | 高速、コスト効率が良い |
| `o4-mini` | 200K tokens | 推論モデル |

### Anthropic

| モデル | コンテキストウィンドウ | 強み |
|---|---|---|
| `claude-sonnet-4-5-20250929` | 200K tokens | コーディングと分析に優秀 |
| `claude-opus-4-6` | 200K tokens | Anthropic で最も高性能なモデル |

### DeepSeek

| モデル | コンテキストウィンドウ | 強み |
|---|---|---|
| `deepseek-chat` | 64K tokens | コスト効率が良く、多言語に強い |
| `deepseek-reasoner` | 64K tokens | 推論に特化 |

---

## オープンウェイトモデル（Ollama 経由）

これらをローカルで実行すれば、トークンコストは $0 です。

| モデル | パラメータ数 | 強み |
|---|---|---|
| `ollama/llama3.1` | 8B / 70B | 汎用的に優秀 |
| `ollama/mistral` | 7B | 高速、効率的 |
| `ollama/codellama` | 34B | コード生成 |
| `ollama/phi3` | 3.8B | 超軽量、高速 |

`OLLAMA_API_BASE` を設定し、`free` ルーティングプロファイルを使用してください。

---

## モデルエイリアス

便利な短縮名:

| エイリアス | 解決先 |
|---|---|
| `flash` | `gemini-2.5-flash` |
| `pro` | `gemini-2.5-pro` |
| `sonnet` | `claude-sonnet-4-5-20250929` |
| `opus` | `claude-opus-4-6` |
| `gpt` | `gpt-5.4` |
| `deepseek` | `deepseek-chat` |

---

## ゲートウェイ経由のカスタムモデル

カスタムゲートウェイ（OpenRouter、Vercel AI Gateway など）を使用している場合、そのゲートウェイで利用可能な任意のモデルを完全なモデル ID で指定できます。

```python
response = client.chat.completions.create(
    model="meta-llama/llama-3.1-405b-instruct",
    messages=messages
)
```

ゲートウェイの設定については [設定](/docs/configuration) をご覧ください。
