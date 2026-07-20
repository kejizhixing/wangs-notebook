// Utility: Password hashing using PBKDF2 with Web Crypto API
// Cloudflare Workers don't support native bcrypt, so we use PBKDF2-SHA256

const encoder = new TextEncoder();

async function generateSalt() {
    const saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    return btoa(String.fromCharCode(...saltBytes));
}

async function hashPassword(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    const saltBuffer = Uint8Array.from(atob(salt), c => c.charCodeAt(0));

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );

    const hashArray = new Uint8Array(derivedBits);
    return btoa(String.fromCharCode(...hashArray));
}

export async function hashPasswordWithSalt(password) {
    const salt = await generateSalt();
    const hash = await hashPassword(password, salt);
    return { hash, salt };
}

export async function verifyPassword(password, salt, expectedHash) {
    const hash = await hashPassword(password, salt);
    // Constant-time comparison
    if (hash.length !== expectedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < hash.length; i++) {
        diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    return diff === 0;
}
