import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Crown, Users } from 'lucide-react';

export function FeatureCards() {
  const features = [
    {
      icon: UserCheck,
      title: "Assistant Hub",
      description: "Daily tasks, one-tap done/undo, and notes.",
      bullets: ["Complete tasks with one tap", "Undo mistakes instantly", "Add quick notes to tasks"]
    },
    {
      icon: Users,
      title: "Front Desk",
      description: "Reception tasks, patient flow, and office coordination.",
      bullets: ["Manage front desk operations", "Handle patient scheduling", "Track office responsibilities"]
    },
    {
      icon: Crown,
      title: "Owner Dashboard",
      description: "Create, assign, and track tasks with smart analytics.",
      bullets: ["Create recurring task templates", "Assign tasks by role", "View team completion analytics"]
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Streamlined for Every Role</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Specialized dashboards and workflows designed for each team member's unique responsibilities
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
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
    </section>
  );
}