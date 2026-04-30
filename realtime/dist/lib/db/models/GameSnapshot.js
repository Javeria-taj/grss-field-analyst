"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSnapshot = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const GameSnapshotSchema = new mongoose_1.Schema({
    sessionId: { type: String, default: 'live', unique: true, index: true },
    phase: { type: String, default: 'idle' },
    currentLevel: { type: Number, default: 0 },
    currentQIndex: { type: Number, default: 0 },
    endTime: { type: Number, default: 0 },
    timerTotal: { type: Number, default: 0 },
    paused: { type: Boolean, default: false },
    playerScores: [{ type: mongoose_1.Schema.Types.Mixed }],
    questionBank: [{ type: mongoose_1.Schema.Types.Mixed }],
    levelLimits: { type: mongoose_1.Schema.Types.Mixed },
    auctionStates: [{ type: mongoose_1.Schema.Types.Mixed }],
    updatedAt: { type: Date, default: Date.now },
});
// Only keep ONE snapshot document per game session
GameSnapshotSchema.pre('save', function () {
    this.updatedAt = new Date();
});
exports.GameSnapshot = mongoose_1.default.models.GameSnapshot ||
    mongoose_1.default.model('GameSnapshot', GameSnapshotSchema);
