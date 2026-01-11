import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
/**
 * coreRoutes handles internal agent communication and proxying.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            // Rewrite URL to strip the API prefix before sending to Agent
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            console.error('[CORE] Agent routing error:', error);
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
/**
 * userRoutes handles the public facing REST API for session management.
 */
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    /**
     * List all available chat sessions
     */
    app.get('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        const sessions = await controller.listSessions();
        return c.json({ success: true, data: sessions });
    });
    /**
     * Create or register a new chat session
     */
    app.post('/api/sessions', async (c) => {
        const { title, sessionId: providedSessionId, firstMessage } = await c.req.json().catch(() => ({}));
        const sessionId = providedSessionId || crypto.randomUUID();
        let sessionTitle = title;
        if (!sessionTitle) {
            const now = new Date().toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            if (firstMessage?.trim()) {
                const clean = firstMessage.trim().replace(/\s+/g, ' ');
                sessionTitle = clean.length > 30 ? clean.slice(0, 27) + '...' : clean;
                sessionTitle += ` • ${now}`;
            } else {
                sessionTitle = `New Sketch • ${now}`;
            }
        }
        await registerSession(c.env, sessionId, sessionTitle);
        return c.json({ success: true, data: { sessionId, title: sessionTitle } });
    });
    /**
     * Delete a chat session
     */
    app.delete('/api/sessions/:sessionId', async (c) => {
        const sessionId = c.req.param('sessionId');
        const deleted = await unregisterSession(c.env, sessionId);
        return c.json({ success: !!deleted, data: { deleted } });
    });
    /**
     * Get basic session stats
     */
    app.get('/api/sessions/stats', async (c) => {
        const controller = getAppController(c.env);
        const count = await controller.getSessionCount();
        return c.json({ success: true, data: { totalSessions: count } });
    });
}