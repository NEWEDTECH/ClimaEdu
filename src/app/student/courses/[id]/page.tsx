'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { ProtectedContent } from '@/components/auth/ProtectedContent';
import { useProfile } from '@/context/zustand/useProfile';
import { CourseSidebar, CourseContent } from '@/components/courses/student';
import { useCourseData } from '@/hooks/content/useCourseData';
import { useCourseNavigation } from '@/hooks/content/useCourseNavigation';
import { useAutoNavigation } from '@/hooks/content/useAutoNavigation';
import { useCallback, useState, useEffect, useRef } from 'react';
import { container, Register } from '@/_core/shared/container';
import { ListNSScoreQuestionsUseCase, ListNSScoreQuestionsInput } from '@/_core/modules/nsscore/core/use-cases/list-questions';
import { CheckNSScoreSubmittedUseCase, CheckNSScoreSubmittedInput } from '@/_core/modules/nsscore/core/use-cases/check-submitted';
import { SubmitNSScoreResponseUseCase, SubmitNSScoreResponseInput } from '@/_core/modules/nsscore/core/use-cases/submit-response';
import type { NSScoreQuestion } from '@/_core/modules/nsscore/core/entities/NSScoreQuestion';
import type { QuestionAnswer } from '@/_core/modules/nsscore/core/entities/NSScoreResponse';
import { submitLessonRating, hasStudentRatedLesson } from '@/_core/modules/content/infrastructure/repositories/lessonRatingService';
import { Star } from 'lucide-react';


