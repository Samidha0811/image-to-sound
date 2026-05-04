import os
import tempfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from app import image_to_sound

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from the React frontend

@app.route("/api/convert", methods=["POST"])
def convert_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        # Save uploaded file to a temporary location
        temp_dir = tempfile.gettempdir()
        temp_image_path = os.path.join(temp_dir, file.filename)
        file.save(temp_image_path)
        
        # Process the image to sound
        output_audio_path = image_to_sound(temp_image_path)
        
        # Return the generated audio file
        return send_file(output_audio_path, mimetype="audio/mpeg", as_attachment=False)
        
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "An error occurred during processing."}), 500
    finally:
        # Clean up the temporary image file
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
