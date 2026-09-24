import React, { useMemo } from 'react';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';
import { Zap, Target, TrendingUp, AlertCircle, HelpCircle } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

const JAMBScorePredictor: React.FC<Props> = ({ profile }) => {
  const prediction = useMemo(() => {
    const subjects = profile.selectedSubjects['JAMB'] || [];
    if (subjects.length === 0) return null;

    const jambScores = profile.scores?.filter(sc => sc.examType === 'JAMB') || [];
    
    // If no JAMB scores have been recorded yet, we cannot manufacture a score
    if (jambScores.length === 0) {
      return {
        hasData: false,
        totalTests: 0,
        subjects
      };
    }

    // Get real proficiency per subject based on actual scores only
    const subjectStats = subjects.map(s => {
      const scores = jambScores.filter(sc => sc.subject === s);
      
      if (scores.length === 0) {
        return {
          name: s,
          hasData: false,
          score: null,
          testCount: 0
        };
      }
      
      // Calculate weighted average of real scores (more recent scores carry more weight)
      const sortedScores = [...scores].sort((a, b) => b.timestamp - a.timestamp);
      const recentScores = sortedScores.slice(0, 5);
      
      let totalWeight = 0;
      let weightedSum = 0;
      
      recentScores.forEach((sc, index) => {
        const weight = 1 / (index + 1);
        const percentage = sc.total > 0 ? (sc.score / sc.total) * 100 : 0;
        weightedSum += percentage * weight;
        totalWeight += weight;
      });
      
      const weightedProficiency = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

      return {
        name: s,
        hasData: true,
        score: weightedProficiency,
        testCount: scores.length
      };
    });

    const testedSubjects = subjectStats.filter(s => s.hasData && s.score !== null);
    
    // Require at least one tested subject with real scores
    if (testedSubjects.length === 0) {
      return {
        hasData: false,
        totalTests: 0,
        subjects
      };
    }

    const avgProficiency = testedSubjects.reduce((acc, s) => acc + (s.score || 0), 0) / testedSubjects.length;
    
    // JAMB is out of 400. 
    // Map real performance (0 - 100%) to 0 - 400 points
    const predictedTotal = Math.round((avgProficiency / 100) * 400);

    // Identify lowest and highest tested subjects for real feedback
    const sortedTested = [...testedSubjects].sort((a, b) => (a.score || 0) - (b.score || 0));
    const lowest = sortedTested[0];
    const highest = sortedTested[sortedTested.length - 1];

    let dynamicInsight = '';
    if (testedSubjects.length < subjects.length) {
      const untested = subjectStats.filter(s => !s.hasData).map(s => s.name).join(', ');
      dynamicInsight = `Prediction is based on ${testedSubjects.length} of ${subjects.length} subjects tested. Take CBT drills in ${untested} for a comprehensive forecast.`;
    } else if (lowest && lowest.score !== null && lowest.score < 50) {
      dynamicInsight = `Your current scores show room for improvement in ${lowest.name} (${lowest.score}%). Target practice drills in ${lowest.name} to increase your overall aggregate.`;
    } else if (highest && lowest && highest.name !== lowest.name) {
      dynamicInsight = `Strong performance in ${highest.name} (${highest.score}%). Maintain your study rhythm and focus more revision time on ${lowest.name} (${lowest.score}%).`;
    } else {
      dynamicInsight = `Consistent performance across tested subjects with an average accuracy of ${Math.round(avgProficiency)}%. Continue regular timed CBT sessions.`;
    }

    return {
      hasData: true,
      total: predictedTotal,
      subjects: subjectStats,
      testedCount: testedSubjects.length,
      totalCount: subjects.length,
      readiness: avgProficiency >= 70 ? 'High' : avgProficiency >= 50 ? 'Medium' : 'Low',
      insight: dynamicInsight
    };
  }, [profile]);

  if (!prediction) return null;

  if (!prediction.hasData) {
    return (
      <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl shadow-slate-200 overflow-hidden relative border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight">JAMB Score Predictor</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance Analysis</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Not Enough Test Data Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Complete at least one timed JAMB CBT practice drill to generate an authentic score prediction based on your actual test performance.
          </p>
          <div className="pt-1">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              {prediction.subjects.length} JAMB Subjects Selected
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl shadow-slate-200 overflow-hidden relative"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[60px] -mr-16 -mt-16 rounded-full pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">JAMB Score Predictor</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance Analysis</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
              prediction.readiness === 'High' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              prediction.readiness === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {prediction.readiness} Readiness
            </span>
          </div>
        </div>

        <div className="flex items-end gap-4 mb-8">
          <div className="flex-1">
            <p className="text-slate-400 text-xs font-bold mb-1">Predicted Aggregate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                {prediction.total}
              </span>
              <span className="text-slate-500 font-bold text-xl">/ 400</span>
            </div>
          </div>
          <div className="pb-2 text-right">
            <span className="text-[11px] text-slate-400 font-semibold block">
              Based on {prediction.testedCount} of {prediction.totalCount} subjects
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {prediction.subjects.map(s => (
            <div key={s.name} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-400">{s.name}</span>
                {s.hasData && s.score !== null ? (
                  <span className="text-white">{s.score}% Accuracy ({s.testCount} test{s.testCount === 1 ? '' : 's'})</span>
                ) : (
                  <span className="text-slate-500 italic">No tests taken</span>
                )}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                {s.hasData && s.score !== null ? (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${s.score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      s.score >= 70 ? 'bg-emerald-500' : s.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                ) : (
                  <div className="h-full w-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {prediction.insight && (
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <span className="text-white font-bold">Insight:</span> {prediction.insight}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default JAMBScorePredictor;
