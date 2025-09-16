import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Crown, FileText } from 'lucide-react';
export function FeatureCards() {
  const features = [{
    icon: UserCheck,
    title: "Assistant Hub",
    description: "Daily tasks, one-tap done/undo, and notes.",
    bullets: ["Complete tasks with one tap", "Undo mistakes instantly", "Add quick notes to tasks"]
  }, {
    icon: Crown,
    title: "Owner Dashboard",
    description: "Create, assign, and track tasks with simple analytics.",
    bullets: ["Create recurring task templates", "Assign tasks to team members", "View completion analytics"]
  }, {
    icon: FileText,
    title: "Smart Logs",
    description: "Every change recorded for clarity and follow-up.",
    bullets: ["Automatic activity logging", "Track task completion history", "Clear audit trail for compliance"]
  }];
  
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {feature.bullets.map((bullet, i) => (
                      <li key={i}>• {bullet}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}