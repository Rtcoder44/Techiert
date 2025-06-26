// Lightweight animation utilities to replace framer-motion

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideInFromLeft = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const slideInFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const slideInFromTop = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const slideInFromBottom = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const hoverLift = {
  whileHover: { y: -5 },
  transition: { duration: 0.2, ease: "easeInOut" }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// CSS classes for common animations
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  slideInTop: 'animate-slide-in-top',
  slideInBottom: 'animate-slide-in-bottom',
  scaleIn: 'animate-scale-in',
  hoverLift: 'hover:transform hover:-translate-y-1 transition-transform duration-200',
  staggerItem: 'animate-stagger-item'
};

// Utility function to apply animations with CSS classes
export const applyAnimation = (animation, className = '') => {
  const baseClasses = className;
  const animationClass = animationClasses[animation] || '';
  return `${baseClasses} ${animationClass}`.trim();
};

// Simple motion component replacement
export const Motion = ({ 
  children, 
  initial, 
  animate, 
  exit, 
  transition = { duration: 0.3 },
  className = '',
  ...props 
}) => {
  const style = {
    transform: `translate(${animate?.x || 0}px, ${animate?.y || 0}px) scale(${animate?.scale || 1})`,
    opacity: animate?.opacity ?? 1,
    transition: `all ${transition.duration}s ${transition.ease || 'ease'}`,
    ...props.style
  };

  return (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  );
};

// AnimatePresence replacement
export const AnimatePresence = ({ children, mode = 'wait' }) => {
  return <div className="animate-presence">{children}</div>;
}; 