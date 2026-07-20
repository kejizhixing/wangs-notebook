// POST /api/auth/register
// Register a new user

import { jsonResponse, errorResponse, handleOptions, validateEmail, validateUsername } from '../../_utils/response.js';
import { hashPasswordWithSalt } from '../../_utils/password.js';
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
        const { username, email, password } = body;

        // Validation
        if (!username || !email || !password) {
            return errorResponse('用户名、邮箱和密码不能为空');
        }

        if (!validateUsername(username)) {
            return errorResponse('用户名只能包含字母、数字和下划线，长度 3-20 位');
        }

        if (!validateEmail(email)) {
            return errorResponse('邮箱格式不正确');
        }

        if (password.length < 6) {
            return errorResponse('密码至少 6 位');
        }

        // Check if user already exists
        const existingUser = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ? OR email = ?'
        ).bind(username, email).first();

        if (existingUser) {
            return errorResponse('用户名或邮箱已被注册');
        }

        // Hash password
        const { hash, salt } = await hashPasswordWithSalt(password);

        // Create user
        const result = await env.DB.prepare(
            'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)'
        ).bind(username, email, hash, salt).run();

        if (!result.success) {
            return errorResponse('注册失败，请稍后重试', 500);
        }

        const userId = result.meta.last_row_id;

        // Generate JWT
        const token = await signJWT(
            { userId, username },
            env.JWT_SECRET || 'dev-secret-change-me',
            env.JWT_EXPIRES_IN || '7d'
        );

        return jsonResponse({
            message: '注册成功',
            token,
            user: { id: userId, username, email }
        }, 201);

    } catch (e) {
        console.error('Register error:', e);
        return errorResponse('服务器内部错误', 500);
    }
}
