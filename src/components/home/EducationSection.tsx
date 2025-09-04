import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout, BookOpen } from 'lucide-react';

export function EducationSection() {
  return (
    <section className="container mx-auto py-20">
      <div className="text-center mb-16">
        <h2 className="text-[1.75rem] font-semibold mb-4 leading-[2.25rem]">
          Built-in guidance
        </h2>
        <p className="text-muted-foreground text-base leading-[1.5rem] max-w-2xl mx-auto">
          Everything your team needs to work efficiently, from templates to training
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Templates Column */}
        <Card className="border border-border shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center">
              <Layout className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-[1.375rem] font-semibold leading-[1.875rem]">
              Task templates
            </CardTitle>
            <CardDescription className="text-base leading-[1.5rem]">
              Pre-built workflows for daily and weekly routines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="font-medium text-sm mb-1">Morning Setup</div>
                <div className="text-xs text-muted-foreground">Room preparation, equipment check, supply inventory</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="font-medium text-sm mb-1">Patient Visit</div>
                <div className="text-xs text-muted-foreground">Check-in process, treatment prep, follow-up notes</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <div className="font-medium text-sm mb-1">End of Day</div>
                <div className="text-xs text-muted-foreground">Equipment cleaning, inventory update, schedule prep</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips Column */}
        <Card className="border border-border shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-[1.375rem] font-semibold leading-[1.875rem]">
              How-to tips
            </CardTitle>
            <CardDescription className="text-base leading-[1.5rem]">
              Short guidance for assistants built into the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="font-medium text-sm mb-1 text-blue-900">💡 Quick Tip</div>
                <div className="text-xs text-blue-700">Mark tasks as you complete them - it helps the whole team stay synchronized</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="font-medium text-sm mb-1 text-blue-900">📝 Best Practice</div>
                <div className="text-xs text-blue-700">Add notes to tasks when something unusual happens - future shifts will thank you</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="font-medium text-sm mb-1 text-blue-900">⚡ Pro Tip</div>
                <div className="text-xs text-blue-700">Use the undo feature if you accidentally mark something as done - no stress!</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}