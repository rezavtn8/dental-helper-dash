import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Award, 
  Clock, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CourseTemplate } from '@/hooks/useCourseCreation';

interface TemplateSelectorProps {
  templates: CourseTemplate[];
  selectedTemplate: CourseTemplate | null;
  onTemplateSelect: (template: CourseTemplate | null) => void;
  onSkip: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onSkip
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-learning-beginner text-white';
      case 'intermediate': return 'bg-learning-intermediate text-white';
      case 'advanced': return 'bg-learning-advanced text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Certification': return Award;
      case 'Medical': return Users;
      default: return BookOpen;
    }
  };

  const getCategoryGradient = (category: string) => {
    const gradients = {
      'General': 'from-blue-500 to-blue-600',
      'Medical': 'from-learning-success to-emerald-600',
      'Technology': 'from-learning-quiz to-purple-600',
      'Certification': 'from-learning-achievement to-orange-600',
      'Skills': 'from-pink-500 to-pink-600'
    };
    return gradients[category as keyof typeof gradients] || 'from-blue-500 to-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-learning-achievement" />
          <span className="bg-gradient-to-r from-learning-quiz to-primary bg-clip-text text-transparent">
            Choose Your Starting Point
          </span>
        </div>
        <p className="text-muted-foreground">
          Select a template to get started quickly, or start from scratch
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Start from Scratch Option */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-dashed border-2 ${
            selectedTemplate === null ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
          }`}
          onClick={() => onTemplateSelect(null)}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-muted to-muted-dark rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Start from Scratch</h3>
              <p className="text-sm text-muted-foreground">
                Build your course completely from the ground up with full creative control
              </p>
            </div>
            <Badge variant="outline" className="w-fit mx-auto">
              Custom
            </Badge>
          </CardContent>
        </Card>

        {/* Template Options */}
        {templates.map((template) => {
          const CategoryIcon = getCategoryIcon(template.category);
          const isSelected = selectedTemplate?.id === template.id;
          const totalDuration = template.template_data?.modules?.reduce((sum, mod) => sum + (mod.duration || 0), 0) || 0;
          const moduleCount = template.template_data?.modules?.length || 0;
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              {/* Category Gradient Strip */}
              <div className={`h-1 bg-gradient-to-r ${getCategoryGradient(template.category)}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryGradient(template.category)}`}>
                    <CategoryIcon className="h-5 w-5 text-white" />
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty_level)}>
                    {template.difficulty_level}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">
                  {template.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{totalDuration} min</span>
                  </div>
                  <Badge variant="outline">{template.category}</Badge>
                </div>

                 <div className="space-y-2">
                   <div className="text-sm font-medium">Includes:</div>
                   <div className="space-y-1">
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <BookOpen className="h-3 w-3" />
                       <span>{moduleCount} modules</span>
                     </div>
                     {template.template_data?.quiz && (
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <Award className="h-3 w-3" />
                         <span>Assessment quiz</span>
                       </div>
                     )}
                   </div>
                 </div>

                {isSelected && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <Sparkles className="h-4 w-4" />
                      Selected Template
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Skip Option */}
      <div className="text-center pt-4">
        <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
          Skip template selection
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};