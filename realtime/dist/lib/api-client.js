"use strict";
// ============================================
// GRSS FIELD ANALYST — Centralized API Client
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiError = void 0;
exports.checkBackendHealth = checkBackendHealth;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
async function request(path, options = {}) {
    const { retries = 1, ...fetchOptions } = options;
    const url = `${BASE_URL}${path}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    let lastError = new Error('Request failed');
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, {
                ...fetchOptions,
                headers: { ...defaultHeaders, ...fetchOptions.headers },
                credentials: 'include', // include cookies for HTTP-only JWT
            });
            if (!res.ok) {
                const body = await res.text();
                throw new ApiError(res.status, body || res.statusText);
            }
            // Handle empty responses (204 No Content)
            const text = await res.text();
            return (text ? JSON.parse(text) : {});
        }
        catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < retries) {
                // Exponential back-off: 400ms, 800ms
                await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
            }
        }
    }
    throw lastError;
}
exports.apiClient = {
    get: (path, options) => request(path, { method: 'GET', ...options }),
    post: (path, body, options) => request(path, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
    }),
};
// Health check convenience method
async function checkBackendHealth() {
    try {
        await exports.apiClient.get('/api');
        return true;
    }
    catch {
        return false;
    }
}
