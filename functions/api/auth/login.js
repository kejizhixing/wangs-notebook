// POST /api/auth/login
// User login

import { jsonResponse, errorResponse, handleOptions } from '../../_utils/response.js';
import { verifyPassword } from '../../_utils/password.js';
import { signJWT } from '../../_utils/jwt.js';

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    const preflight = handleOptions(request);
    if (preflight) return preflight;

    if (request.method !== 'POST') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return errorResponse('用户名和密码不能为空');
        }

        // Find user by username or email
        const user = await env.DB.prepare(
            'SELECT id, username, email, password_hash, salt FROM users WHERE username = ? OR email = ?'
        ).bind(username, username).first();

        if (!user) {
            return errorResponse('用户名或密码错误');
        }

        // Verify password
        const valid = await verifyPassword(password, user.salt, user.password_hash);
        if (!valid) {
            return errorResponse('用户名或密码错误');
        }

        // Generate JWT
        const token = await signJWT(
            { userId: user.id, username: user.username },
            env.JWT_SECRET || 'dev-secret-change-me',
            env.JWT_EXPIRES_IN || '7d'
        );

        return jsonResponse({
            message: '登录成功',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (e) {
        console.error('Login error:', e);
        return errorResponse('服务器内部错误', 500);
    }
}
