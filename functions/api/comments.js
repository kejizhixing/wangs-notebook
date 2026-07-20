// GET /api/comments?post_id=X  - list comments for a post
// POST /api/comments            - create a comment (requires auth)

import { jsonResponse, errorResponse, handleOptions } from '../../_utils/response.js';
import { verifyJWT, getTokenFromRequest } from '../../_utils/jwt.js';

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    const preflight = handleOptions(request);
    if (preflight) return preflight;

    if (request.method === 'GET') {
        return getComments(context);
    } else if (request.method === 'POST') {
        return createComment(context);
    } else {
        return errorResponse('Method not allowed', 405);
    }
}

async function getComments({ request, env }) {
    try {
        const url = new URL(request.url);
        const postId = url.searchParams.get('post_id');

        if (!postId) {
            return errorResponse('缺少 post_id 参数');
        }

        const comments = await env.DB.prepare(`
            SELECT c.id, c.content, c.parent_id, c.created_at,
                   u.id as user_id, u.username
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC
        `).bind(postId).all();

        return jsonResponse({ comments: comments.results || [] });

    } catch (e) {
        console.error('Get comments error:', e);
        return errorResponse('获取评论失败', 500);
    }
}

async function createComment({ request, env }) {
    try {
        // Auth check
        const token = getTokenFromRequest(request);
        if (!token) {
            return errorResponse('请先登录', 401);
        }

        const payload = await verifyJWT(token, env.JWT_SECRET || 'dev-secret-change-me');
        if (!payload) {
            return errorResponse('登录已过期，请重新登录', 401);
        }

        const body = await request.json();
        const { post_id, content, parent_id } = body;

        if (!post_id || !content) {
            return errorResponse('文章 ID 和评论内容不能为空');
        }

        if (content.trim().length === 0) {
            return errorResponse('评论内容不能为空');
        }

        if (content.length > 1000) {
            return errorResponse('评论内容不能超过 1000 字');
        }

        // Check if post exists
        const post = await env.DB.prepare('SELECT id FROM posts WHERE id = ?').bind(post_id).first();
        if (!post) {
            return errorResponse('文章不存在', 404);
        }

        const result = await env.DB.prepare(`
            INSERT INTO comments (post_id, user_id, content, parent_id)
            VALUES (?, ?, ?, ?)
        `).bind(post_id, payload.userId, content.trim(), parent_id || 0).run();

        if (!result.success) {
            return errorResponse('评论发布失败', 500);
        }

        const commentId = result.meta.last_row_id;

        return jsonResponse({
            message: '评论发布成功',
            comment: {
                id: commentId,
                content: content.trim(),
                parent_id: parent_id || 0,
                user_id: payload.userId,
                username: payload.username,
                created_at: new Date().toISOString()
            }
        }, 201);

    } catch (e) {
        console.error('Create comment error:', e);
        return errorResponse('评论发布失败', 500);
    }
}
