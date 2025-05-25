// Type definitions for PayPal SDK

// Define window interface for PayPal SDK
interface Window {
  paypal: {
    Buttons: (config: PayPalButtonsConfig) => {
      render: (containerId: string) => void;
    };
  };
}

// PayPal Button Configuration
interface PayPalButtonsConfig {
  // Function to create an order
  createOrder?: () => Promise<string>;
  
  // Function called when buyer approves the transaction
  onApprove?: (data: PayPalApproveData, actions: any) => Promise<void>;
  
  // Function called when buyer cancels the transaction
  onCancel?: () => void;
  
  // Function called when an error occurs
  onError?: (err: Error) => void;
  
  // Button style customization
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
    height?: number;
    tagline?: boolean;
  };
  
  // PayPal JS SDK: Validate user input before proceeding
  onClick?: (data: any, actions: any) => void;
}

// Data structure for onApprove callback
interface PayPalApproveData {
  orderID: string;
  payerID?: string;
  paymentID?: string;
  billingToken?: string;
  facilitatorAccessToken?: string;
}

// PayPal Order creation response
interface PayPalOrderResponse {
  id: string;
  status: string;
  error?: string;
}

// PayPal Order capture response
interface PayPalCaptureResponse {
  id: string;
  status: string;
  payer?: any;
  purchase_units?: any[];
  error?: string;
  details?: string;
} 