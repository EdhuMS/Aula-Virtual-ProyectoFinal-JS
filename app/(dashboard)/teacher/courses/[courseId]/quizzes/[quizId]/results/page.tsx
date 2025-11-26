import QuizResultsView from "./quiz-results-view";

export default function QuizResultsPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
    return <QuizResultsView params={params} />;
}
