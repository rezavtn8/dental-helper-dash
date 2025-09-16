import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Files, BookOpen } from 'lucide-react';
export function EducationSection() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <Files className="w-8 h-8 mx-auto mb-4 text-primary" />
              <CardTitle>Quick Setup</CardTitle>
              <CardDescription>
                Get your clinic running in minutes with our simple setup process.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BookOpen className="w-8 h-8 mx-auto mb-4 text-primary" />
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Learn proven workflows that dental teams use to stay organized.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}