#!/bin/bash
# Test sending an email through MailOS API

curl -X POST http://localhost:4000/send \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$(cat /home/ziondefi/Desktop/mailos/.session 2>/dev/null || echo 'test-session')" \
  -d '{
    "mailboxId": "af3286e8-b09c-4e5e-8da3-652c06b21f1c",
    "to": "zionmatrixhq@gmail.com",
    "subject": "Test - SMTP Fixed",
    "body": "This is a test email to confirm SMTP is working after port fix (465)."
  }'
echo ""
