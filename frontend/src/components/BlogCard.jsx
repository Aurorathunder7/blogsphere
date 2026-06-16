import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser } from 'react-icons/fi';

function BlogCard({ blog }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg card-hover">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {blog.imageUrl ? (
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">📝</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Public/Private Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              blog.isPublic 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {blog.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <Link to={`/blog/${blog.id}`}>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              {blog.title}
            </h2>
          </Link>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {blog.content.substring(0, 120)}...
          </p>
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-2">
              <FiUser className="w-4 h-4" />
              <span>{blog.authorName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-4 h-4" />
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Read More Button */}
          <Link to={`/blog/${blog.id}`}>
            <motion.button
              whileHover={{ x: 5 }}
              className="text-blue-600 dark:text-blue-400 font-semibold flex items-center space-x-1 group"
            >
              <span>Read More</span>
              <span className="transform transition-transform group-hover:translate-x-1">→</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default BlogCard;