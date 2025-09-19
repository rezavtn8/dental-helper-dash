import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCourseCreation } from '@/hooks/useCourseCreation';

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ImportCourse {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  estimated_duration: number;
  modules: Array<{
    title: string;
    content: string;
    module_type: string;
    duration: number;
  }>;
  quiz?: {
    title: string;
    description: string;
    passing_score: number;
    questions: Array<{
      question: string;
      type: 'multiple_choice' | 'true_false';
      options?: string[];
      correct_answer: number | boolean;
      explanation?: string;
    }>;
  };
}

export const BulkImportDialog: React.FC<BulkImportDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [importMethod, setImportMethod] = useState<'json' | 'csv' | 'manual'>('json');
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState('');
  const [manualCourses, setManualCourses] = useState<ImportCourse[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { createCourse, createModule, createQuiz } = useCourseCreation();

  const sampleJsonStructure = {
    courses: [
      {
        title: "Sample Course",
        description: "This is a sample course description",
        category: "General",
        difficulty_level: "beginner",
        estimated_duration: 60,
        modules: [
          {
            title: "Introduction",
            content: "Welcome to this course...",
            module_type: "text",
            duration: 15
          }
        ],
        quiz: {
          title: "Course Assessment",
          description: "Test your knowledge",
          passing_score: 70,
          questions: [
            {
              question: "What is the main topic of this course?",
              type: "multiple_choice",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correct_answer: 0,
              explanation: "This explains the correct answer"
            }
          ]
        }
      }
    ]
  };

  const validateJsonData = (data: string): ImportCourse[] => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.courses || !Array.isArray(parsed.courses)) {
        throw new Error('JSON must have a "courses" array property');
      }

      // Validate each course
      parsed.courses.forEach((course: any, index: number) => {
        if (!course.title || !course.description || !course.category) {
          throw new Error(`Course ${index + 1}: Missing required fields (title, description, category)`);
        }
        if (!course.modules || !Array.isArray(course.modules) || course.modules.length === 0) {
          throw new Error(`Course ${index + 1}: Must have at least one module`);
        }
      });

      return parsed.courses;
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
  };

  const validateCsvData = (data: string): ImportCourse[] => {
    try {
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['title', 'description', 'category', 'difficulty_level', 'module_titles', 'module_contents'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required CSV columns: ${missingHeaders.join(', ')}`);
      }

      const courses: ImportCourse[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const course: any = {};
        
        headers.forEach((header, index) => {
          course[header] = values[index] || '';
        });

        // Parse modules from pipe-separated values
        const moduleTitles = course.module_titles.split('|').map(t => t.trim());
        const moduleContents = course.module_contents.split('|').map(c => c.trim());
        
        if (moduleTitles.length !== moduleContents.length) {
          throw new Error(`Course ${i}: Module titles and contents count mismatch`);
        }

        courses.push({
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty_level: course.difficulty_level || 'beginner',
          estimated_duration: parseInt(course.estimated_duration) || 60,
          modules: moduleTitles.map((title, idx) => ({
            title,
            content: moduleContents[idx],
            module_type: 'text',
            duration: 15
          }))
        });
      }

      return courses;
    } catch (error) {
      throw new Error(`CSV parsing error: ${error.message}`);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setImportProgress(0);
      setImportErrors([]);

      let coursesToImport: ImportCourse[] = [];

      // Parse data based on import method
      switch (importMethod) {
        case 'json':
          coursesToImport = validateJsonData(jsonData);
          break;
        case 'csv':
          coursesToImport = validateCsvData(csvData);
          break;
        case 'manual':
          coursesToImport = manualCourses;
          break;
      }

      if (coursesToImport.length === 0) {
        throw new Error('No courses to import');
      }

      const errors: string[] = [];
      let successCount = 0;

      // Import each course
      for (let i = 0; i < coursesToImport.length; i++) {
        const course = coursesToImport[i];
        setImportProgress(((i + 1) / coursesToImport.length) * 100);

        try {
          // Create course
          const courseId = await createCourse({
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty_level: course.difficulty_level,
            course_type: 'course',
            estimated_duration: course.estimated_duration
          });

          if (!courseId) {
            throw new Error('Failed to create course');
          }

          // Create modules
          for (let j = 0; j < course.modules.length; j++) {
            const module = course.modules[j];
            await createModule(courseId, {
              ...module,
              module_order: j + 1
            });
          }

          // Create quiz if exists
          if (course.quiz) {
            await createQuiz(courseId, null, {
              ...course.quiz,
              questions: course.quiz.questions.map((q, idx) => ({
                ...q,
                id: idx + 1
              }))
            });
          }

          successCount++;
        } catch (error) {
          errors.push(`Course "${course.title}": ${error.message}`);
        }
      }

      setImportErrors(errors);

      if (successCount > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${successCount} of ${coursesToImport.length} courses`,
        });
        
        if (successCount === coursesToImport.length) {
          onSuccess?.();
          onClose();
        }
      } else {
        toast({
          title: "Import Failed",
          description: "No courses were successfully imported",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const addManualCourse = () => {
    setManualCourses([...manualCourses, {
      title: '',
      description: '',
      category: 'General',
      difficulty_level: 'beginner',
      estimated_duration: 60,
      modules: [
        {
          title: 'Introduction',
          content: '',
          module_type: 'text',
          duration: 15
        }
      ]
    }]);
  };

  const removeManualCourse = (index: number) => {
    setManualCourses(manualCourses.filter((_, i) => i !== index));
  };

  const updateManualCourse = (index: number, field: string, value: any) => {
    const updated = [...manualCourses];
    updated[index] = { ...updated[index], [field]: value };
    setManualCourses(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Courses
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="json">JSON Import</TabsTrigger>
              <TabsTrigger value="csv">CSV Import</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="json" className="space-y-4">
                <div className="space-y-2">
                  <Label>JSON Data</Label>
                  <Textarea
                    placeholder="Paste your JSON data here..."
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Sample JSON Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(sampleJsonStructure, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="csv" className="space-y-4">
                <div className="space-y-2">
                  <Label>CSV Data</Label>
                  <Textarea
                    placeholder="title,description,category,difficulty_level,estimated_duration,module_titles,module_contents
Sample Course,A sample course description,General,beginner,60,Introduction|Main Content,Welcome to the course...|Here is the main content..."
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">CSV Format Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Required columns:</strong> title, description, category, difficulty_level, module_titles, module_contents</p>
                    <p><strong>Optional columns:</strong> estimated_duration</p>
                    <p><strong>Note:</strong> Use pipe (|) to separate multiple modules in module_titles and module_contents</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Manual Course Entry</h3>
                  <Button onClick={addManualCourse} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </div>

                {manualCourses.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No courses added yet</p>
                      <Button onClick={addManualCourse} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Course
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {manualCourses.map((course, index) => (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm">Course {index + 1}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeManualCourse(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={course.title}
                                onChange={(e) => updateManualCourse(index, 'title', e.target.value)}
                                placeholder="Course title"
                              />
                            </div>
                            <div>
                              <Label>Category</Label>
                              <Input
                                value={course.category}
                                onChange={(e) => updateManualCourse(index, 'category', e.target.value)}
                                placeholder="Course category"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={course.description}
                              onChange={(e) => updateManualCourse(index, 'description', e.target.value)}
                              placeholder="Course description"
                              rows={3}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Importing courses...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          {/* Import Errors */}
          {importErrors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Import Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  {importErrors.map((error, index) => (
                    <li key={index} className="text-destructive">{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isImporting || (
                importMethod === 'json' && !jsonData.trim() ||
                importMethod === 'csv' && !csvData.trim() ||
                importMethod === 'manual' && manualCourses.length === 0
              )}
            >
              {isImporting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Courses
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};