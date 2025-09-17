import { Card } from '@/components/ui/card';
import { CheckCircle, Users, BarChart3, Shield, Clock, MessageSquare } from 'lucide-react';

export function BentoFeatures() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Everything your team needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for dental practices, from task management to team collaboration.
          </p>
        </div>

        <div className="bento-grid">
          {/* Main feature - Task Management */}
          <Card className="bento-item md:col-span-2 md:row-span-2 p-8">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">Smart Task Management</h3>
                  <p className="text-muted-foreground">Intelligent task distribution and tracking</p>
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div className="space-y-4">
                  {[
                    { task: "Prepare operatory 3 for 2 PM appointment", status: "completed", time: "10:30 AM" },
                    { task: "Update patient records for John Smith", status: "in-progress", time: "11:15 AM" },
                    { task: "Sterilize instruments from morning procedures", status: "pending", time: "12:00 PM" },
                  ].map((item, i) => (
                    <div key={i} className="flow-step">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.status === 'completed' ? 'bg-green-500' :
                            item.status === 'in-progress' ? 'bg-yellow-500' : 'bg-muted'
                          }`} />
                          <span className="font-medium">{item.task}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Team Collaboration */}
          <Card className="bento-item p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl font-bold">Team Sync</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Real-time collaboration between assistants and practice owners.
            </p>
            <div className="space-y-2">
              {['Dr. Smith', 'Sarah M.', 'Mike L.'].map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{name[0]}</span>
                  </div>
                  <span className="text-sm">{name}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          </Card>

          {/* Analytics */}
          <Card className="bento-item p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl font-bold">Insights</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Data-driven insights to optimize your practice efficiency.
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Task completion rate</span>
                <span className="font-bold text-green-600">98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average response time</span>
                <span className="font-bold">2.3 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Team efficiency</span>
                <span className="font-bold text-blue-600">+24%</span>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="bento-item p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl font-bold">HIPAA Secure</h3>
            </div>
            <p className="text-muted-foreground">
              Bank-level security with full HIPAA compliance built in from day one.
            </p>
          </Card>

          {/* Time Tracking */}
          <Card className="bento-item p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl font-bold">Time Tracking</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Automatic time tracking for all tasks and procedures.
            </p>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">4h 32m</div>
              <div className="text-xs text-muted-foreground">Today's productivity</div>
            </div>
          </Card>

          {/* Communication */}
          <Card className="bento-item p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl font-bold">Smart Notifications</h3>
            </div>
            <p className="text-muted-foreground">
              Gentle, contextual reminders that don't interrupt patient care.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}