import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/home/Navigation';
import { Check, ArrowRight, Star, Users, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
export default function Pricing() {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const plans = [{
    name: "Starter",
    price: isAnnual ? 79 : 99,
    assistants: "Up to 3 assistants included",
    addOnPrice: 25,
    features: ["All task management features", "Unlimited tasks & templates", "Patient tracking", "Schedule view", "Basic reports", "90-day history", "Email support"],
    icon: Users,
    popular: false
  }, {
    name: "Professional",
    price: isAnnual ? 159 : 199,
    assistants: "Up to 8 assistants included",
    addOnPrice: 20,
    features: ["Everything in Starter", "Analytics dashboard", "Performance insights", "Custom reports", "1-year history", "Data exports (Excel/PDF)", "Priority support"],
    icon: TrendingUp,
    popular: true
  }, {
    name: "Unlimited",
    price: isAnnual ? 319 : 399,
    assistants: "Unlimited assistants",
    addOnPrice: 0,
    features: ["Everything in Professional", "Unlimited history", "API access", "Multi-location dashboard", "White-label option", "Phone support", "Training included"],
    icon: Zap,
    popular: false
  }];
  return <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <Navigation />

      {/* Pricing Content */}
      <section className="container mx-auto py-12 sm:py-16 lg:py-24 px-4">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the plan that fits your clinic's needs. All plans include full access to training, tracking, and analytics.
          </p>
          
          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button onClick={() => setIsAnnual(!isAnnual)} className={`relative inline-flex w-14 h-7 items-center rounded-full transition-all duration-200 ${isAnnual ? 'bg-primary' : 'bg-muted'}`} aria-label="Toggle pricing period">
              <span className={`inline-block w-5 h-5 transform rounded-full bg-white shadow-sm transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
          </div>
          {isAnnual && <p className="text-sm text-primary font-medium flex items-center justify-center gap-1 animate-fade-in">
              <Star className="w-4 h-4" />
              Save 20% with annual billing
            </p>}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {plans.map(plan => {
          const IconComponent = plan.icon;
          return <div key={plan.name} className={cn("relative group transition-all duration-300", plan.popular && "lg:scale-105")}>
                {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1.5 shadow-lg text-xs font-semibold">
                      <Star className="w-3 h-3 fill-current" />
                      Most Popular
                    </Badge>
                  </div>}
                
                <div className={cn("relative backdrop-blur-xl bg-card/95 border-2 rounded-xl p-6 h-full flex flex-col transition-all duration-300 shadow-xl", plan.popular ? "border-primary/60 shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/80" : "border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10")}>
                  {/* Icon and Title */}
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center mb-3">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    {isAnnual && <p className="text-xs text-muted-foreground mt-1">
                        ${plan.price * 12} billed annually
                      </p>}
                  </div>

                  {/* Assistants Info */}
                  <div className="mb-4 pb-4 border-b border-border/50">
                    <p className="text-xs font-medium text-foreground mb-0.5">
                      {plan.assistants}
                    </p>
                    {plan.addOnPrice > 0 && <p className="text-xs text-muted-foreground">
                        +${plan.addOnPrice}/mo per extra assistant
                      </p>}
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-grow">
                    {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span className="text-xs text-foreground/90 leading-relaxed">{feature}</span>
                      </li>)}
                  </ul>
                  
                  {/* CTA Button */}
                  <Button variant={plan.popular ? "default" : "outline"} className="w-full font-semibold text-sm" onClick={() => navigate('/signup/owner')}>
                    Get Started
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </div>
              </div>;
        })}
        </div>

        {/* Additional Info */}
        <div className="text-center max-w-3xl mx-auto space-y-8">
          

          {/* Trust Elements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Easy Setup</p>
              <p className="text-xs text-muted-foreground mt-1">Get started in minutes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">No Lock-in</p>
              <p className="text-xs text-muted-foreground mt-1">Cancel anytime, no questions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Support Included</p>
              <p className="text-xs text-muted-foreground mt-1">Expert help when you need it</p>
            </div>
          </div>
        </div>
      </section>
    </div>;
}