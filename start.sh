#!/usr/bin/env bash
# 🛰️ ORBITLY - Single command launcher for Git Bash, macOS, and Linux

set -e

echo "===================================================="
echo "🛰️  ORBITLY — Space Intelligence Platform"
echo "===================================================="

# Check and install dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo "🚀 Starting Python FastAPI Backend on http://localhost:8000 ..."
(cd backend && PYTHONUTF8=1 python main.py) &
BACKEND_PID=$!

# Give backend a moment to initialize CelesTrak catalog
sleep 2

echo "✨ Starting React + Three.js Frontend on http://localhost:5173 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "===================================================="
echo "✅ Both servers are running!"
echo "👉 Open your browser at: http://localhost:5173"
echo "👉 API Swagger Docs at: http://localhost:8000/api/docs"
echo "Press Ctrl+C to shut down both servers."
echo "===================================================="

# Trap Ctrl+C to cleanly kill both background jobs
cleanup() {
  echo ""
  echo "🛑 Stopping ORBITLY..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

wait
