// Utility: JWT (JSON Web Token) implementation using Web Crypto API
// Suitable for Cloudflare Workers / Pages Functions environment

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(data) {
    let base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function getKey(secret) {
    const keyData = encoder.encode(secret);
    return crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

export async function signJWT(payload, secret, expiresIn = '7d') {
    const header = { alg: 'HS256', typ: 'JWT' };

    // Calculate expiration
    const now = Math.floor(Date.now() / 1000);
    let exp = now;
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
        const num = parseInt(match[1]);
        const unit = match[2];
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
        exp = now + num * (multipliers[unit] || 86400);
    } else {
        exp = now + 7 * 86400; // default 7 days
    }

    const tokenPayload = { ...payload, iat: now, exp };

    const headerEncoded = base64UrlEncode(encoder.encode(JSON.stringify(header)));
    const payloadEncoded = base64UrlEncode(encoder.encode(JSON.stringify(tokenPayload)));

    const dataToSign = `${headerEncoded}.${payloadEncoded}`;
    const key = await getKey(secret);
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
    const signatureEncoded = base64UrlEncode(signature);

    return `${dataToSign}.${signatureEncoded}`;
}

export async function verifyJWT(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
        const dataToSign = `${headerEncoded}.${payloadEncoded}`;

        const key = await getKey(secret);
        const signatureValid = await crypto.subtle.verify(
            'HMAC',
            key,
            base64UrlDecode(signatureEncoded),
            encoder.encode(dataToSign)
        );

        if (!signatureValid) return null;

        const payload = JSON.parse(decoder.decode(base64UrlDecode(payloadEncoded)));
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < now) {
            return null; // expired
        }

        return payload;
    } catch (e) {
        return null;
    }
}

export function getTokenFromRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    // Also check cookie
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
        const match = cookieHeader.match(/token=([^;]+)/);
        if (match) return match[1];
    }
    return null;
}
