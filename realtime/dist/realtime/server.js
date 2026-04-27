"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env from the root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const game_1 = __importDefault(require("./sockets/game"));
const PORT = parseInt(process.env.SOCKET_PORT ?? process.env.PORT ?? '4001', 10);
const server = http_1.default.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GRSS Realtime Server is running\n');
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
(0, game_1.default)(io);
server.listen(PORT, () => {
    console.log(`🚀 Dedicated Realtime Server listening on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
});
