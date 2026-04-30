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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
    score: { type: Number, default: 0, min: 0 },
    lastActive: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false },
    streak: { type: Number, default: 0 },
    faction: { type: String, enum: ['team_sentinel', 'team_landsat', 'team_modis'] },
    // Progress Persistence
    unlocked: { type: [Number], default: [1] },
    completed: { type: [Number], default: [] },
    scores: { type: Map, of: Number, default: {} },
    powerups: {
        type: {
            hint: { type: Number, default: 2 },
            skip: { type: Number, default: 1 },
            freeze: { type: Number, default: 1 }
        },
        default: { hint: 2, skip: 1, freeze: 1 }
    },
    telemetry: { type: [mongoose_1.Schema.Types.Mixed], default: [] },
    levelState: {
        type: {
            l1idx: { type: Number, default: 0 }, l1score: { type: Number, default: 0 }, l1correct: { type: Number, default: 0 },
            l2idx: { type: Number, default: 0 }, l2score: { type: Number, default: 0 }, l2correct: { type: Number, default: 0 },
            l3idx: { type: Number, default: 0 }, l3score: { type: Number, default: 0 }, l3correct: { type: Number, default: 0 },
            l3guessed: { type: [String], default: [] }, l3lives: { type: Number, default: 6 }, l3hintGiven: { type: Boolean, default: false },
            l4idx: { type: Number, default: 0 }, l4score: { type: Number, default: 0 }, l4correct: { type: Number, default: 0 },
            budget: { type: Number, default: 10000 }, bought: { type: [String], default: [] }, priceMulti: { type: Number, default: 1.0 },
            auctScore: { type: Number, default: 0 }, disasterId: { type: String, default: null }, applied: { type: [String], default: [] },
            disasterScore: { type: Number, default: 0 }
        },
        default: {
            l1idx: 0, l1score: 0, l1correct: 0,
            l2idx: 0, l2score: 0, l2correct: 0,
            l3idx: 0, l3score: 0, l3correct: 0, l3guessed: [], l3lives: 6, l3hintGiven: false,
            l4idx: 0, l4score: 0, l4correct: 0,
            budget: 10000, bought: [], priceMulti: 1.0, auctScore: 0,
            disasterId: null, applied: [], disasterScore: 0
        }
    }
});
// Create model safely to avoid overwrite errors during hot-reloads
exports.User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
