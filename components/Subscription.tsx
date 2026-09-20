import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { CheckCircle2, Shield, Zap, ArrowLeft, Star, Loader2, AlertCircle } from 'lucide-react';

interface SubscriptionProps {
  profile: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ profile, onBack, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Server-directed Paystack config
  const [paymentConfig, setPaymentConfig] = useState({
    reference: '',
    email: profile.email || 'student@example.com',
    amount: 1000 * 100, // ₦1,000 in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_8413c9cfb228e0e771818b5dce2ab84472992d5d',
  });

  const initializePaystack = usePaystackPayment(paymentConfig);

  const handlePaymentStart = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';

      // 1. Authoritative payment initialization via Cloud Function / Backend
      const initRes = await fetch('/api/initializePayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: profile.email || user?.email
        })
      });

      if (!initRes.ok) {
        throw new Error('Failed to initiate secure payment intent.');
      }

      const initData = await initRes.json();
      const serverReference = initData.reference;

      const activeConfig = {
        reference: serverReference,
        email: initData.email || profile.email,
        amount: initData.amount || 100000,
        publicKey: initData.publicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_8413c9cfb228e0e771818b5dce2ab84472992d5d',
      };

      setPaymentConfig(activeConfig);

      // 2. Launch Paystack modal
      initializePaystack({
        onSuccess: async (referenceObj: any) => {
          try {
            const ref = referenceObj.reference || serverReference;
            // 3. Authoritative verification via Cloud Function / Backend
            const verifyRes = await fetch('/api/verifyPayment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ reference: ref })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.status === 'success') {
              setIsProcessing(false);
              onSuccess();
            } else {
              throw new Error(verifyData.message || 'Payment verification failed on server.');
            }
          } catch (verErr: any) {
            console.error('Verification error:', verErr);
            setErrorMsg(verErr.message || 'Failed to verify transaction. Contact democustomersupportservices@gmail.com');
            setIsProcessing(false);
          }
        },
        onClose: () => {
          setIsProcessing(false);
        }
      });
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setErrorMsg(err.message || 'Error connecting to payment service.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
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
              <h2 className="text-2xl font-bold text-white mb-1">
                Premium Access
              </h2>
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-2">
                Monthly Subscription
              </p>
              <div className="flex items-baseline justify-center gap-1 text-white">
                <span className="text-4xl font-black">₦1,000</span>
                <span className="text-sm font-medium text-emerald-100">/ month</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <FeatureItem text="Unlimited AI Tutor Mentorship" />
              <FeatureItem text="Full CBT Mock Simulations (JAMB/WAEC)" />
              <FeatureItem text="Theory & Essay Examiner Grading" />
              <FeatureItem text="JAMB AI Score Predictor Analytics" />
              <FeatureItem text="Priority Syllabus Updates" />
            </div>

            <button 
              onClick={handlePaymentStart} 
              disabled={isProcessing} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Paystack...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white" />
                  <span>Pay ₦1,000 with Paystack</span>
                </>
              )}
            </button>

            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600"/>
                <span>Authoritative SSL encryption via Paystack</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Support: democustomersupportservices@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/>
    </div>
    <span className="text-slate-700 text-sm font-medium">{text}</span>
  </div>
);

export default Subscription;
