from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# In-memory storage for the latest telemetry
latest_sensor_data = {}

@app.route('/api/iot/sensor-data', methods=['POST'])
def receive_telemetry():
    global latest_sensor_data
    try:
        data = request.get_json()
        if data:
            # Add timestamp if not provided by ESP32
            if 'timestamp' not in data:
                data['timestamp'] = int(time.time() * 1000)
                
            latest_sensor_data = data
            print(f"Received telemetry: {data}")
            return jsonify({"status": "ok"}), 200
        else:
             return jsonify({"error": "Invalid JSON"}), 400
    except Exception as e:
        print(f"Error receiving telemetry: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/iot/latest', methods=['GET'])
def get_latest_telemetry():
    return jsonify(latest_sensor_data), 200

if __name__ == '__main__':
    print("Starting ESP32 IoT Backend Server on port 5000...")
    app.run(host='0.0.0.0', port=5000)
