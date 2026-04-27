# API リファレンス

UniRo は OpenAI 互換の REST API を提供します。すべてのエンドポイントは `/v1/` 配下にあります。

---

## 認証

すべてのリクエストには Bearer トークンが必要です。

```
Authorization: Bearer your-uniro-key
```

サーバーで `UNIRO_API_KEYS` が設定されていない場合、認証は無効になります（オープンアクセス）。

---

## POST /v1/chat/completions

チャット補完を作成します。ストリーミングと非ストリーミングの両方に対応しています。

### リクエストボディ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `model` | string | はい | モデル名またはルーティングプロファイル: `auto`、`eco`、`premium`、`reasoning`、または特定のモデル ID |
| `messages` | array | はい | `role` と `content` を持つメッセージオブジェクトの配列 |
| `stream` | boolean | いいえ | SSE ストリーミングを有効にする（デフォルト: `false`） |
| `temperature` | number | いいえ | サンプリング温度（0-2、デフォルト: モデル依存） |
| `max_tokens` | number | いいえ | レスポンスの最大トークン数 |
| `top_p` | number | いいえ | Nucleus サンプリングパラメータ |
| `stop` | string or array | いいえ | 停止シーケンス |
| `tools` | array | いいえ | ツール/関数の定義（エージェントルーティングをトリガーします） |

### メッセージオブジェクト

```json
{
  "role": "user",
  "content": "Your message here"
}
```

対応するロール: `system`、`user`、`assistant`、`tool`。

### レスポンス（非ストリーミング）

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

### レスポンス（ストリーミング）

`stream: true` の場合、レスポンスは Server-Sent Events 形式で返されます。

```
data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-abc123","object":"chat.completion.chunk","model":"gemini-2.5-flash","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}

data: [DONE]
```

### エラーレスポンス

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

補完を実行せずにプロンプトの複雑さを分類します。

### リクエストボディ

```json
{
  "prompt": "Your prompt text here"
}
```

### レスポンス

```json
{
  "classification": "complex",
  "confidence": 0.82,
  "recommended_model": "gemini-2.5-pro"
}
```

---

## GET /v1/models

利用可能なモデル、エイリアス、ルーティングプロファイルの一覧を取得します。

### レスポンス

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

ヘルスチェックエンドポイント。サーバーの状態を返します。

### レスポンス

```json
{
  "status": "healthy",
  "version": "0.1.0"
}
```

---

## レート制限

| プラン | リクエスト数/分 | リクエスト数/日 |
|---|---|---|
| Free | 20 | 1,000 |
| Pro | 200 | 無制限 |
| Enterprise | カスタム | カスタム |

レート制限ヘッダーはすべてのレスポンスに含まれます。

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
X-RateLimit-Reset: 1710100000
```
