import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiGlobe, FiLock, FiUpload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setFormData({
          title: res.data.title,
          content: res.data.content,
          imageUrl: res.data.imageUrl || '',
          isPublic: res.data.isPublic
        });
        if (res.data.imageUrl) {
          setPreviewImage(res.data.imageUrl);
        }
      } catch (err) {
        toast.error('Error fetching blog');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchBlog();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });
      
      setFormData({ ...formData, imageUrl: res.data.imageUrl });
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error uploading image');
      setPreviewImage(formData.imageUrl);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/blogs/${id}`, formData, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Blog updated successfully! ✏️');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error updating blog');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 max-w-3xl"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
          <h1 className="text-3xl font-display font-bold text-white">Edit Blog</h1>
          <p className="text-green-100 mt-2">Update your story</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Blog Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter an eye-catching title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              <FiImage className="inline mr-2" />
              Featured Image
            </label>
            
            {/* Image Preview */}
            {previewImage && (
              <div className="relative mb-4">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all duration-200"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Upload Button */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="w-5 h-5" />
                    <span>{previewImage ? 'Change Image' : 'Upload Image'}</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500">Max size: 5MB (JPG, PNG, GIF, WebP)</p>
            </div>
            
            {/* OR divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
            
            {/* Image URL input (alternative) */}
            <div>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Or paste image URL here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <p className="text-sm text-gray-500 mt-1">You can either upload an image or provide a URL</p>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="12"
              placeholder="Write your amazing story here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
            />
          </div>
          
          {/* Privacy Toggle */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {formData.isPublic ? (
                  <FiGlobe className="w-6 h-6 text-green-600" />
                ) : (
                  <FiLock className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">
                    {formData.isPublic ? 'Public Blog' : 'Private Blog'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.isPublic 
                      ? 'Anyone can read and discover your blog' 
                      : 'Only you can see this blog'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Blog ✏️'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default EditBlog;