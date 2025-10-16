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
    popular: false,
    gradient: "from-slate-600 to-slate-700",
    bgStyle: "var(--gradient-starter)"
  }, {
    name: "Professional",
    price: isAnnual ? 159 : 199,
    assistants: "Up to 8 assistants included",
    addOnPrice: 20,
    features: ["Everything in Starter", "Analytics dashboard", "Performance insights", "Custom reports", "1-year history", "Data exports (Excel/PDF)", "Priority support"],
    icon: TrendingUp,
    popular: true,
    gradient: "from-cyan-500 to-cyan-600",
    bgStyle: "var(--gradient-pro)"
  }, {
    name: "Unlimited",
    price: isAnnual ? 319 : 399,
    assistants: "Unlimited assistants",
    addOnPrice: 0,
    features: ["Everything in Professional", "Unlimited history", "API access", "Multi-location dashboard", "White-label option", "Phone support", "Training included"],
    icon: Zap,
    popular: false,
    gradient: "from-purple-500 to-purple-600",
    bgStyle: "var(--gradient-unlimited)"
  }];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <AnimatedLogo size={28} animated={false} className="text-primary" />
              <span className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                DentaLeague
              </span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm font-medium flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Pricing Content */}
      <section className="container mx-auto py-12 sm:py-16 lg:py-20 px-4">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Choose Your Plan
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
            Flexible pricing that grows with your clinic
          </p>
          
          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)} 
              className={`relative inline-flex w-12 h-6 items-center rounded-full transition-colors ${isAnnual ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
          </div>
          {isAnnual && <p className="text-sm text-primary font-medium">Save 20% with annual billing</p>}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div 
                key={plan.name} 
                className={cn(
                  "relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-102 hover:shadow-lg group cursor-pointer",
                  plan.popular ? "scale-102 shadow-md" : ""
                )}
                style={{ background: plan.bgStyle }}
              >
                {/* Animated Background Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                  <div 
                    className="absolute w-24 h-24 rounded-full opacity-10 transition-all duration-700 group-hover:animate-[pricing-float_4s_ease-in-out_infinite]"
                    style={{ 
                      background: 'rgba(255,255,255,0.15)',
                      top: '-15px',
                      right: '-15px'
                    }}
                  />
                  <div 
                    className="absolute w-16 h-16 opacity-8 transition-all duration-700 group-hover:animate-[pricing-pulse_3s_ease-in-out_infinite]"
                    style={{ 
                      background: 'rgba(255,255,255,0.12)',
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      bottom: '15px',
                      left: '-8px'
                    }}
                  />
                  <div 
                    className="absolute w-14 h-14 rounded-full opacity-12 transition-all duration-700 group-hover:animate-[pricing-float_5s_ease-in-out_infinite_reverse]"
                    style={{ 
                      background: 'rgba(255,255,255,0.18)',
                      bottom: '40px',
                      right: '20px'
                    }}
                  />
                </div>

                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-white text-gray-700 px-3 py-1 flex items-center gap-1 shadow-md text-xs">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="relative z-10 p-6">
                  <div className="text-center mb-5">
                    <div className="flex justify-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{plan.name}</h3>
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-white/80 text-sm">/month</span>
                      {isAnnual && (
                        <div className="text-xs text-white/70 mt-1">
                          ${plan.price * 12}/year
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white/90 mb-2">
                      {plan.assistants}
                    </p>
                    {plan.addOnPrice > 0 && (
                      <p className="text-xs text-white/70">
                        Add assistants: +${plan.addOnPrice}/each
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-white/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={cn(
                      "w-full bg-white text-gray-800 hover:bg-white/95 border-0 font-medium py-2 text-sm transition-all duration-300",
                      "hover:shadow-md"
                    )}
                    onClick={() => navigate('/signup/owner')}
                  >
                    Get Started
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/signin')}
            className="mx-auto"
          >
            Already have an account? Sign In
          </Button>
        </div>
      </section>
    </div>
  );
}
