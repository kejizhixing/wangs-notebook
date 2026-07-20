// GET /api/resources
// List all shared resources

import { jsonResponse, errorResponse, handleOptions } from '../../_utils/response.js';

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
        const category = url.searchParams.get('category');

        let query = 'SELECT id, title, description, url, category, file_size, password, created_at FROM resources';
        const params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY created_at DESC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return jsonResponse({
            resources: result.results || []
        });

    } catch (e) {
        console.error('Get resources error:', e);
        return errorResponse('获取资源列表失败', 500);
    }
}
