import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CleanHero() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Main Title */}
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4 tracking-tight">
            DENTALEAGUE
          </h1>
          <p className="text-xl md:text-2xl font-medium text-foreground mb-8">
            Train. Track. Simplify.
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Onboard your assistants and front desk staff — and keep them trained with role-specific checklists and daily workflows.
        </p>

        {/* CTA Button */}
        <Button 
          variant="minimal"
          size="lg"
          onClick={() => navigate('/auth')}
          className="text-lg px-8 py-6 h-auto"
        >
          Launch Your Clinic Hub
        </Button>
      </div>
    </section>
  );
}