import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Files, BookOpen } from 'lucide-react';
export function EducationSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Learning Resources
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive guides and documentation for your team
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Files className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Complete guides for setup, workflows, and best practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Step-by-step tutorials, API references, and troubleshooting guides to get your clinic running smoothly.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Training Materials</CardTitle>
              <CardDescription>
                Educational content for staff onboarding and ongoing training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Video tutorials, webinars, and interactive training modules designed for veterinary professionals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}