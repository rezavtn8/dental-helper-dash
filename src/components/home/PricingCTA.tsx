import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Star, Users, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function PricingCTA() {
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

  const examples = [{
    title: "Small clinic (2 assistants)",
    calculation: "Starter = $99 ✓",
    recommended: "Starter"
  }, {
    title: "Growing clinic (5 assistants)",
    calculation: ["Starter = $99 + $50 = $149", "Professional = $199 ✓ (better value)"],
    recommended: "Professional"
  }, {
    title: "Large clinic (12 assistants)",
    calculation: ["Professional = $199 + $80 = $279", "Unlimited = $399 ✓ (better value)"],
    recommended: "Unlimited"
  }, {
    title: "Multi-location (25 assistants)",
    calculation: "Unlimited = $399 ✓ (no-brainer)",
    recommended: "Unlimited"
  }];
  return <section className="container mx-auto py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-foreground mb-4">Three-Tier Pricing</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Choose the plan that grows with your clinic
        </p>
        
        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button onClick={() => setIsAnnual(!isAnnual)} className={`relative inline-flex w-12 h-6 items-center rounded-full transition-colors ${isAnnual ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual
          </span>
        </div>
        {isAnnual && <p className="text-sm text-primary font-medium">Save 20% with annual billing</p>}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => {
        const IconComponent = plan.icon;
        return <div key={plan.name} className={cn(
              "relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl group cursor-pointer",
              plan.popular ? "scale-105 shadow-xl" : ""
            )}
            style={{ background: plan.bgStyle }}
          >
              {/* Animated Background Shapes */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Large Circle */}
                <div 
                  className="absolute w-32 h-32 rounded-full opacity-20 transition-all duration-700 group-hover:animate-[pricing-float_4s_ease-in-out_infinite]"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    top: '-20px',
                    right: '-20px'
                  }}
                />
                {/* Triangle Shape */}
                <div 
                  className="absolute w-24 h-24 opacity-15 transition-all duration-700 group-hover:animate-[pricing-pulse_3s_ease-in-out_infinite]"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    bottom: '20px',
                    left: '-10px'
                  }}
                />
                {/* Medium Circle */}
                <div 
                  className="absolute w-20 h-20 rounded-full opacity-25 transition-all duration-700 group-hover:animate-[pricing-float_5s_ease-in-out_infinite_reverse]"
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    bottom: '60px',
                    right: '30px'
                  }}
                />
              </div>

              {plan.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-white text-gray-900 px-4 py-1 flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </Badge>
                </div>}
              
              <div className="relative z-10 p-8">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-white/80">/month</span>
                    {isAnnual && <div className="text-sm text-white/70 mt-1">
                        ${plan.price * 12}/year
                      </div>}
                  </div>
                  <p className="font-medium text-white/90 mb-2">
                    {plan.assistants}
                  </p>
                  {plan.addOnPrice > 0 && <p className="text-sm text-white/70">
                      Add assistants: +${plan.addOnPrice}/each
                    </p>}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">{feature}</span>
                    </li>)}
                </ul>
                
                <Button 
                  className={cn(
                    "w-full bg-white text-gray-900 hover:bg-white/90 border-0 font-semibold py-3 transition-all duration-300",
                    "hover:shadow-lg hover:transform hover:scale-105"
                  )}
                  onClick={() => navigate('/auth')}
                >
                  Start {plan.name} Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>;
      })}
      </div>

      {/* Real Examples */}
      

      {/* Why This Works */}
      
    </section>;
}