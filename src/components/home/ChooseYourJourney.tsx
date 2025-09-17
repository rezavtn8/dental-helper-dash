import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Users, Building, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function ChooseYourJourney() {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Solo Practice',
      description: 'Perfect for small practices starting their digital journey',
      price: isAnnual ? 29 : 39,
      assistants: 1,
      icon: Users,
      features: [
        'Up to 1 dental assistant',
        'Core task management',
        'Basic scheduling',
        'Email support',
        'HIPAA compliance'
      ],
      cta: 'Start Solo Journey'
    },
    {
      name: 'Growing Practice',
      description: 'For practices ready to scale their operations',
      price: isAnnual ? 79 : 99,
      assistants: 5,
      icon: Building,
      popular: true,
      features: [
        'Up to 5 dental assistants',
        'Advanced task automation',
        'Team analytics & insights',
        'Priority support',
        'Custom workflows',
        'Integration hub'
      ],
      cta: 'Scale Your Practice'
    },
    {
      name: 'Enterprise',
      description: 'For multi-location practices and DSOs',
      price: 'Custom',
      assistants: 'Unlimited',
      icon: Sparkles,
      features: [
        'Unlimited assistants',
        'Multi-location management',
        'Advanced reporting suite',
        'Dedicated success manager',
        'Custom integrations',
        'SLA guarantee'
      ],
      cta: 'Get Custom Quote'
    }
  ];

  const scenarios = [
    {
      size: 'Small Practice (1-2 assistants)',
      recommendation: 'Solo Practice',
      savings: '$1,200/year in efficiency gains'
    },
    {
      size: 'Medium Practice (3-5 assistants)', 
      recommendation: 'Growing Practice',
      savings: '$4,800/year in efficiency gains'
    },
    {
      size: 'Large Practice (6+ assistants)',
      recommendation: 'Enterprise',
      savings: '$15,000+/year in efficiency gains'
    }
  ];

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Choose Your Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Plans designed around your practice size and growth ambitions.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">Save 25%</Badge>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={index} 
                className={`bento-item relative ${
                  plan.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground">{plan.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        {typeof plan.price === 'number' ? (
                          <>
                            <span className="text-3xl font-bold font-display">${plan.price}</span>
                            <span className="text-muted-foreground">/{isAnnual ? 'month' : 'month'}</span>
                          </>
                        ) : (
                          <span className="text-3xl font-bold font-display">{plan.price}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        For {plan.assistants} assistant{typeof plan.assistants === 'number' && plan.assistants !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => navigate('/auth')}
                    variant={plan.popular ? 'default' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Scenarios */}
        <div className="space-y-6">
          <h3 className="font-display text-2xl font-bold text-center">Find Your Perfect Fit</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {scenarios.map((scenario, index) => (
              <Card key={index} className="glass-card p-6 text-center">
                <div className="space-y-3">
                  <h4 className="font-medium">{scenario.size}</h4>
                  <div className="text-primary font-bold">{scenario.recommendation}</div>
                  <div className="text-sm text-green-600 font-medium">{scenario.savings}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}