import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, FileText, ExternalLink, Clock, CheckCircle } from 'lucide-react';

const learningResources = [
  {
    id: 1,
    title: "HIPAA Compliance Fundamentals",
    description: "Essential training on patient privacy and data protection requirements.",
    type: "course",
    duration: "45 min",
    status: "available",
    category: "Compliance"
  },
  {
    id: 2,
    title: "CPR & First Aid Certification",
    description: "Learn life-saving techniques and emergency response procedures.",
    type: "certification",
    duration: "2 hours",
    status: "in-progress",
    category: "Safety"
  },
  {
    id: 3,
    title: "Dental Assistant Best Practices",
    description: "Advanced techniques and protocols for dental assistance.",
    type: "guide",
    duration: "30 min",
    status: "completed",
    category: "Clinical"
  },
  {
    id: 4,
    title: "Patient Communication Skills",
    description: "Improve your communication and patient care abilities.",
    type: "course",
    duration: "1 hour",
    status: "available",
    category: "Soft Skills"
  },
  {
    id: 5,
    title: "Infection Control Protocols",
    description: "Stay updated on the latest infection prevention methods.",
    type: "course",
    duration: "40 min",
    status: "available",
    category: "Safety"
  },
  {
    id: 6,
    title: "OSHA Workplace Safety",
    description: "Comprehensive workplace safety training and guidelines.",
    type: "certification",
    duration: "90 min",
    status: "available",
    category: "Compliance"
  }
];

const categories = ["All", "Compliance", "Safety", "Clinical", "Soft Skills"];

export default function LearningTab() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  
  const filteredResources = selectedCategory === "All" 
    ? learningResources 
    : learningResources.filter(resource => resource.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'available':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return Play;
      case 'certification':
        return BookOpen;
      case 'guide':
        return FileText;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              Learning & Education
            </h1>
            <p className="text-blue-700">
              Expand your skills with courses, certifications, and resources.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <BookOpen className="w-3 h-3 mr-1" />
              6 Resources Available
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">1</p>
                <p className="text-sm text-green-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">1</p>
                <p className="text-sm text-blue-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">4</p>
                <p className="text-sm text-purple-600">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Learning Resources</CardTitle>
          <CardDescription>
            Select a category to filter resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource) => {
              const Icon = getTypeIcon(resource.type);
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-slate-600" />
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(resource.status)}`}>
                        {resource.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm">
                      {resource.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{resource.duration}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {resource.category}
                        </Badge>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant={resource.status === 'completed' ? 'outline' : 'default'}
                        className={resource.status !== 'completed' ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {resource.status === 'completed' ? 'Review' : 
                         resource.status === 'in-progress' ? 'Continue' : 'Start'}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">More Resources Coming Soon</h3>
          <p className="text-slate-600 mb-4">
            We're constantly adding new learning materials and certification opportunities.
          </p>
          <Badge variant="outline" className="text-slate-600">
            New content added monthly
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}