'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { triggerHaptic } from '../utils/hapticFeedback';

interface SwipeAction {
  icon: string;
  label: string;
  color: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  rightActions?: SwipeAction[];
  leftActions?: SwipeAction[];
  className?: string;
  onSwipeStateChange?: (isOpen: boolean, direction: 'left' | 'right' | null) => void;
  disabled?: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  rightActions = [],
  leftActions = [],
  className = '',
  onSwipeStateChange,
  disabled = false
}) => {
  // State for tracking the swipe offset and animation
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Refs for tracking touch positions and element dimensions
  const touchStartXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const actionsWidthRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });
  
  // Constants for swipe behavior
  const SWIPE_THRESHOLD = 0.4; // 40% of card width to activate
  const MAX_ACTIONS_REVEALED = 2; // Maximum number of actions to show
  const MIN_ACTION_WIDTH = 80; // Minimum width per action in pixels
  
  // Calculate actions width on mount and resize
  useEffect(() => {
    updateActionsWidth();
    window.addEventListener('resize', updateActionsWidth);
    
    return () => {
      window.removeEventListener('resize', updateActionsWidth);
    };
  }, [leftActions, rightActions]);
  
  const updateActionsWidth = () => {
    if (!cardRef.current) return;
    
    const cardWidth = cardRef.current.offsetWidth;
    
    // Limit how many actions can be shown at once
    const leftWidth = Math.min(leftActions.length, MAX_ACTIONS_REVEALED) * MIN_ACTION_WIDTH;
    const rightWidth = Math.min(rightActions.length, MAX_ACTIONS_REVEALED) * MIN_ACTION_WIDTH;
    
    // Cap at a percentage of card width
    const maxWidth = cardWidth * 0.8;
    actionsWidthRef.current = {
      left: Math.min(leftWidth, maxWidth),
      right: Math.min(rightWidth, maxWidth)
    };
  };
  
  // Handle touch start event
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || (!leftActions.length && !rightActions.length)) return;
    
    touchStartXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };
  
  // Handle touch move event
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - touchStartXRef.current;
    
    // Restrict swiping if no actions in that direction
    if ((diff > 0 && !leftActions.length) || (diff < 0 && !rightActions.length)) {
      setSwipeOffset(0);
      return;
    }
    
    // Add resistance when swiping
    const resistance = 0.5;
    const newOffset = diff * resistance;
    
    // Update offset and direction
    setSwipeOffset(newOffset);
    setSwipeDirection(newOffset > 0 ? 'left' : newOffset < 0 ? 'right' : null);
    
      // Trigger haptic feedback at certain thresholds
  if (cardRef.current) {
    const cardWidth = cardRef.current.offsetWidth;
    const swipePercentage = Math.abs(newOffset) / cardWidth;
    
    // Progressive feedback based on how far the user has swiped
    if (swipePercentage >= SWIPE_THRESHOLD && !isOpen) {
      triggerHaptic('medium');
    } else if (swipePercentage >= SWIPE_THRESHOLD * 0.7 && !isOpen) {
      triggerHaptic('light');
    }
  }
  };
  
  // Handle touch end event
  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const diff = currentXRef.current - touchStartXRef.current;
    let finalOffset = 0;
    let finalIsOpen = false;
    let finalDirection: 'left' | 'right' | null = null;
    
    if (cardRef.current) {
      const cardWidth = cardRef.current.offsetWidth;
      const swipePercentage = Math.abs(diff) / cardWidth;
      
      // If swipe is past threshold, snap to the open position
      if (swipePercentage >= SWIPE_THRESHOLD) {
        if (diff > 0 && leftActions.length > 0) {
          // Swiped right to reveal left actions
          finalOffset = actionsWidthRef.current.left;
          finalIsOpen = true;
          finalDirection = 'left';
          triggerHaptic('success');
        } else if (diff < 0 && rightActions.length > 0) {
          // Swiped left to reveal right actions
          finalOffset = -actionsWidthRef.current.right;
          finalIsOpen = true;
          finalDirection = 'right';
          triggerHaptic('success');
        }
      }
    }
    
    // Reset state
    setSwipeOffset(finalOffset);
    setIsSwiping(false);
    setIsOpen(finalIsOpen);
    setSwipeDirection(finalDirection);
    
    // Notify parent component
    onSwipeStateChange?.(finalIsOpen, finalDirection);
  };
  
  // Function to handle clicking on an action
  const handleActionClick = (action: SwipeAction) => {
    action.onAction();
    resetCard();
    triggerHaptic('light');
  };
  
  // Close the card when clicking outside of actions
  const handleBackdropClick = () => {
    resetCard();
  };
  
  // Reset card to closed state
  const resetCard = () => {
    setSwipeOffset(0);
    setIsOpen(false);
    setSwipeDirection(null);
    onSwipeStateChange?.(false, null);
  };
  
  // We now use the imported triggerHaptic directly
  
  // Detect if we're on a mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    );
  };

  // Only enable swipe functionality on mobile devices
  const isSwipeEnabled = isMobile() && !disabled;
  
  return (
    <div 
      className={`swipeable-card ${isOpen ? 'swipeable-card-swiped' : ''} ${isSwiping ? 'swipeable-card-active' : ''} ${className}`}
      ref={cardRef}
      onClick={isOpen ? handleBackdropClick : undefined}
    >
      {/* Left actions (revealed when swiping right) */}
      {leftActions.length > 0 && (
        <div className="swipe-actions swipe-actions-left">
          {leftActions.slice(0, MAX_ACTIONS_REVEALED).map((action, index) => (
            <div 
              key={`left-${index}`}
              className="swipe-action"
              style={{ backgroundColor: action.color }}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
            >
              <span className="swipe-action-icon">
                <i className={`fas ${action.icon}`}></i>
                <span className="ml-1">{action.label}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Right actions (revealed when swiping left) */}
      {rightActions.length > 0 && (
        <div className="swipe-actions swipe-actions-right">
          {rightActions.slice(0, MAX_ACTIONS_REVEALED).map((action, index) => (
            <div 
              key={`right-${index}`}
              className="swipe-action"
              style={{ backgroundColor: action.color }}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
            >
              <span className="swipe-action-icon">
                <i className={`fas ${action.icon}`}></i>
                <span className="ml-1">{action.label}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Card content */}
      <div 
        className="swipeable-card-content"
        style={{
          transform: isSwipeEnabled ? `translateX(${swipeOffset}px)` : 'none'
        }}
        onTouchStart={isSwipeEnabled ? handleTouchStart : undefined}
        onTouchMove={isSwipeEnabled ? handleTouchMove : undefined}
        onTouchEnd={isSwipeEnabled ? handleTouchEnd : undefined}
      >
        {children}
        
        {/* Optional swipe indicator */}
        <div className="swipe-indicator"></div>
        
        {/* Optional drag handles */}
        {leftActions.length > 0 && (
          <div className="swipe-drag-handle swipe-drag-handle-left"></div>
        )}
        {rightActions.length > 0 && (
          <div className="swipe-drag-handle swipe-drag-handle-right"></div>
        )}
      </div>
      
      {/* When card is open, add a touch area to capture taps */}
      {isOpen && (
        <div className="swipeable-card-touch-area" onClick={handleBackdropClick}></div>
      )}
    </div>
  );
};

export default SwipeableCard; 