export default function CoursePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { infoUser } = useProfile();
    const courseId = params.id as string;
    const initialLessonId = searchParams.get('lesson');

    // NS Score modal state
    const [showNSModal, setShowNSModal] = useState(false);
    const [nsScore, setNsScore] = useState(10);
    const [nsQuestions, setNsQuestions] = useState<NSScoreQuestion[]>([]);
    const [nsAnswers, setNsAnswers] = useState<QuestionAnswer[]>([]);
    const [nsSubmitting, setNsSubmitting] = useState(false);
    const nsCheckedRef = useRef(false);

    // Lesson rating modal state
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingLessonId, setRatingLessonId] = useState<string | null>(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingHover, setRatingHover] = useState(0);
    const [ratingSubmitting, setRatingSubmitting] = useState(false);

    // Use custom hooks for data management and navigation
    const {
        modules,
        activeLesson,
        activeLessonData,
        activeContent,
        activeQuestionnaire,
        activeActivity,
        attemptCount,
        hasPassedQuestionnaire,
        isLoading,
        error,
        openModules,
        lessonAccess,
        setOpenModules,
        handleLessonSelect: originalHandleLessonSelect,
        handleCompleteLesson,
        handleVideoProgress
    } = useCourseData({
        courseId,
        userId: infoUser.id,
        institutionId: infoUser.currentIdInstitution || '',
        initialLessonId: initialLessonId || undefined
    });

    // Wrap handleLessonSelect to update URL when lesson is selected
    const handleLessonSelect = useCallback(async (lessonId: string) => {
        // Update URL with lesson parameter
        router.push(`/student/courses/${courseId}?lesson=${lessonId}`, { scroll: false });

        // Call original handler
        await originalHandleLessonSelect(lessonId);
    }, [courseId, router, originalHandleLessonSelect]);

    const {
        handleNextVideo,
        handlePreviousVideo,
        canNavigatePrevious,
        canNavigateNext
    } = useCourseNavigation({
        modules,
        activeLesson,
        setOpenModules,
        onLessonSelect: handleLessonSelect,
    });

    // Auto-navigation hook for video completion
    const {
        startAutoNavigation,
    } = useAutoNavigation({
        onNavigate: handleNextVideo,
        countdownSeconds: 5
    });

    // Check and show rating modal after lesson is newly completed
    const checkAndShowRating = async (lessonId: string) => {
        try {
            const alreadyRated = await hasStudentRatedLesson(lessonId, infoUser.id);
            if (!alreadyRated) {
                setRatingLessonId(lessonId);
                setRatingValue(0);
                setRatingHover(0);
                setShowRatingModal(true);
            }
        } catch { /* fail silently */ }
    };

    // Wrapped handleCompleteLesson that triggers rating modal on first completion
    const handleCompleteLessonWithRating = async () => {
        const wasAlreadyCompleted = lessonAccess.get(activeLesson || '')?.isCompleted;
        const completed = await handleCompleteLesson();
        if (completed && !wasAlreadyCompleted && activeLesson) {
            await checkAndShowRating(activeLesson);
        }
        return completed;
    };

    // Handle video ended with auto-navigation
    const handleVideoEnded = async () => {
        try {
            const wasAlreadyCompleted = lessonAccess.get(activeLesson || '')?.isCompleted;
            const completed = await handleCompleteLesson();
            console.log('🙋‍♂️ Video ended, lesson completion status:', completed);
            if (completed) {
                if (!wasAlreadyCompleted && activeLesson) {
                    checkAndShowRating(activeLesson); // fire and forget — rating is optional
                }
                startAutoNavigation();
            } else {
                console.warn('Failed to complete lesson, auto-navigation cancelled');
            }
        } catch (error) {
            console.error('Error during video end handling:', error);
        }
    };

    const handleRatingSubmit = async () => {
        if (!ratingLessonId || !infoUser.id) return;
        setRatingSubmitting(true);
        try {
            await submitLessonRating(ratingLessonId, infoUser.id, ratingValue);
        } catch { /* fail silently */ } finally {
            setRatingSubmitting(false);
            setShowRatingModal(false);
        }
    };

    // Detect course completion and show NS Score modal
    useEffect(() => {
        if (isLoading || nsCheckedRef.current || !modules.length) return;
        const allLessons = modules.flatMap(m => m.lessons);
        if (!allLessons.length || lessonAccess.size === 0) return;
        const allCompleted = allLessons.every(l => lessonAccess.get(l.id)?.isCompleted === true);
        if (!allCompleted) return;

        nsCheckedRef.current = true;
        ;(async () => {
            try {
                const checkUseCase = container.get<CheckNSScoreSubmittedUseCase>(Register.nsscore.useCase.CheckNSScoreSubmittedUseCase);
                const { submitted } = await checkUseCase.execute(new CheckNSScoreSubmittedInput(infoUser.id, courseId));
                if (submitted) return;

                const listUseCase = container.get<ListNSScoreQuestionsUseCase>(Register.nsscore.useCase.ListNSScoreQuestionsUseCase);
                const { questions } = await listUseCase.execute(new ListNSScoreQuestionsInput(courseId));
                setNsQuestions(questions);
                setNsAnswers(questions.map(q => ({ questionId: q.id, answer: '' })));
                setShowNSModal(true);
            } catch { /* fail silently */ }
        })();
    }, [modules, lessonAccess, isLoading, courseId, infoUser.id]);

    const handleNSSubmit = async () => {
        setNsSubmitting(true);
        try {
            const useCase = container.get<SubmitNSScoreResponseUseCase>(Register.nsscore.useCase.SubmitNSScoreResponseUseCase);
            await useCase.execute(new SubmitNSScoreResponseInput(
                courseId,
                infoUser.id,
                infoUser.currentIdInstitution || '',
                nsScore,
                nsAnswers
            ));
            setShowNSModal(false);
        } catch { /* fail silently */ } finally {
            setNsSubmitting(false);
        }
    };


    return (
        <ProtectedContent>
            <DashboardLayout>
                {/* Lesson rating modal */}
                {showRatingModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5">
                            <div className="text-center">
                                <div className="text-4xl mb-2">⭐</div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Como foi esta unidade?</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sua avaliação ajuda a melhorar o conteúdo</p>
                            </div>

                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRatingValue(star)}
                                        onMouseEnter={() => setRatingHover(star)}
                                        onMouseLeave={() => setRatingHover(0)}
                                        className="cursor-pointer transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-9 h-9 transition-colors ${
                                                star <= (ratingHover || ratingValue)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {ratingValue > 0 && (
                                <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][ratingValue]}
                                </p>
                            )}

                            <div className="flex gap-3 justify-end pt-1">
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    disabled={ratingSubmitting}
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
                                >
                                    Agora não
                                </button>
                                <button
                                    onClick={handleRatingSubmit}
                                    disabled={ratingSubmitting || ratingValue === 0}
                                    className="px-4 py-2 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium cursor-pointer disabled:opacity-50"
                                >
                                    {ratingSubmitting ? 'Enviando...' : 'Avaliar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NS Score completion modal */}
                {showNSModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🎉</div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Parabéns! Você concluiu o curso!</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avalie sua experiência</p>
                            </div>

                            {/* 0-10 rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nota geral do curso: <span className="text-blue-600 font-bold">{nsScore}</span>
                                </label>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {Array.from({ length: 11 }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setNsScore(i)}
                                            className={`w-9 h-9 rounded-full text-sm font-bold cursor-pointer transition-colors ${
                                                nsScore === i
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                                            }`}
                                        >
                                            {i}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* NS Score questions */}
                            {nsQuestions.length > 0 && (
                                <div className="space-y-4">
                                    {nsQuestions.map((q, i) => (
                                        <div key={q.id}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                <span
                                                    className="prose dark:prose-invert text-sm"
                                                    dangerouslySetInnerHTML={{ __html: `${i + 1}. ${q.text}` }}
                                                />
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={nsAnswers.find(a => a.questionId === q.id)?.answer ?? ''}
                                                onChange={e => setNsAnswers(prev => prev.map(a => a.questionId === q.id ? { ...a, answer: e.target.value } : a))}
                                                placeholder="Sua resposta..."
                                                className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    onClick={() => setShowNSModal(false)}
                                    disabled={nsSubmitting}
                                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
                                >
                                    Agora não
                                </button>
                                <button
                                    onClick={handleNSSubmit}
                                    disabled={nsSubmitting}
                                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer disabled:opacity-50"
                                >
                                    {nsSubmitting ? 'Enviando...' : 'Enviar avaliação'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex h-[calc(100vh-4rem)]">
                    {/* Main Content Column */}
                    <div className="flex-1 p-4 transition-all duration-300 overflow-auto scrollbar-thin">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500 text-center p-8">{error}</div>
                        ) : (
                            <div className="space-y-6">
                                {/* CONTEÚDO UNIFICADO */}
                                <CourseContent
                                    activeContent={activeContent}
                                    activeLesson={activeLesson}
                                    activeLessonData={activeLessonData}
                                    activeActivity={activeActivity}
                                    activeQuestionnaire={activeQuestionnaire}
                                    attemptCount={attemptCount}
                                    hasPassedQuestionnaire={hasPassedQuestionnaire}
                                    courseId={courseId}
                                    institutionId={infoUser.currentIdInstitution || ''}
                                    contentSectionsOrder={activeLessonData?.contentSectionsOrder || []}
                                    onVideoEnded={handleVideoEnded}
                                    handleVideoProgress={handleVideoProgress}
                                    handleNextVideo={handleNextVideo}
                                    handlePreviousVideo={handlePreviousVideo}
                                    handleCompleteLesson={handleCompleteLessonWithRating}
                                    canNavigatePrevious={canNavigatePrevious}
                                    canNavigateNext={canNavigateNext}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <CourseSidebar
                        modules={modules}
                        activeLesson={activeLesson}
                        onLessonSelect={handleLessonSelect}
                        courseId={courseId}
                        userId={infoUser.id}
                        userName={infoUser.name || 'Usuário'}
                        isLoading={isLoading}
                        error={error}
                        openModules={openModules}
                        setOpenModules={setOpenModules}
                        lessonAccess={lessonAccess}
                    />

                </div>
            </DashboardLayout>
        </ProtectedContent>
    );
}
