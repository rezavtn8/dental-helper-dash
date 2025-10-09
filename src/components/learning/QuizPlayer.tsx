import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Trophy,
  RotateCcw
} from 'lucide-react';
import { useLearningQuizzes } from '@/hooks/useLearning';

interface QuizPlayerProps {
  courseId?: string;
  moduleId?: string;
  onComplete: (passed: boolean) => void;
  onBack: () => void;
}

interface Question {
  id: string | number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: number | boolean;
  explanation?: string;
  points?: number;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ 
  courseId, 
  moduleId, 
  onComplete, 
  onBack 
}) => {
  const { quizzes, loading, submitQuizAttempt, getQuizAttempts, getBestScore } = useLearningQuizzes(courseId, moduleId);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: any}>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  const quiz = quizzes[currentQuiz];
  const questions: Question[] = quiz?.questions || [];
  const question = questions[currentQuestion];

  // Timer effect
  useEffect(() => {
    if (!quiz?.time_limit || !quizStartTime || showResults) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
      const remaining = (quiz.time_limit * 60) - elapsed;
      
      if (remaining <= 0) {
        handleSubmitQuiz();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, quizStartTime, showResults]);

  const startQuiz = () => {
    setQuizStartTime(Date.now());
    setTimeLeft(quiz?.time_limit ? quiz.time_limit * 60 : null);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (value: string) => {
    const answerValue = question.type === 'true_false' ? value === 'true' : parseInt(value);
    setAnswers(prev => ({
      ...prev,
      [question.id]: answerValue
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quizStartTime) return;

    const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000);
    const score = calculateScore();
    
    console.log('Submitting quiz with score:', score);
    const result = await submitQuizAttempt(quiz.id, answers, score, timeTaken);
    console.log('Quiz submission result:', result);
    
    if (result) {
      setQuizResults({ ...result, score, timeTaken });
      setShowResults(true);
    }
  };

  const handleRetakeQuiz = () => {
    startQuiz();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No quiz available for this content.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Quiz results view
  if (showResults && quizResults) {
    const passed = quizResults.passed;
    const attempts = getQuizAttempts(quiz.id);
    const bestScore = getBestScore(quiz.id);
    
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-card to-surface-subtle border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${
              passed 
                ? 'bg-gradient-to-r from-learning-success to-emerald-400 animate-achievement-burst' 
                : 'bg-gradient-to-r from-learning-advanced to-red-500 animate-pulse'
            }`}>
              {passed ? <Trophy className="h-10 w-10 text-white" /> : <XCircle className="h-10 w-10 text-white" />}
            </div>
            <CardTitle className="text-3xl font-bold mb-2">
              <span className={`bg-gradient-to-r ${
                passed 
                  ? 'from-learning-success to-emerald-400' 
                  : 'from-learning-advanced to-red-500'
              } bg-clip-text text-transparent`}>
                {passed ? 'Congratulations!' : 'Quiz Not Passed'}
              </span>
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              {passed 
                ? 'You have successfully completed the quiz and earned your achievement!' 
                : `You need ${quiz.passing_score}% to pass this quiz. Keep practicing!`}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-3xl font-bold">{quizResults.score}%</div>
                <Progress value={quizResults.score} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">Time Taken</div>
                  <div className="text-muted-foreground">{formatTime(quizResults.timeTaken)}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Best Score</div>
                  <div className="text-muted-foreground">{bestScore}%</div>
                </div>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="font-semibold">Review Your Answers</h3>
              {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;
                
                return (
                  <Card key={q.id} className={`border-l-4 ${
                    isCorrect ? 'border-l-success' : 'border-l-destructive'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        )}
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">Question {index + 1}</p>
                          <p className="text-sm">{q.question}</p>
                          
                          {q.options && q.options.length > 0 && (
                            <div className="space-y-1 text-sm">
                              <p className="text-muted-foreground">
                                Your answer: {q.options[userAnswer as number] || 'No answer'}
                              </p>
                              {!isCorrect && (
                                <p className="text-success">
                                  Correct answer: {q.options[q.correctAnswer as number]}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {q.type === 'true_false' && (
                            <div className="space-y-1 text-sm">
                              <p className="text-muted-foreground">
                                Your answer: {userAnswer ? 'True' : 'False'}
                              </p>
                              {!isCorrect && (
                                <p className="text-success">
                                  Correct answer: {q.correctAnswer ? 'True' : 'False'}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {q.explanation && (
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              
              <div className="flex gap-2">
                {!passed && attempts.length < quiz.attempts_allowed && (
                  <Button onClick={handleRetakeQuiz} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz ({quiz.attempts_allowed - attempts.length} attempts left)
                  </Button>
                )}
                <Button onClick={() => onComplete(passed)}>
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz start view
  if (!quizStartTime) {
    const attempts = getQuizAttempts(quiz.id);
    const bestScore = getBestScore(quiz.id);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {quiz.title}
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </CardTitle>
            <p className="text-muted-foreground">{quiz.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-medium">Questions</div>
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Passing Score</div>
                <div className="text-2xl font-bold text-primary">{quiz.passing_score}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Time Limit</div>
                <div className="text-2xl font-bold text-primary">
                  {quiz.time_limit ? `${quiz.time_limit} min` : 'No limit'}
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium">Attempts</div>
                <div className="text-2xl font-bold text-primary">
                  {attempts.length}/{quiz.attempts_allowed}
                </div>
              </div>
            </div>

            {bestScore > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Your Best Score</span>
                  <Badge variant={bestScore >= quiz.passing_score ? "default" : "secondary"}>
                    {bestScore}%
                  </Badge>
                </div>
              </div>
            )}

            <Button 
              onClick={startQuiz} 
              className="w-full" 
              disabled={attempts.length >= quiz.attempts_allowed}
            >
              {attempts.length >= quiz.attempts_allowed 
                ? 'No attempts remaining' 
                : attempts.length > 0 
                  ? 'Retake Quiz' 
                  : 'Start Quiz'
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz question view
  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Badge variant={timeLeft < 300 ? "destructive" : "outline"}>
              {formatTime(timeLeft)}
            </Badge>
          </div>
        )}
      </div>

      {/* Progress */}
      <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Question {currentQuestion + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed">{question.question}</p>
          
          <div className="space-y-4">
            {question.options && question.options.length > 0 && (
              <RadioGroup 
                value={answers[question.id]?.toString() || ''} 
                onValueChange={handleAnswerSelect}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 text-sm leading-relaxed">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {!question.options && question.type === 'true_false' && (
              <RadioGroup 
                value={answers[question.id]?.toString() || ''} 
                onValueChange={handleAnswerSelect}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <Button 
              onClick={handleNextQuestion}
              disabled={answers[question.id] === undefined}
            >
              {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};