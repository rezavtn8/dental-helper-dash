import { CheckCircle, BookOpen, ClipboardCheck } from 'lucide-react';

export function CleanFeatures() {
  const features = [
    {
      icon: CheckCircle,
      title: 'Role-Based Onboarding',
      description: 'Prebuilt checklists for new hires, customized by role.'
    },
    {
      icon: BookOpen,
      title: 'Built-In Training Modules',
      description: 'Sterilization protocols, front desk scripts, room setup guides, and more.'
    },
    {
      icon: ClipboardCheck,
      title: 'Smart Task Management',
      description: 'Assign, claim, and complete tasks with real-time progress tracking.'
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-secondary/20">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}