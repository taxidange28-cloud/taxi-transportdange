import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : '';
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 ${clickableClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
