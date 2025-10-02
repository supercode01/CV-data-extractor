#!/bin/bash

echo "Starting Resume Parser MERN Application..."
echo

echo "Installing dependencies..."
npm run install-all

echo
echo "Starting development servers..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo

# Start backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
cd ../frontend && npm start &
FRONTEND_PID=$!

echo
echo "Application is starting up..."
echo "Please wait for both servers to fully load."
echo "Press Ctrl+C to stop both servers"
echo

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
