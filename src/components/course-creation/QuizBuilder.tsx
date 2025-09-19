import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Plus, 
  Trash2, 
  HelpCircle, 
  Clock, 
  Award,
  CheckCircle,
  X,
  Edit3,
  Save
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false';
  options?: string[];
  correct_answer: number | boolean;
  explanation?: string;
}

interface QuizData {
  title: string;
  description: string;
  passing_score: number;
  attempts_allowed: number;
  time_limit?: number;
  questions: QuizQuestion[];
}

interface QuizBuilderProps {
  quiz: QuizData | null;
  onQuizChange: (quiz: QuizData | null) => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  quiz,
  onQuizChange
}) => {
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const createNewQuiz = () => {
    const newQuiz: QuizData = {
      title: 'Course Assessment',
      description: 'Test your knowledge of the course material',
      passing_score: 70,
      attempts_allowed: 3,
      time_limit: 15,
      questions: []
    };
    onQuizChange(newQuiz);
  };

  const removeQuiz = () => {
    onQuizChange(null);
  };

  const addQuestion = () => {
    if (!quiz) return;
    
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      question: '',
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 0,
      explanation: ''
    };
    
    const updatedQuiz = {
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    };
    onQuizChange(updatedQuiz);
    setEditingQuestionIndex(quiz.questions.length);
    setEditingQuestion({ ...newQuestion });
  };

  const removeQuestion = (index: number) => {
    if (!quiz) return;
    
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    onQuizChange({ ...quiz, questions: updatedQuestions });
    
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setEditingQuestion(null);
    }
  };

  const startEditingQuestion = (index: number) => {
    if (!quiz) return;
    setEditingQuestionIndex(index);
    setEditingQuestion({ ...quiz.questions[index] });
  };

  const saveQuestion = () => {
    if (!quiz || editingQuestionIndex === null || !editingQuestion) return;
    
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[editingQuestionIndex] = editingQuestion;
    onQuizChange({ ...quiz, questions: updatedQuestions });
    setEditingQuestionIndex(null);
    setEditingQuestion(null);
  };

  const cancelEditingQuestion = () => {
    setEditingQuestionIndex(null);
    setEditingQuestion(null);
  };

  const updateQuizSettings = (updates: Partial<QuizData>) => {
    if (!quiz) return;
    onQuizChange({ ...quiz, ...updates });
  };

  if (!quiz) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent mb-2">
            Course Assessment
          </h3>
          <p className="text-muted-foreground">
            Add a quiz to test your students' knowledge
          </p>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-semibold text-lg mb-2">No assessment created</h4>
            <p className="text-muted-foreground mb-4">
              Create a quiz to test your students' understanding of the course material
            </p>
            <Button onClick={createNewQuiz} className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Course Assessment
          </h3>
          <p className="text-muted-foreground">
            Configure your quiz settings and questions
          </p>
        </div>
        <Button variant="outline" onClick={removeQuiz} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Quiz
        </Button>
      </div>

      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quiz Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                value={quiz.title}
                onChange={(e) => updateQuizSettings({ title: e.target.value })}
                placeholder="Enter quiz title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="passing-score">Passing Score (%)</Label>
              <Input
                id="passing-score"
                type="number"
                min="0"
                max="100"
                value={quiz.passing_score}
                onChange={(e) => updateQuizSettings({ passing_score: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="attempts">Attempts Allowed</Label>
              <Input
                id="attempts"
                type="number"
                min="1"
                max="10"
                value={quiz.attempts_allowed}
                onChange={(e) => updateQuizSettings({ attempts_allowed: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="time-limit">Time Limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                min="0"
                value={quiz.time_limit || ''}
                onChange={(e) => updateQuizSettings({ time_limit: parseInt(e.target.value) || undefined })}
                placeholder="No limit"
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="quiz-description">Description</Label>
            <Textarea
              id="quiz-description"
              value={quiz.description}
              onChange={(e) => updateQuizSettings({ description: e.target.value })}
              placeholder="Describe what this quiz covers"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Questions ({quiz.questions.length})
            </CardTitle>
            <Button onClick={addQuestion} size="sm" className="bg-gradient-to-r from-learning-quiz to-purple-500 hover:from-learning-quiz/90 hover:to-purple-500/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.questions.length === 0 ? (
            <div className="text-center py-8 border-dashed border-2 rounded-lg">
              <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No questions added yet</p>
              <Button onClick={addQuestion} variant="outline" className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add First Question
              </Button>
            </div>
          ) : (
            quiz.questions.map((question, index) => {
              const isEditing = editingQuestionIndex === index;
              
              return (
                <Card 
                  key={question.id}
                  className={`${isEditing ? 'ring-2 ring-primary shadow-lg' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant={question.type === 'multiple_choice' ? 'default' : 'secondary'}>
                          {question.type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingQuestion(index)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isEditing && editingQuestion ? (
                    <CardContent className="space-y-4 border-t pt-4">
                      <div>
                        <Label>Question Type</Label>
                        <Select
                          value={editingQuestion.type}
                          onValueChange={(value: 'multiple_choice' | 'true_false') => {
                            const updatedQuestion = { ...editingQuestion, type: value };
                            if (value === 'true_false') {
                              updatedQuestion.options = undefined;
                              updatedQuestion.correct_answer = true;
                            } else {
                              updatedQuestion.options = ['Option A', 'Option B', 'Option C', 'Option D'];
                              updatedQuestion.correct_answer = 0;
                            }
                            setEditingQuestion(updatedQuestion);
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Question Text</Label>
                        <Textarea
                          value={editingQuestion.question}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                          placeholder="Enter your question"
                          className="mt-1"
                        />
                      </div>
                      
                      {editingQuestion.type === 'multiple_choice' && editingQuestion.options && (
                        <div>
                          <Label>Answer Options</Label>
                          <div className="space-y-2 mt-1">
                            <RadioGroup
                              value={editingQuestion.correct_answer.toString()}
                              onValueChange={(value) => setEditingQuestion({ 
                                ...editingQuestion, 
                                correct_answer: parseInt(value) 
                              })}
                            >
                              {editingQuestion.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <RadioGroupItem value={optionIndex.toString()} id={`option-${optionIndex}`} />
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const updatedOptions = [...editingQuestion.options!];
                                      updatedOptions[optionIndex] = e.target.value;
                                      setEditingQuestion({ ...editingQuestion, options: updatedOptions });
                                    }}
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    className="flex-1"
                                  />
                                  <div className="text-xs text-muted-foreground min-w-fit">
                                    {editingQuestion.correct_answer === optionIndex && (
                                      <CheckCircle className="h-4 w-4 text-success" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>
                      )}
                      
                      {editingQuestion.type === 'true_false' && (
                        <div>
                          <Label>Correct Answer</Label>
                          <RadioGroup
                            value={editingQuestion.correct_answer.toString()}
                            onValueChange={(value) => setEditingQuestion({ 
                              ...editingQuestion, 
                              correct_answer: value === 'true' 
                            })}
                            className="mt-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="true" />
                              <Label htmlFor="true">True</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="false" />
                              <Label htmlFor="false">False</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                      
                      <div>
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          value={editingQuestion.explanation || ''}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                          placeholder="Explain why this is the correct answer"
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 pt-4 border-t">
                        <Button onClick={saveQuestion} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save Question
                        </Button>
                        <Button variant="outline" onClick={cancelEditingQuestion} size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="font-medium">{question.question || 'No question text'}</p>
                        {question.type === 'multiple_choice' && question.options && (
                          <div className="space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <div 
                                key={optionIndex}
                                className={`flex items-center gap-2 text-sm p-2 rounded ${
                                  question.correct_answer === optionIndex 
                                    ? 'bg-success/10 text-success border border-success/20' 
                                    : 'bg-muted/50'
                                }`}
                              >
                                <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                <span>{option}</span>
                                {question.correct_answer === optionIndex && (
                                  <CheckCircle className="h-4 w-4 ml-auto" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'true_false' && (
                          <div className="flex items-center gap-2 text-sm">
                            <span>Correct answer:</span>
                            <Badge variant={question.correct_answer ? 'default' : 'secondary'}>
                              {question.correct_answer ? 'True' : 'False'}
                            </Badge>
                          </div>
                        )}
                        {question.explanation && (
                          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Quiz Summary */}
      {quiz.questions.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4" />
                  <span>{quiz.questions.length} questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{quiz.passing_score}% to pass</span>
                </div>
                {quiz.time_limit && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.time_limit} min limit</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};