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
  return;
}