"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbStatus = getDbStatus;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grss';
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
let isConnected = false;
async function dbConnect() {
    if (cached.conn && mongoose_1.default.connection.readyState === 1) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        };
        cached.promise = mongoose_1.default.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            console.log('✅ Connected to MongoDB (Next.js Global)');
            isConnected = true;
            return mongooseInstance;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (e) {
        // Reset cache so the next request attempts a fresh connection
        cached.promise = null;
        cached.conn = null;
        isConnected = false;
        console.warn('⚠️ MongoDB connection failed:', e.message);
        throw e; // Re-throw so API routes return a proper 500
    }
    return cached.conn;
}
function getDbStatus() {
    return isConnected;
}
exports.default = dbConnect;
