// GET /api/posts
// List posts with pagination and category filter

import { jsonResponse, errorResponse, handleOptions } from '../../utils/response.js';

export async function onRequest(context) {
    const { request, env } = context;

    // Handle CORS preflight
    const preflight = handleOptions(request);
    if (preflight) return preflight;

    if (request.method !== 'GET') {
        return errorResponse('Method not allowed', 405);
    }

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const category = url.searchParams.get('category');
        const offset = (page - 1) * limit;

        let query = 'SELECT id, slug, title, excerpt, category, tags, cover_image, created_at FROM posts WHERE published = 1';
        let countQuery = 'SELECT COUNT(*) as total FROM posts WHERE published = 1';
        const params = [];
        const countParams = [];

        if (category) {
            query += ' AND category = ?';
            countQuery += ' AND category = ?';
            params.push(category);
            countParams.push(category);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        // Get posts
        const stmt = env.DB.prepare(query);
        const posts = await stmt.bind(...params).all();

        // Get total count
        const countStmt = env.DB.prepare(countQuery);
        const countResult = await countStmt.bind(...countParams).first();

        return jsonResponse({
            posts: posts.results || [],
            pagination: {
                page,
                limit,
                total: countResult?.total || 0,
                totalPages: Math.ceil((countResult?.total || 0) / limit)
            }
        });

    } catch (e) {
        console.error('Get posts error:', e);
        return errorResponse('获取文章列表失败', 500);
    }
}
