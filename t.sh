#!/bin/zsh
echo "Killing existing processes on ports 3000 and 8080..."
lsof -ti:3000,8080 | xargs kill -9 2>/dev/null || true

echo "Starting backend server..."
cd /Users/omarmaarouf/final_terrawize/TERRAWIZE/expertosy_web/backend
python app.py &

echo "Starting frontend server..."
cd /Users/omarmaarouf/final_terrawize/TERRAWIZE/expertosy_web/frontend/expertosy-web
npm start &
