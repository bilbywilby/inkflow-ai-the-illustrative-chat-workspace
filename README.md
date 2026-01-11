# Cloudflare AI Chat Agent

[cloudflarebutton]

A production-ready full-stack AI chat application built on Cloudflare Workers. Features multi-session conversations, tool calling (web search, weather, MCP tools), streaming responses, and a modern React frontend with shadcn/ui. Powered by Cloudflare Durable Objects and AI Gateway for scalable, stateful AI experiences.

## ✨ Key Features

- **Multi-Session Management**: Persistent chat sessions with titles, timestamps, and activity tracking using Durable Objects.
- **AI-Powered Chat**: Integrated with Cloudflare AI Gateway (Gemini 2.0/2.5 models) via OpenAI-compatible SDK.
- **Tool Calling**: Built-in tools for web search (SerpAPI), weather, and extensible MCP (Model Context Protocol) support.
- **Streaming Responses**: Real-time streaming for natural chat experiences.
- **Modern UI**: Responsive React app with dark mode, Tailwind CSS, shadcn/ui components, and session sidebar.
- **Session APIs**: Create, list, update, delete sessions via REST endpoints.
- **Production-Ready**: Type-safe TypeScript, error handling, CORS, logging, and Cloudflare observability.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide React, TanStack Query, React Router
- **Backend**: Cloudflare Workers, Hono, Durable Objects (Agents SDK), OpenAI SDK
- **AI/ML**: Cloudflare AI Gateway (Gemini models), SerpAPI for search, MCP SDK
- **State**: Immer, Zustand
- **Dev Tools**: Bun, Wrangler, ESLint, TypeScript

## 🚀 Quick Start

1. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd <project>
   bun install
   ```

2. **Configure Environment** (edit `wrangler.jsonc`):
   ```json
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
     "CF_AI_API_KEY": "{your-cloudflare-ai-token}",
     "SERPAPI_KEY": "{optional-serpapi-key}"
   }
   ```

3. **Development**:
   ```bash
   bun dev
   ```
   Open `http://localhost:8787` (or `${PORT:-3000}`).

4. **Deploy**:
   ```bash
   bun deploy
   ```

## 📋 Installation

1. Ensure [Bun](https://bun.sh) is installed (`curl -fsSL https://bun.sh/install | bash`).
2. Run `bun install` to install dependencies.
3. Generate types: `bun run cf-typegen`.
4. Update `wrangler.jsonc` with your Cloudflare AI Gateway credentials:
   - Create a [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) and add Gemini models.
   - Replace `YOUR_ACCOUNT_ID` and `YOUR_GATEWAY_ID`.
   - Get AI token from [Cloudflare Dashboard](https://dash.cloudflare.com).
   - (Optional) Add SerpAPI key for web search.

## 💻 Development

- **Local Dev**: `bun dev` (starts Vite dev server + Worker preview).
- **Type Generation**: `bun run cf-typegen` (updates `worker/env.d.ts`).
- **Build**: `bun build` (produces `dist/` for production).
- **Preview**: `bun preview`.
- **Lint**: `bun lint`.

Hot-reload works for both frontend and Worker code. Edit `src/` for UI, `worker/` for backend logic.

### Customization Points

- **Frontend**: Replace `src/pages/HomePage.tsx` with your app. Use `AppLayout` for sidebar.
- **Chat UI**: Edit `src/lib/chat.ts` for client-side logic.
- **Backend Routes**: Add to `worker/userRoutes.ts` (auto-loaded).
- **AI Logic**: Extend `worker/chat.ts` (system prompt, tools).
- **Tools**: Modify `worker/tools.ts` (add custom tools/MCP servers).
- **Sessions**: Extend `worker/app-controller.ts`.
- **Models**: Update `src/lib/chat.ts` MODELS array.

### API Endpoints

- `GET /api/sessions`: List sessions.
- `POST /api/sessions`: Create session `{ title?, firstMessage? }`.
- `DELETE /api/sessions/:id`: Delete session.
- `PUT /api/sessions/:id/title`: Update title.
- `GET/POST /api/chat/:sessionId/chat`: Send message (supports streaming).
- `GET /api/chat/:sessionId/messages`: Get chat state.
- `DELETE /api/chat/:sessionId/clear`: Clear messages.
- `POST /api/chat/:sessionId/model`: Update model.

## ☁️ Deployment

Deploy to Cloudflare Workers with zero-config:

```bash
bun deploy
```

This builds the frontend, bundles the Worker, and deploys via Wrangler.

[cloudflarebutton]

### Production Tips

- **Custom Domain**: Set in Cloudflare Dashboard > Workers > Triggers.
- **Env Vars**: Use Worker secrets: `wrangler secret put SERPAPI_KEY`.
- **Observability**: Enabled by default (logs, metrics).
- **Migrations**: Auto-handled for Durable Objects.
- **Assets**: SPA routing preserves chat state.

## 🤝 Contributing

1. Fork & clone.
2. `bun install`.
3. Create feature branch.
4. `bun dev` & test.
5. PR to `main`.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- Issues: [GitHub Issues](https://github.com/issues)

Built with ❤️ by Cloudflare Templates.