#!/bin/bash

# Check Adafruit IO Feeds
# Usage: ./check_feeds.sh YOUR_USERNAME YOUR_AIO_KEY

if [ $# -ne 2 ]; then
    echo "❌ Usage: ./check_feeds.sh YOUR_USERNAME YOUR_AIO_KEY"
    echo ""
    echo "Example:"
    echo "  ./check_feeds.sh Abhijith2002 aio_xxxxxxxxxxxx"
    exit 1
fi

USERNAME=$1
AIO_KEY=$2

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Checking Adafruit IO Feeds                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Username: $USERNAME"
echo ""

FEEDS=(
    "pump-control"
    "pump-status"
    "soil-moisture"
    "temperature"
    "humidity"
    "tds"
    "flow-rate"
    "water-volume"
    "dry-run-alert"
    "soil-warning"
)

MISSING=0
EXISTS=0

for feed in "${FEEDS[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "X-AIO-Key: $AIO_KEY" \
        "https://io.adafruit.com/api/v2/$USERNAME/feeds/$feed")
    
    if [ "$response" = "200" ]; then
        echo "✅ $feed"
        ((EXISTS++))
    else
        echo "❌ $feed (missing)"
        ((MISSING++))
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Summary                                             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Exists: $EXISTS"
echo "❌ Missing: $MISSING"
echo ""

if [ $MISSING -eq 0 ]; then
    echo "🎉 All feeds exist!"
else
    echo "⚠️  You need to create $MISSING missing feed(s)"
    echo ""
    echo "Options:"
    echo "1. Run: python create_adafruit_feeds.py $USERNAME $AIO_KEY"
    echo "2. Create manually at: https://io.adafruit.com/feeds"
fi
