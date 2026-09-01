#!/bin/bash
cd /home/z/my-project
while true; do
  PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production NODE_OPTIONS='--max-old-space-size=256' node .next/standalone/server.js 2>&1
  echo "Server crashed, restarting in 2s... $(date)"
  sleep 2
done
