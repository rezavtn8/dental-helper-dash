import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Users, Settings } from 'lucide-react';

export function ThreeRoles() {
  const roles = [
    {
      icon: UserCheck,
      title: "Assistant Hub",
      description: "task claiming, checklists, daily flow",
      features: [
        "Claim and complete daily tasks",
        "Follow structured checklists",
        "Track personal progress",
        "Quick task updates"
      ]
    },
    {
      icon: Users,
      title: "Front Desk Panel",
      description: "onboarding, office tasks, notes",
      features: [
        "Complete onboarding flows",
        "Manage office responsibilities",
        "Add patient notes",
        "Handle scheduling tasks"
      ]
    },
    {
      icon: Settings,
      title: "Admin Dashboard",
      description: "templates, SOP tracking, analytics",
      features: [
        "Create task templates",
        "Track SOP compliance",
        "View team analytics",
        "Manage staff assignments"
      ]
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">Built for Everyone on Your Team</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Tailored workflows and interfaces for every role in your dental practice
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-foreground">{role.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 sm:space-y-3">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 sm:mr-3 mt-1.5 sm:mt-2 flex-shrink-0" />
                        {feature}
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