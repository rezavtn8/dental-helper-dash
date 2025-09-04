import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Crown, FileText } from 'lucide-react';

export function FeatureCards() {
  const features = [
    {
      icon: UserCheck,
      title: "Assistant Hub",
      description: "Daily tasks, one-tap done/undo, and notes.",
      bullets: [
        "Complete tasks with one tap",
        "Undo mistakes instantly", 
        "Add quick notes to tasks"
      ]
    },
    {
      icon: Crown,
      title: "Owner Dashboard",
      description: "Create, assign, and track tasks with simple analytics.",
      bullets: [
        "Create recurring task templates",
        "Assign tasks to team members",
        "View completion analytics"
      ]
    },
    {
      icon: FileText,
      title: "Smart Logs", 
      description: "Every change recorded for clarity and follow-up.",
      bullets: [
        "Automatic activity logging",
        "Track task completion history",
        "Clear audit trail for compliance"
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <Card key={feature.title} className="glass-card hover:shadow-lg transition-all duration-300 h-full glow-effect group">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <feature.icon className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-[1.375rem] font-semibold mb-2 leading-[1.875rem]">
              {feature.title}
            </CardTitle>
            <CardDescription className="text-base leading-[1.5rem]">
              {feature.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {feature.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground leading-[1.125rem]">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}