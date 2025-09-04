import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight } from 'lucide-react';

export function PricingCTA() {
  const features = [
    "Unlimited assistants (starter)",
    "Task templates",
    "Basic analytics"
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="container mx-auto py-20">
      <Card className="max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-[1.75rem] font-semibold mb-4 leading-[2.25rem]">
            Start free. Upgrade when ready.
          </CardTitle>
          <CardDescription className="text-base leading-[1.5rem]">
            Everything you need to get your dental team organized
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
                {index < features.length - 1 && <span className="text-muted-foreground">•</span>}
              </div>
            ))}
          </div>

          <Button 
            size="lg"
            onClick={() => scrollToSection('auth-section')}
            className="rounded-full h-12 px-8 text-base font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Create your clinic
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}