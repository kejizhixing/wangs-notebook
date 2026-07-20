// GET /api/posts/:slug
// Get single post by slug

import { jsonResponse, errorResponse, handleOptions } from '../../../_utils/response.js';

export async function onRequest(context) {
    const { request, env, params } = context;

    // Handle CORS preflight
    const preflight = handleOptions(request);
    if (preflight) return preflight;

    if (request.method !== 'GET') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        const slug = params.slug;

        if (!slug) {
            return errorResponse('文章标识不能为空');
        }

        const post = await env.DB.prepare(
            'SELECT id, slug, title, excerpt, content, category, tags, cover_image, created_at, updated_at FROM posts WHERE slug = ? AND published = 1'
        ).bind(slug).first();

        if (!post) {
            return errorResponse('文章不存在', 404);
        }

        return jsonResponse({ post });

    } catch (e) {
        console.error('Get post error:', e);
        return errorResponse('获取文章失败', 500);
    }
}
