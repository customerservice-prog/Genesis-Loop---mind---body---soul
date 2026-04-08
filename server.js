require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const orchestrator = require('./src/orchestrator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'Genesis Loop is alive', version: '1.0.0' });
    });

    // Main API endpoint
    app.post('/api/generate', async (req, res) => {
      const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

          const sessionId = require('uuid').v4();
            res.json({ sessionId, message: 'Pipeline started' });

              // Run pipeline async, emit progress via socket
                orchestrator.runPipeline(prompt, sessionId, io).catch(err => {
                    io.to(sessionId).emit('error', { message: err.message });
                      });
                      });

                      // Socket.io
                      io.on('connection', (socket) => {
                        console.log('Client connected:', socket.id);
                          socket.on('join', (sessionId) => {
                              socket.join(sessionId);
                                  console.log(`Socket ${socket.id} joined session ${sessionId}`);
                                    });
                                      socket.on('disconnect', () => {
                                          console.log('Client disconnected:', socket.id);
                                            });
                                            });

                                            const PORT = process.env.PORT || 3000;
                                            server.listen(PORT, () => {
                                              console.log(`Genesis Loop running on port ${PORT}`);
                                              });
