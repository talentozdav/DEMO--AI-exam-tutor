import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { UserProfile } from '../types';
import { CheckCircle2, Shield, Zap, ArrowLeft, Star } from 'lucide-react';

interface SubscriptionProps {
  profile: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ profile, onBack, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const amount = 3000 * 100;

  const config = {
    reference: new Date().getTime().toString(),
    email: profile.email,
    amount,
    publicKey,
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = async (reference: any) => {
    try {
      // 🔥 CALL FIREBASE FUNCTION TO VERIFY
      // For demo purposes, if the URL is not configured, we'll simulate a successful verification
      const verifyUrl = `https://us-central1-YOURPROJECT.cloudfunctions.net/verifyPayment?reference=${reference.reference}`;
      
      let data;
      if (verifyUrl.includes("YOURPROJECT")) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        data = { status: "success" };
      } else {
        const res = await fetch(verifyUrl);
        data = await res.json();
      }

      if (data.status === "success") {
        onSuccess();
      } else {
        alert("Payment verification failed");
      }
    } catch (error) {
      alert("Verification error. Please check your internet connection.");
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    setIsProcessing(false);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    initializePayment({
      onSuccess: handleSuccess,
      onClose: handleClose,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-slate-600"/>
        </button>
        <h1 className="text-lg font-bold text-slate-900">
          Upgrade to Premium
        </h1>
      </header>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100">

          <div className="bg-emerald-600 p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-yellow-300 fill-yellow-300"/>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Premium Access
              </h2>
              <span className="text-4xl font-black text-white">
                ₦3,000
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <FeatureItem text="Unlimited AI Tutor Chat"/>
            <FeatureItem text="Full Access to CBT Practice"/>
            <FeatureItem text="Advanced Essay Grading"/>
            <FeatureItem text="Detailed Performance Analytics"/>
            <FeatureItem text="Priority Support"/>

            <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl">
              {isProcessing ? "Processing..." : "Upgrade Now"}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-500"/>
              Secured by Paystack
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <CheckCircle2 className="w-5 h-5 text-emerald-500"/>
    <span className="text-slate-700 font-medium">{text}</span>
  </div>
);

export default Subscription;