# クイックスタート

UniRo を 2 分以内にセットアップして使い始めましょう。

---

## 1. API キーを取得する

[uniro.vn](https://uniro.vn) でサインアップし、ダッシュボードから API キーを取得してください。キーは `uniro-key-xxx` のような形式です。

## 2. お好みの SDK をインストールする

UniRo は OpenAI 互換のため、任意の OpenAI SDK を使用できます。

**Python:**

```bash
pip install openai
```

**TypeScript / Node.js:**

```bash
npm install openai
```

## 3. 最初のリクエストを送信する

**Python:**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.uniro.vn/v1",
    api_key="your-uniro-key"
)

response = client.chat.completions.create(
    model="auto",  # UniRo が最適なモデルを選択します
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

## 4. ルーティングプロファイルを選択する

`"auto"` の代わりに、以下のルーティングプロファイルを使用できます。

| プロファイル | 動作 |
|---|---|
| `auto` | スマートルーティング — 複雑さ、コスト、言語に応じて最適なモデルを選択 |
| `eco` | コスト最適化 — 品質基準を満たす最も安価なモデルを使用 |
| `premium` | 常に最高性能のモデルを使用 |
| `reasoning` | 推論モデル（chain-of-thought）を使用 |

または、モデルを直接指定してルーティングをバイパスすることもできます: `"gpt-5.4"`、`"gemini-2.5-pro"`、`"claude-opus-4.6"`。

## 5. ストリーミングを有効にする

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

以上です！UniRo がルーティング、プロバイダー選択、フォールバックを自動的に処理します。全エンドポイントの詳細については [API リファレンス](/docs/api-reference) をご覧ください。
