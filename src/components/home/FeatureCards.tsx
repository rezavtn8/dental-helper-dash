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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground text-lg">Simple tools that make dental practice management effortless</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
                        {bullet}
                      </li>
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