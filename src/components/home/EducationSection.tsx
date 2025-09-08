import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Files, BookOpen } from 'lucide-react';
export function EducationSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Educational Resources</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Files className="h-5 w-5" />
                Training Materials
              </CardTitle>
              <CardDescription>
                Comprehensive guides and documentation for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access step-by-step tutorials, best practices, and workflow guides.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>
                Learn about dental practice management and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explore articles on improving efficiency and patient care.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}