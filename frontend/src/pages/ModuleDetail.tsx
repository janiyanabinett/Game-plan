import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { getModuleById } from '../data/modules';
import { useProgress } from '../hooks/useProgress';

type Tab = 'learn' | 'quiz';

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const mod = getModuleById(id!);
  const { progress, completeModule, saveQuizScore } = useProgress();

  const [tab, setTab] = useState<Tab>('learn');
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);

  if (!mod) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <div className="text-gray-500">Module not found.</div>
        <Link to="/modules" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to modules
        </Link>
      </div>
    );
  }

  const lesson = mod.lessons[activeLessonIdx];
  const isCompleted = progress.completedModules.includes(mod.id);

  const handleQuizSubmit = () => {
    const answered = Object.keys(quizAnswers).length;
    if (answered < mod.quiz.length) {
      alert(`Please answer all ${mod.quiz.length} questions before submitting.`);
      return;
    }
    setQuizSubmitted(true);
    const correct = mod.quiz.filter((q) => quizAnswers[q.id] === q.correctIndex).length;
    const score = Math.round((correct / mod.quiz.length) * 100);
    saveQuizScore(mod.id, score);
    if (score >= 70) completeModule(mod.id);
  };

  const fetchExplanation = async (questionId: string) => {
    if (explanations[questionId] || loadingExplanation) return;
    const q = mod.quiz.find((q) => q.id === questionId);
    if (!q) return;
    setLoadingExplanation(questionId);
    try {
      const { data } = await api.post('/api/ai/quiz-explain', {
        question: q.question,
        correctAnswer: q.options[q.correctIndex],
        userAnswer: q.options[quizAnswers[q.id]],
        topic: mod.title,
      });
      setExplanations((prev) => ({ ...prev, [questionId]: data.explanation }));
    } catch {
      setExplanations((prev) => ({ ...prev, [questionId]: q.explanation }));
    } finally {
      setLoadingExplanation(null);
    }
  };

  const quizScore = progress.quizScores[mod.id];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/modules" className="hover:text-gray-700">Modules</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{mod.title}</span>
      </div>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{mod.icon}</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{mod.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{mod.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
              <span>⏱ {mod.estimatedMinutes} min</span>
              <span>📖 {mod.lessons.length} lessons</span>
              <span>❓ {mod.quiz.length} quiz questions</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                mod.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                mod.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>{mod.difficulty}</span>
              {isCompleted && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['learn', 'quiz'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'learn' ? '📖 Learn' : '✅ Quiz'}
            {t === 'quiz' && quizScore !== undefined && (
              <span className={`ml-1.5 text-xs ${quizScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                {quizScore}%
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'learn' && (
        <div className="grid grid-cols-4 gap-6">
          {/* Lesson Nav */}
          <div className="col-span-1 space-y-1">
            {mod.lessons.map((l, idx) => (
              <button
                key={l.id}
                onClick={() => setActiveLessonIdx(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeLessonIdx === idx
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs opacity-70 mb-0.5">Lesson {idx + 1}</div>
                {l.title}
              </button>
            ))}
          </div>

          {/* Lesson Content */}
          <div className="col-span-3 card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{lesson.title}</h2>
            <div className="prose prose-sm max-w-none text-gray-700 space-y-3">
              {lesson.content.split('\n\n').map((para, i) => {
                if (para.startsWith('**') && para.endsWith('**')) {
                  return <h3 key={i} className="font-semibold text-gray-900 text-base mt-4">{para.replace(/\*\*/g, '')}</h3>;
                }
                return (
                  <p key={i} className="leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{
                      __html: para
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />'),
                    }}
                  />
                );
              })}
            </div>

            {/* Key Points */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-900 mb-2">Key Takeaways</div>
              <ul className="space-y-1">
                {lesson.keyPoints.map((pt, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setActiveLessonIdx((p) => Math.max(0, p - 1))}
                disabled={activeLessonIdx === 0}
                className="btn-secondary text-sm"
              >
                ← Previous
              </button>
              {activeLessonIdx < mod.lessons.length - 1 ? (
                <button
                  onClick={() => setActiveLessonIdx((p) => p + 1)}
                  className="btn-primary text-sm"
                >
                  Next Lesson →
                </button>
              ) : (
                <button
                  onClick={() => setTab('quiz')}
                  className="btn-primary text-sm"
                >
                  Take Quiz →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'quiz' && (
        <div className="space-y-6">
          {quizSubmitted && (
            <div className={`card p-5 border-2 ${
              (quizScore ?? 0) >= 70 ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
            }`}>
              <div className="text-lg font-bold mb-1">
                {(quizScore ?? 0) >= 70 ? '🎉 Quiz Passed!' : '📝 Review Needed'}
              </div>
              <div className="text-sm">
                You scored <strong>{quizScore}%</strong> ({
                  mod.quiz.filter((q) => quizAnswers[q.id] === q.correctIndex).length
                }/{mod.quiz.length} correct).
                {(quizScore ?? 0) >= 70
                  ? ' Module marked as completed!'
                  : ' Score 70% or higher to complete the module.'}
              </div>
              {(quizScore ?? 0) < 70 && (
                <button
                  onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setExplanations({}); }}
                  className="btn-primary text-sm mt-3"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          )}

          {mod.quiz.map((q, qi) => {
            const selected = quizAnswers[q.id];
            const isCorrect = selected === q.correctIndex;

            return (
              <div key={q.id} className="card p-5">
                <div className="font-semibold text-gray-900 mb-3">
                  <span className="text-gray-400 text-sm mr-2">Q{qi + 1}.</span>
                  {q.question}
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    let cls = 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700';
                    if (quizSubmitted) {
                      if (oi === q.correctIndex) cls = 'border-green-400 bg-green-50 text-green-800 font-medium';
                      else if (oi === selected) cls = 'border-red-400 bg-red-50 text-red-700';
                      else cls = 'border-gray-100 bg-gray-50 text-gray-400';
                    } else if (selected === oi) {
                      cls = 'border-blue-400 bg-blue-50 text-blue-800';
                    }

                    return (
                      <button
                        key={oi}
                        disabled={quizSubmitted}
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${cls}`}
                      >
                        <span className="mr-2 font-medium">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="mt-3">
                    {explanations[q.id] ? (
                      <div className={`text-sm p-3 rounded-lg ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                        <strong>{isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}</strong>
                        {explanations[q.id]}
                      </div>
                    ) : (
                      <button
                        onClick={() => fetchExplanation(q.id)}
                        disabled={loadingExplanation !== null}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {loadingExplanation === q.id ? 'Getting AI explanation...' : '🤖 Get AI explanation'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!quizSubmitted && (
            <button onClick={handleQuizSubmit} className="btn-primary">
              Submit Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
