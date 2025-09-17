import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Star, Users, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Simple Three-Tier Pricing
        </h2>
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
        return <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'} transition-all hover:shadow-lg`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </Badge>
                </div>}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                  {isAnnual && <div className="text-sm text-muted-foreground mt-1">
                      ${plan.price * 12}/year
                    </div>}
                </div>
                <CardDescription className="mt-2 font-medium text-primary">
                  {plan.assistants}
                </CardDescription>
                {plan.addOnPrice > 0 && <p className="text-sm text-muted-foreground mt-1">
                    Add assistants: +${plan.addOnPrice}/each
                  </p>}
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>)}
                </ul>
                
                <Button className="w-full" variant={plan.popular ? "minimal" : "outline"} onClick={() => navigate('/auth')}>
                  Start {plan.name} Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>;
      })}
      </div>

      {/* Real Examples */}
      

      {/* Why This Works */}
      
    </section>;
}