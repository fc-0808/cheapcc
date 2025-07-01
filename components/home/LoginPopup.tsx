"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface LoginPopupProps {
  show: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
  onContinueAsGuest: () => void;
}

export default function LoginPopup({ show, onClose, onRegisterClick, onContinueAsGuest }: LoginPopupProps) {
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{top: number, left: number, size: number, delay: number}>>([]);
  
  // Generate particles for background effect
  useEffect(() => {
    if (show) {
      setParticles(
        Array.from({ length: 20 }).map(() => ({
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 4 + 1,
          delay: Math.random() * 2,
        }))
      );
    }
  }, [show]);

  // Animation variants
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: [0.215, 0.61, 0.355, 1],
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: [0.215, 0.61, 0.355, 1],
      }
    }
  };
  
  const modalVariants: Variants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.1,
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      y: 10,
      transition: { 
        duration: 0.2,
        ease: [0.215, 0.61, 0.355, 1],
      }
    }
  };

  const iconVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.3,
      }
    }
  };
  
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.4 + (custom * 0.1),
      }
    })
  };
  
  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.6 + (custom * 0.1),
      }
    }),
    hover: (custom: number) => ({ 
      scale: 1.05, 
      y: -3, 
      boxShadow: custom === 0 
        ? '0 10px 30px rgba(239, 68, 68, 0.35)' 
        : '0 10px 30px rgba(0, 0, 0, 0.1)',
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 15,
      }
    }),
    tap: { 
      scale: 0.98,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 25,
      }
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 sm:p-0"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle, index) => (
              <motion.div
                key={index}
                className="absolute rounded-full bg-white opacity-40"
                style={{
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  top: `${particle.top}%`,
                  left: `${particle.left}%`,
                  boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.5)`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [0.8, 1.2, 0.8],
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          
          {/* Glowing overlay effect */}
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.2),_transparent_70%)] pointer-events-none"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Modal card */}
          <motion.div 
            className="bg-gradient-to-b from-[#1e1e3f]/90 to-[#0f172a]/90 rounded-xl shadow-2xl p-6 w-full max-w-sm mx-auto border border-[#ff3366]/20 backdrop-blur-lg relative z-10 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow effect */}
            <motion.div 
              className="absolute -inset-40 bg-[radial-gradient(circle_at_center,rgba(255,51,102,0.1),transparent_70%)] z-0 pointer-events-none"
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.2, 0.4, 0.2],
                rotate: [0, 15, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            
            <div className="relative z-10">
              {/* Icon with animation */}
              <motion.div 
                className="text-center mb-5"
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 text-white shadow-lg relative">
                  {/* Orbital ring animation */}
                  <motion.div 
                    className="absolute -inset-1 opacity-0 pointer-events-none"
                    animate={{ 
                      opacity: [0, 0.8, 0],
                      rotate: [0, 360],
                      scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{ 
                      duration: 12, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <svg width="100" height="100" viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <defs>
                        <linearGradient id="orbital-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff3366" stopOpacity="0.6" />
                          <stop offset="50%" stopColor="#ff66a3" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#ff3366" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <ellipse cx="50" cy="50" rx="40" ry="20" fill="none" stroke="url(#orbital-gradient)" strokeWidth="1" />
                    </svg>
                  </motion.div>
                  
                  <i className="fas fa-user text-3xl"></i>
                  
                  {/* Animated particles around icon */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-white opacity-70"
                      style={{
                        top: `${50 + Math.sin(i * Math.PI * 2 / 3) * 30}%`,
                        left: `${50 + Math.cos(i * Math.PI * 2 / 3) * 30}%`,
                      }}
                      animate={{
                        scale: [0.5, 1.5, 0.5],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 2 + i,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
              
              {/* Title with animation */}
              <motion.h3 
                className="text-2xl font-bold text-white mb-3 text-center"
                custom={0}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                style={{ textShadow: '0 2px 10px rgba(255,51,102,0.3)' }}
              >
                Create an Account?
              </motion.h3>
              
              {/* Description with animation */}
              <motion.p 
                className="text-white/70 mb-6 text-center"
                custom={1}
                variants={textVariants}
                initial="hidden"
                animate="visible"
              >
                Creating an account lets you track your orders and save your information for faster checkout.
              </motion.p>
              
              {/* Buttons with animations */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-center">
                <motion.button
                  onClick={onRegisterClick}
                  className="py-2.5 px-5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white rounded-lg font-medium flex items-center justify-center whitespace-nowrap cursor-pointer shadow-lg shadow-rose-500/20 border border-white/10"
                  custom={0}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <i className="fas fa-user-plus mr-2"></i> Register
                </motion.button>
                <motion.button
                  onClick={onContinueAsGuest}
                  className="py-2.5 px-5 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium flex items-center justify-center whitespace-nowrap cursor-pointer border border-white/20"
                  custom={1}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <i className="fas fa-arrow-right mr-2"></i> Continue as Guest
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 