#!/usr/bin/env python3
"""
Adafruit IO Feed Creator

This script automatically creates all required feeds for the
ESP32 Smart Irrigation System.

Usage:
    python create_adafruit_feeds.py YOUR_USERNAME YOUR_AIO_KEY
"""

import sys
import json
import time
import urllib.request
import urllib.error

# Feed definitions (matching official Adafruit IO configuration)
FEEDS = [
    {'key': 'pump', 'name': 'Pump Control', 'description': 'Command to turn pump ON/OFF (0 or 1)'},
    {'key': 'soil-moisture', 'name': 'Soil Moisture', 'description': 'Soil moisture percentage (0-100%)'},
    {'key': 'temperature', 'name': 'Temperature', 'description': 'Ambient temperature in Celsius'},
    {'key': 'humidity', 'name': 'Humidity', 'description': 'Relative humidity percentage (0-100%)'},
    {'key': 'tds', 'name': 'TDS', 'description': 'Total Dissolved Solids - fertilizer concentration (ppm)'},
    {'key': 'water-flow', 'name': 'Water Flow', 'description': 'Water flow rate (L/min)'},
    {'key': 'water-volume', 'name': 'Water Volume', 'description': 'Total water dispensed (liters)'},
    {'key': 'dry-run-alert', 'name': 'Dry Run Alert', 'description': 'Dry run detection alert (0 or 1)'}
]

def create_feed(username, aio_key, feed):
    """Create a single feed in Adafruit IO"""
    url = f'https://io.adafruit.com/api/v2/{username}/feeds'
    
    data = json.dumps({
        'feed': {
            'key': feed['key'],
            'name': feed['name'],
            'description': feed['description']
        }
    }).encode('utf-8')
    
    headers = {
        'X-AIO-Key': aio_key,
        'Content-Type': 'application/json'
    }
    
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 201:
                print(f"✅ Created: {feed['key']}")
                return {'success': True, 'feed': feed['key']}
    except urllib.error.HTTPError as e:
        if e.code == 422:
            # Feed already exists
            print(f"⚠️  Already exists: {feed['key']}")
            return {'success': True, 'feed': feed['key'], 'existed': True}
        else:
            error_body = e.read().decode('utf-8')
            print(f"❌ Failed: {feed['key']} (Status: {e.code})")
            print(f"   Response: {error_body}")
            return {'success': False, 'feed': feed['key'], 'error': error_body}
    except Exception as e:
        print(f"❌ Error creating {feed['key']}: {str(e)}")
        return {'success': False, 'feed': feed['key'], 'error': str(e)}

def main():
    if len(sys.argv) != 3:
        print('❌ Usage: python create_adafruit_feeds.py YOUR_USERNAME YOUR_AIO_KEY')
        print('')
        print('Example:')
        print('  python create_adafruit_feeds.py Abhijith2002 aio_xxxxxxxxxxxx')
        print('')
        print('Get your AIO Key from: https://io.adafruit.com/')
        sys.exit(1)
    
    username = sys.argv[1]
    aio_key = sys.argv[2]
    
    print('╔════════════════════════════════════════════════════════╗')
    print('║   Adafruit IO Feed Creator                            ║')
    print('╚════════════════════════════════════════════════════════╝')
    print('')
    print(f'Username: {username}')
    print(f'Creating {len(FEEDS)} feeds...')
    print('')
    
    results = []
    
    for feed in FEEDS:
        result = create_feed(username, aio_key, feed)
        results.append(result)
        # Small delay to avoid rate limiting
        time.sleep(0.5)
    
    print('')
    print('╔════════════════════════════════════════════════════════╗')
    print('║   Summary                                             ║')
    print('╚════════════════════════════════════════════════════════╝')
    print('')
    
    created = sum(1 for r in results if r['success'] and not r.get('existed'))
    existed = sum(1 for r in results if r.get('existed'))
    failed = sum(1 for r in results if not r['success'])
    
    print(f'✅ Created: {created}')
    print(f'⚠️  Already existed: {existed}')
    print(f'❌ Failed: {failed}')
    print('')
    
    if failed == 0:
        print('🎉 All feeds are ready!')
        print('')
        print('Next steps:')
        print('1. Update ESP32 firmware with your credentials')
        print('2. Update frontend .env file')
        print('3. Upload ESP32 firmware')
        print('4. Start dashboard: npm run dev')
    else:
        print('⚠️  Some feeds failed to create. Check errors above.')
        print('You may need to create them manually at: https://io.adafruit.com/feeds')

if __name__ == '__main__':
    main()
