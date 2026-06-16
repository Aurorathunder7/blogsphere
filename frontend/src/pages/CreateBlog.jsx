import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { localStorageAPI } from '../services/localStorageService';
import { FiImage, FiGlobe, FiLock, FiUpload, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

function CreateBlog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isPublic: true
  });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload using localStorage service
      const result = await localStorageAPI.uploadImage(file);
      
      if (result && result.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: result.imageUrl }));
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Upload failed - no image URL returned');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Error uploading image');
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Please enter blog content');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a blog');
      return;
    }

    setLoading(true);

    try {
      // Create the blog using localStorage API
      const newBlog = await localStorageAPI.createBlog(
        {
          title: formData.title.trim(),
          content: formData.content.trim(),
          imageUrl: formData.imageUrl || '',
          isPublic: formData.isPublic
        },
        user.id,
        user.username
      );

      if (newBlog) {
        toast.success('Blog created successfully! 🎉');
        navigate('/dashboard');
      } else {
        throw new Error('Blog creation failed - no blog data returned');
      }
    } catch (err) {
      console.error('Create blog error:', err);
      toast.error(err.message || 'Error creating blog. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 max-w-3xl"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h1 className="text-3xl font-display font-bold text-white">Create New Blog</h1>
          <p className="text-blue-100 mt-2">Share your story with the world</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Blog Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter an eye-catching title..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              <FiImage className="inline mr-2" />
              Featured Image
            </label>
            
            {/* Image Preview */}
            {(previewImage || formData.imageUrl) && (
              <div className="relative mb-4">
                <img 
                  src={previewImage || formData.imageUrl} 
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
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiUpload className="w-5 h-5" />
                    <span>Upload Image</span>
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Max size: 5MB (JPG, PNG, GIF, WebP)</p>
            </div>
            
            {/* OR divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You can either upload an image or provide a URL
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="12"
              placeholder="Write your amazing story here..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
            />
          </div>
          
          {/* Privacy Toggle */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {formData.isPublic ? (
                  <FiGlobe className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <FiLock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                )}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {formData.isPublic ? 'Public Blog' : 'Private Blog'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
                  <span>Publishing...</span>
                </div>
              ) : (
                'Publish Blog 🚀'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default CreateBlog;