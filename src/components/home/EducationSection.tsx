import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Files, BookOpen, Users, UserCheck, Crown } from 'lucide-react';

export function EducationSection() {
  const educationItems = [
    {
      icon: UserCheck,
      title: "Assistant Training",
      description: "Master daily task workflows and patient care protocols",
      topics: [
        "Task claiming and completion",
        "Patient interaction guidelines", 
        "Quality control checklists",
        "Progress tracking"
      ]
    },
    {
      icon: Users,
      title: "Front Desk Excellence",
      description: "Streamline reception operations and patient experience",
      topics: [
        "Patient scheduling systems",
        "Office coordination tasks",
        "Communication protocols",
        "Administrative workflows"
      ]
    },
    {
      icon: Crown,
      title: "Leadership Resources",
      description: "Effective team management and clinic optimization",
      topics: [
        "Template creation strategies",
        "Performance analytics",
        "Team coordination",
        "SOP development"
      ]
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Role-Specific Training</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive guides and best practices tailored to each team member's responsibilities
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {educationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors group h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-foreground mb-3">Key Topics:</h4>
                    <ul className="space-y-2">
                      {item.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-start text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 mt-2 flex-shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}