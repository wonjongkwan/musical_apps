import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

function mockLoginApi() {
  return {
    name: 'mock-login-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/login' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            try {
              const { email } = JSON.parse(body);
              if (email) {
                const dbPath = path.resolve(process.cwd(), 'users.json');
                let users = [];
                if (fs.existsSync(dbPath)) users = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                if (!users.some(u => u.email === email)) {
                  users.push({ email, name: email.split('@')[0], avatar: '😎', xp: 0, joinedAt: new Date().toISOString() });
                  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
                }
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, email }));
              } else {
                res.statusCode = 400; res.end(JSON.stringify({ error: 'Email required' }));
              }
            } catch(e) { res.statusCode = 500; res.end('Server error'); }
          });
          return;
        }

        if (req.url === '/api/profile' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            try {
              const { email, name, avatar, xp, streak } = JSON.parse(body);
              const dbPath = path.resolve(process.cwd(), 'users.json');
              let users = [];
              if (fs.existsSync(dbPath)) users = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
              
              let userIndex = users.findIndex(u => u.email === email);
              if (userIndex !== -1) {
                if (name) users[userIndex].name = name;
                if (avatar) users[userIndex].avatar = avatar;
                if (xp !== undefined) users[userIndex].xp = xp;
                if (streak !== undefined) users[userIndex].streak = streak;
              } else {
                users.push({ email, name: name || email.split('@')[0], avatar: avatar || '😎', xp: xp || 0, streak: streak || 1 });
              }
              fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch(e) { res.statusCode = 500; res.end('Server error'); }
          });
          return;
        }

        if (req.url === '/api/leaderboard' && req.method === 'GET') {
          try {
            const dbPath = path.resolve(process.cwd(), 'users.json');
            let users = [];
            if (fs.existsSync(dbPath)) users = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(users));
          } catch(e) { res.statusCode = 500; res.end('Server error'); }
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mockLoginApi()],
})
