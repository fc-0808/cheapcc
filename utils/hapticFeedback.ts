/**
 * Haptic feedback utility for mobile devices
 * Provides a consistent way to trigger vibration feedback on supported devices
 */

/**
 * Types of haptic feedback with different intensities
 */
export type HapticFeedbackIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Check if the device supports vibration API
 */
export const supportsHapticFeedback = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Trigger haptic feedback with specified intensity
 * @param intensity - Level of feedback to provide
 */
export const triggerHaptic = (intensity: HapticFeedbackIntensity = 'medium'): void => {
  if (!supportsHapticFeedback()) return;
  
  switch (intensity) {
    case 'light':
      // Gentle feedback for subtle interactions
      navigator.vibrate(10);
      break;
    
    case 'medium':
      // Standard feedback for most interactions
      navigator.vibrate(35);
      break;
    
    case 'heavy':
      // Strong feedback for important actions
      navigator.vibrate([50, 30, 50]);
      break;
    
    case 'success':
      // Positive confirmation pattern
      navigator.vibrate([10, 30, 10]);
      break;
    
    case 'warning':
      // Warning feedback
      navigator.vibrate([30, 50, 30]);
      break;
    
    case 'error':
      // Error feedback
      navigator.vibrate([50, 30, 100, 30, 50]);
      break;
    
    default:
      // Default to medium intensity
      navigator.vibrate(35);
  }
};

/**
 * Simulates a physical button press with haptic feedback
 */
export const simulateButtonPress = (): void => {
  triggerHaptic('light');
};

/**
 * Provides feedback for a successful action
 */
export const successFeedback = (): void => {
  triggerHaptic('success');
};

/**
 * Provides feedback for a warning action
 */
export const warningFeedback = (): void => {
  triggerHaptic('warning');
};

/**
 * Provides feedback for an error
 */
export const errorFeedback = (): void => {
  triggerHaptic('error');
};

/**
 * Simulates a physical toggle action
 * @param isActive - Whether the toggle is being turned on or off
 */
export const toggleFeedback = (isActive: boolean): void => {
  triggerHaptic(isActive ? 'medium' : 'light');
};

/**
 * Creates a double-tap effect
 */
export const doubleTapFeedback = (): void => {
  if (supportsHapticFeedback()) {
    navigator.vibrate([10, 50, 10]);
  }
};

/**
 * Simulates a swipe-and-release action
 * @param intensity - How forceful the swipe release should feel
 */
export const swipeReleaseFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'medium'): void => {
  triggerHaptic(intensity);
};

export default {
  triggerHaptic,
  simulateButtonPress,
  successFeedback,
  warningFeedback,
  errorFeedback,
  toggleFeedback,
  doubleTapFeedback,
  swipeReleaseFeedback,
  supportsHapticFeedback
}; 