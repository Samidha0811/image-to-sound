import { useState, useRef } from 'react';
import axios from 'axios';
import { FiUploadCloud } from 'react-icons/fi';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAudioUrl(null);
      setError(null);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setAudioUrl(null);
      setError(null);
    } else {
      setError("Please drop a valid image file.");
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setAudioUrl(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/convert', formData, {
        responseType: 'blob', // Important for receiving audio data
      });

      const url = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }));
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data instanceof Blob) {
          // Parse the blob to JSON error message
          const text = await err.response.data.text();
          try {
              const json = JSON.parse(text);
              setError(json.error || "Failed to process image.");
          } catch(e) {
              setError("Failed to process image. Make sure it contains text.");
          }
      } else {
          setError(err.response?.data?.error || "Failed to process image. Make sure it contains text.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-container">
      <h1>Image to Sound</h1>
      
      <div 
        className={`upload-area ${isDragging ? 'drag-active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden-input"
        />
        
        {preview ? (
          <img src={preview} alt="Preview" className="image-preview" />
        ) : (
          <div>
            <FiUploadCloud className="upload-icon" />
            <p className="upload-text">Drag & drop an image here, or click to select</p>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <button 
        className="convert-button" 
        onClick={handleConvert}
        disabled={!file || loading}
      >
        {loading ? <span className="loader"></span> : "Convert to Audio"}
      </button>

      {audioUrl && (
        <div className="audio-container">
          <audio controls src={audioUrl} autoPlay>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}

export default App;
