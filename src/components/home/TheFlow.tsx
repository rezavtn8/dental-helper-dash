import { Card } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Clock, User } from 'lucide-react';
import { useState } from 'react';

export function TheFlow() {
  const [activeStep, setActiveStep] = useState(0);
  
  const flowSteps = [
    {
      id: 1,
      title: "Morning Setup",
      description: "Assistant receives automated daily task list",
      user: "Assistant",
      time: "8:00 AM",
      tasks: ["Prepare operatories", "Check equipment", "Review appointments"]
    },
    {
      id: 2,
      title: "Real-time Updates", 
      description: "Tasks update automatically as work progresses",
      user: "System",
      time: "Throughout day",
      tasks: ["Auto-mark completed tasks", "Send gentle reminders", "Update priorities"]
    },
    {
      id: 3,
      title: "Owner Oversight",
      description: "Practice owner sees progress in real-time dashboard", 
      user: "Owner",
      time: "Anytime",
      tasks: ["View team progress", "Adjust priorities", "Analyze efficiency"]
    },
    {
      id: 4,
      title: "End of Day",
      description: "Automatic summary and next-day preparation",
      user: "System", 
      time: "6:00 PM",
      tasks: ["Generate reports", "Prepare tomorrow's tasks", "Archive completed work"]
    }
  ];

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            The Flow
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how DentaLeague orchestrates perfect teamwork from morning setup to end-of-day reporting.
          </p>
        </div>

        <div className="interactive-flow p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {flowSteps.map((step, index) => (
              <Card 
                key={step.id}
                className={`flow-step cursor-pointer transition-all duration-300 ${
                  activeStep === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{step.id}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{step.time}</div>
                    </div>
                    {index < flowSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium">{step.user}</span>
                    </div>
                  </div>

                  {activeStep === index && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      {step.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs">{task}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Average setup time: Under 5 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}