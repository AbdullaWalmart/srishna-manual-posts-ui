import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../api';
import './Upload.css';

export default function Upload() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!image) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) setImage(file);
    else setImage(null);
    setError('');
  };

  const isVideo = image && image.type.startsWith('video/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image or video');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createPost(image, text || undefined, token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h1>Upload post</h1>
        <p className="upload-desc">Add an image or video and optional caption. It will appear in the posts list when active.</p>
        {previewUrl && (
          <div className="upload-preview">
            <p className="upload-preview-label">Preview</p>
            <div className="upload-preview-media-wrap">
              {isVideo ? (
                <video src={previewUrl} controls className="upload-preview-media" />
              ) : (
                <img src={previewUrl} alt="Preview" className="upload-preview-media" />
              )}
            </div>
            {text && <div className="upload-preview-text">{text}</div>}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {error && <div className="upload-error">{error}</div>}
          <label className="upload-label">
            Image or video *
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              required
            />
            {image && <span className="upload-filename">{image.name}</span>}
          </label>
          <label className="upload-label">
            Caption (optional)
            <textarea
              placeholder="Add a caption…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="upload-textarea"
            />
          </label>
          <button type="submit" className="upload-submit" disabled={loading}>
            {loading ? 'Uploading…' : 'Publish post'}
          </button>
        </form>
      </div>
    </div>
  );
}
