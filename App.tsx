import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { supabase, signOut } from './lib/supabaseClient';
import { 
  fetchUserProfile, 
  saveInitialProfile, 
  updateUserProfile, 
  fetchLeaderboard, 
  subscribeToUserProfile 
} from './services/dbService';

import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import AITutor from './components/AITutor';
import QuestionBank from './components/QuestionBank';
import EssayCoach from './components/EssayCoach';
import CBTPractice from './components/CBTPractice';
import SubjectsList from './components/SubjectsList';
import ProgressTracker from './components/ProgressTracker';
import LandingPage from './components/LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfUse from './components/TermsOfUse';
import ContactSupport from './components/ContactSupport';
import InstallGuide from './components/InstallGuide';
import Subscription from './components/Subscription';
import ReferralDashboard from './components/ReferralDashboard';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import ResetPassword from './components/ResetPassword';
import TrialBanner from './components/TrialBanner';

import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  User, 
  BarChart2, 
  LogOut, 
  X, 
  GraduationCap, 
  Download, 
  Star, 
  ChevronLeft, 
  Share2, 
  Trophy, 
  Gift,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isStartingOnboarding, setIsStartingOnboarding] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'subjects' | 'tutor' | 'practice' | 'progress'>('home');
  const [showEssayCoach, setShowEssayCoach] = useState(false);
  const [showCBT, setShowCBT] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showReferralDashboard, setShowReferralDashboard] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [leaderboardEntries, setLeaderboardEntries] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Listen for backend trial-expired event
  useEffect(() => {
    const handleTrialExpired = () => {
      setShowSubscription(true);
    };
    window.addEventListener('trial-expired', handleTrialExpired);
    return () => window.removeEventListener('trial-expired', handleTrialExpired);
  }, []);

  // Grant premium reward for 20 active referrals via server endpoint
  useEffect(() => {
    if (profile && (profile.activeReferralCount || 0) >= 20 && !profile.isPremium && !profile.referralRewardsClaimed) {
      const claimReward = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) return;
          const res = await fetch('/api/redeemReferralReward', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (res.ok) {
            alert("Congratulations! You've reached 20 active referrals and unlocked the full WAEC and NECO questions pack for 1 year!");
          }
        } catch (e) {
          console.error("Error claiming referral reward:", e);
        }
      };
      claimReward();
    }
  }, [profile?.activeReferralCount, profile?.isPremium, profile?.referralRewardsClaimed]);

  useEffect(() => {
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('examace_pending_ref', refCode);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check if recovery link was opened
    const isRecovery = 
      window.location.pathname === '/reset-password' || 
      window.location.hash.includes('type=recovery') ||
      (window.location.hash.includes('access_token=') && window.location.hash.includes('recovery'));
    if (isRecovery) {
      setShowResetPassword(true);
    }
  }, []);

  // Supabase Auth Session listener
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const handleUser = async (user: any, token?: string) => {
      try {
        if (!user) {
          setProfile(null);
          setSubscriptionState(null);
          setIsStartingOnboarding(false);
          setIsLoadingAuth(false);
          if (unsubProfile) unsubProfile();
          return;
        }

        // Fetch entitlements from server
        try {
          const accessToken = token || (await supabase.auth.getSession()).data.session?.access_token;
          if (accessToken) {
            const entRes = await fetch('/api/getUserEntitlements', {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (entRes.ok) {
              const ent = await entRes.json();
              setSubscriptionState(ent);
            }
          }
        } catch (e) {
          console.warn('Could not fetch entitlements:', e);
        }

        // Fetch user profile from Supabase
        const userProfile = await fetchUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // New user, needs onboarding
          setProfile(null);
          setIsStartingOnboarding(true);
        }

        // Realtime subscription to user profile changes
        if (unsubProfile) unsubProfile();
        unsubProfile = subscribeToUserProfile(user.id, (updated) => {
          setProfile(updated);
        });
      } catch (err) {
        console.error('Error during handleUser:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    // Clean up OAuth error in hash if present
    if (window.location.hash.includes('error=') || window.location.hash.includes('error_code=')) {
      console.warn('OAuth redirect contained error:', window.location.hash);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user, session.access_token);
      } else {
        setIsLoadingAuth(false);
      }
    }).catch((err) => {
      console.warn('Session check error:', err);
      setIsLoadingAuth(false);
    });

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
      }
      await handleUser(newSession?.user, newSession?.access_token);
    });

    return () => {
      subscription.unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    if (showLeaderboard) {
      const loadLeaderboard = async () => {
        setIsLoadingLeaderboard(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const entries = await fetchLeaderboard(10);
          setLeaderboardEntries(entries.map((entry: any) => ({
            id: entry.id,
            name: entry.name,
            activeReferrals: entry.activeReferralCount || 0,
            referrals: entry.referralCount || 0,
            isCurrentUser: user?.id === entry.id
          })));
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
          setLeaderboardEntries([]);
        } finally {
          setIsLoadingLeaderboard(false);
        }
      };
      loadLeaderboard();
    }
  }, [showLeaderboard]);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const pendingRef = localStorage.getItem('examace_pending_ref');
    try {
      const saved = await saveInitialProfile(user.id, user.email || '', newProfile, pendingRef);
      setProfile(saved);
      localStorage.removeItem('examace_pending_ref');

      // Initialize server-authoritative entitlements
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const entRes = await fetch('/api/getUserEntitlements', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (entRes.ok) {
            const ent = await entRes.json();
            setSubscriptionState(ent);
          }
        } catch (e) {}
      }

      setIsStartingOnboarding(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const updateProfile = async (updatedProfile: UserProfile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      await updateUserProfile(user.id, updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const isUserPremium = Boolean(
    profile?.isPremium || 
    profile?.isSubscribed || 
    subscriptionState?.status === 'active' || 
    subscriptionState?.isPremium
  );

  const getTrialStatus = () => {
    if (!profile || isUserPremium) return { expired: false, daysLeft: 3 };
    
    const now = Date.now();
    const trialDuration = 3 * 24 * 60 * 60 * 1000; // 3 days
    const trialExpiresAt = subscriptionState?.trialExpiresAt || 
      (profile.createdAt ? Number(profile.createdAt) + trialDuration : now + trialDuration);

    const remaining = trialExpiresAt - now;
    const daysLeft = remaining / (24 * 60 * 60 * 1000);
    
    return {
      expired: remaining <= 0,
      daysLeft: Math.max(0, daysLeft)
    };
  };

  const trialStatus = getTrialStatus();

  const handleReset = async () => {
    if (confirm("This will reset your learning progress and exam dates. Continue?")) {
      if (profile) {
        const resetProfile: UserProfile = {
          ...profile,
          exams: [],
          selectedSubjects: { WAEC: [], NECO: [], JAMB: [] },
          examDates: { WAEC: '', NECO: '', JAMB: '' },
          weakSubjects: []
        };
        await updateProfile(resetProfile);
        setShowProfileModal(false);
        setIsStartingOnboarding(true);
        setActiveTab('home');
      }
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      try {
        await signOut();
        setProfile(null);
        setSubscriptionState(null);
        setShowProfileModal(false);
        setActiveTab('home');
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showPrivacy) return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  if (showTerms) return <TermsOfUse onBack={() => setShowTerms(false)} />;
  if (showContact) return <ContactSupport onBack={() => setShowContact(false)} />;
  if (showInstall) return <InstallGuide onBack={() => setShowInstall(false)} />;
  if (showAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} />;
  if (showResetPassword) {
    return (
      <ResetPassword 
        onSuccess={() => {
          setShowResetPassword(false);
          setShowAuthModal(true);
        }}
        onCancel={() => {
          setShowResetPassword(false);
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname === '/reset-password' ? '/' : window.location.pathname);
          }
        }}
      />
    );
  }

  if (!profile && !isStartingOnboarding) {
    return (
      <>
        <LandingPage 
          onStart={handleLogin} 
          onShowPrivacy={() => setShowPrivacy(true)} 
          onShowTerms={() => setShowTerms(true)}
          onShowContact={() => setShowContact(true)}
          onShowInstall={() => setShowInstall(true)}
        />
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  if (isStartingOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} initialData={profile || undefined} />;
  }

  // Force subscription if trial expired and not premium
  if (profile && trialStatus.expired && !isUserPremium) {
    return <Subscription profile={profile} onBack={handleLogout} onSuccess={() => {
      setShowSubscription(false);
    }} />;
  }

  // Also allow manual subscription trigger
  if (showSubscription && profile) {
    return <Subscription profile={profile} onBack={() => setShowSubscription(false)} onSuccess={() => {
      setShowSubscription(false);
    }} />;
  }

  const getTabTitle = () => {
    if (showEssayCoach) return 'Essay Coach';
    if (showCBT) return 'CBT Practice';
    switch (activeTab) {
      case 'home': return 'Dashboard';
      case 'subjects': return 'Study Materials';
      case 'tutor': return 'AI Tutor';
      case 'practice': return 'Question Bank — Coming Soon';
      case 'progress': return 'Performance';
      default: return 'DEMO';
    }
  };

  const renderContent = () => {
    if (showEssayCoach) return <EssayCoach onBack={() => setShowEssayCoach(false)} profile={profile!} onUpdateProfile={updateProfile} />;
    if (showCBT) return <CBTPractice onBack={() => setShowCBT(false)} profile={profile!} onUpdateProfile={updateProfile} />;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 h-full"
        >
          {activeTab === 'home' && (
            <Dashboard 
              profile={profile!} 
              onNavigate={(tab: any) => setActiveTab(tab)}
              onStartEssay={() => setShowEssayCoach(true)}
              onStartCBT={() => setShowCBT(true)}
              onShowContact={() => setShowContact(true)}
              onShowReferral={() => setShowReferralDashboard(true)}
              onShowAdmin={() => setShowAdmin(true)}
              onUpdateProfile={updateProfile}
            />
          )}
          {activeTab === 'subjects' && <SubjectsList profile={profile!} />}
          {activeTab === 'tutor' && <AITutor profile={profile!} onUpdateProfile={updateProfile} />}
          {activeTab === 'practice' && <QuestionBank profile={profile!} onStartEssay={() => setShowEssayCoach(true)} onStartCBT={() => setShowCBT(true)} />}
          {activeTab === 'progress' && <ProgressTracker profile={profile!} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between z-20 h-16">
        <div className="flex items-center gap-3">
          {(showEssayCoach || showCBT) ? (
            <button 
              onClick={() => {setShowEssayCoach(false); setShowCBT(false);}}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
          ) : (
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">
              {(showEssayCoach || showCBT) ? getTabTitle() : 'DEMO'}
            </h1>
            {!(showEssayCoach || showCBT) && (
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                {getTabTitle()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile?.studyStreak && (
            <button 
              onClick={() => {
                setActiveTab('home');
                setShowEssayCoach(false);
                setShowCBT(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={`${profile.studyStreak.currentStreak} day study streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{profile.studyStreak.currentStreak}</span>
            </button>
          )}
          {!profile?.isPremium && !profile?.isSubscribed && (
            <button 
              onClick={() => setShowSubscription(true)}
              className="p-2 hover:bg-yellow-50 rounded-xl transition-colors text-yellow-600 cursor-pointer"
              title="Upgrade to Premium"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setShowInstall(true)}
            className="p-2 hover:bg-emerald-50 rounded-xl transition-colors text-emerald-600 cursor-pointer"
            title="Install App"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 cursor-pointer"
            title="User Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Trial Reminder Banner */}
      {!profile?.isPremium && !profile?.isSubscribed && profile?.trialStartedAt && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl z-10 px-4">
          <TrialBanner daysLeft={trialStatus.daysLeft} onUpgrade={() => setShowSubscription(true)} />
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "w-full max-w-4xl flex-1 pb-24 overflow-y-auto custom-scrollbar bg-slate-50",
        (!profile?.isPremium && !profile?.isSubscribed && profile?.trialStartedAt) ? "pt-32" : "pt-16"
      )}>
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-2 flex justify-around items-center z-20 shadow-xs">
        <NavButton active={activeTab === 'home' && !showEssayCoach && !showCBT} onClick={() => {setActiveTab('home'); setShowEssayCoach(false); setShowCBT(false);}} icon={<Home className="w-5 h-5" />} label="Home" />
        <NavButton active={activeTab === 'subjects'} onClick={() => {setActiveTab('subjects'); setShowEssayCoach(false); setShowCBT(false);}} icon={<BookOpen className="w-5 h-5" />} label="Study" />
        <NavButton active={activeTab === 'tutor'} onClick={() => {setActiveTab('tutor'); setShowEssayCoach(false); setShowCBT(false);}} icon={<MessageSquare className="w-5 h-5" />} label="AI Tutor" />
        <NavButton active={activeTab === 'practice'} onClick={() => {setActiveTab('practice'); setShowEssayCoach(false); setShowCBT(false);}} icon={<HelpCircle className="w-5 h-5" />} label="Practice" />
        <NavButton active={activeTab === 'progress'} onClick={() => {setActiveTab('progress'); setShowEssayCoach(false); setShowCBT(false);}} icon={<BarChart2 className="w-5 h-5" />} label="Stats" />
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}></div>
          <div className="relative w-full max-w-xs bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{profile?.name.split(' ')[0]}'s Profile</h3>
                  {(profile?.isSubscribed || profile?.isPremium) && (
                    <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-yellow-900" /> PRO
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-80">{profile?.email}</p>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Exams</p>
                <div className="flex gap-2">
                  {profile?.exams.map(e => (
                    <span key={e} className="bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600">{e}</span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button 
                   onClick={() => {setShowInstall(true); setShowProfileModal(false);}}
                   className="w-full flex items-center gap-3 p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors text-sm font-bold cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Install DEMO App
                </button>
                <button 
                   onClick={() => {setShowReferralDashboard(true); setShowProfileModal(false);}}
                   className="w-full flex items-center gap-3 p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors text-sm font-bold mt-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Referral Program
                </button>
                <button 
                   onClick={() => {setShowLeaderboard(true); setShowProfileModal(false);}}
                   className="w-full flex items-center gap-3 p-3 text-amber-600 hover:bg-amber-50 rounded-2xl transition-colors text-sm font-bold mt-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4" /> Leaderboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors text-sm font-bold mt-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors text-sm font-bold mt-2 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Reset Learning Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral Dashboard */}
      <AnimatePresence>
        {showReferralDashboard && profile && (
          <ReferralDashboard 
            user={profile} 
            onClose={() => setShowReferralDashboard(false)} 
            onShowLeaderboard={() => setShowLeaderboard(true)}
          />
        )}
      </AnimatePresence>

      {/* Leaderboard */}
      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard 
            onClose={() => setShowLeaderboard(false)}
            entries={leaderboardEntries}
            isLoading={isLoadingLeaderboard}
          />
        )}
      </AnimatePresence>

      {/* Referral Popup */}
      <AnimatePresence>
        {showReferralPopup && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setShowReferralPopup(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[32px] p-8 max-w-xs w-full text-center shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Gift size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Special Offer!</h3>
              <p className="text-slate-600 font-medium mb-8">
                Invite 20 friends → Get full WAEC and NECO questions pack
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowReferralPopup(false);
                    setShowReferralDashboard(true);
                  }}
                  className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer"
                >
                  START INVITING
                </button>
                <button
                  onClick={() => setShowReferralPopup(false)}
                  className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center gap-1 transition-all px-3 py-1 rounded-2xl flex-1 cursor-pointer",
      active ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
    )}
  >
    {active && (
      <motion.div
        layoutId="nav-pill"
        className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <motion.div
      animate={active ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {icon}
    </motion.div>
    <span className={cn(
      "text-[9px] uppercase tracking-tighter transition-all",
      active ? "font-black opacity-100" : "font-bold opacity-60"
    )}>
      {label}
    </span>
  </button>
);

export default App;
