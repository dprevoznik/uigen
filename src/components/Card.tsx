import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  title = "Welcome to Our Service", 
  description = "Discover amazing features and capabilities that will transform your experience.",
  imageUrl,
  actions,
  className,
  variant = 'default',
  size = 'md'
}) => {
  const baseClasses = "bg-white rounded-lg overflow-hidden transition-all duration-200";
  
  const variantClasses = {
    default: "shadow-md hover:shadow-lg",
    outlined: "border border-gray-200 hover:border-gray-300",
    elevated: "shadow-lg hover:shadow-xl"
  };
  
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg"
  };
  
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className={paddingClasses[size]}>
        <h3 className={cn(
          "font-semibold mb-2 text-gray-900",
          size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-gray-600 mb-4 leading-relaxed",
          size === 'sm' ? 'text-sm' : 'text-base'
        )}>
          {description}
        </p>
        {actions && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;