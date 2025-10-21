import React from 'react';

const ImagePlaceholder = ({ className = "", text = "Loading...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-32 h-32", 
    large: "w-64 h-64",
    full: "w-full h-full"
  };

  return (
    <div className={`${sizeClasses[size]} ${className} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
        <span className="text-xs text-gray-500">{text}</span>
      </div>
    </div>
  );
};

export default ImagePlaceholder;
