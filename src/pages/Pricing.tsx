import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Star, Users, TrendingUp, Zap, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedLogo } from '@/components/ui/animated-logo';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <AnimatedLogo size={24} animated={false} className="text-primary" />
              <span className="text-lg font-bold text-foreground">
                DentaLeague
              </span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

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
            <button 
              onClick={() => setIsAnnual(!isAnnual)} 
              className={`relative inline-flex w-14 h-7 items-center rounded-full transition-all duration-200 ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label="Toggle pricing period"
            >
              <span 
                className={`inline-block w-5 h-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`} 
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
          </div>
          {isAnnual && (
            <p className="text-sm text-primary font-medium flex items-center justify-center gap-1 animate-fade-in">
              <Star className="w-4 h-4" />
              Save 20% with annual billing
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div 
                key={plan.name} 
                className={cn(
                  "relative group transition-all duration-300",
                  plan.popular && "lg:scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1.5 flex items-center gap-1.5 shadow-lg text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div 
                  className={cn(
                    "relative bg-card border rounded-2xl p-8 h-full flex flex-col transition-all duration-300",
                    plan.popular 
                      ? "border-primary shadow-lg hover:shadow-xl" 
                      : "border-border hover:border-primary/50 hover:shadow-lg"
                  )}
                >
                  {/* Icon and Title */}
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-sm text-muted-foreground mt-1">
                        ${plan.price * 12} billed annually
                      </p>
                    )}
                  </div>

                  {/* Assistants Info */}
                  <div className="mb-6 pb-6 border-b border-border">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {plan.assistants}
                    </p>
                    {plan.addOnPrice > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Additional assistants: +${plan.addOnPrice}/month each
                      </p>
                    )}
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <Button 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    className="w-full font-semibold"
                    onClick={() => navigate('/signup/owner')}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <div className="bg-muted/50 rounded-2xl p-8 border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Try DentaLeague Risk-Free
            </h3>
            <p className="text-muted-foreground mb-6">
              Start with a 14-day free trial. No credit card required. Cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/signup/owner')}
                className="font-semibold"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/signin')}
                className="font-semibold"
              >
                Sign In
              </Button>
            </div>
          </div>

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
    </div>
  );
}
