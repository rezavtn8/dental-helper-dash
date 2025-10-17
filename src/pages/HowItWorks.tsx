import { Navigation } from '@/components/home/Navigation';
import { AppPreview } from '@/components/home/AppPreview';
import { Footer } from '@/components/home/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="relative bg-background py-10 sm:py-16 lg:py-20 px-4 border-b">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            How DentaLeague Works
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
            Explore the powerful dashboards designed for practice owners and team members. 
            See how DentaLeague streamlines training, task management, and performance tracking.
          </p>
        </div>
      </section>

      {/* App Preview Section */}
      <AppPreview />

      {/* CTA Section */}
      <section className="bg-muted/30 py-10 sm:py-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Join dental practices already using DentaLeague to train, track, and analyze their teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/signup/owner')}
              size="lg"
              className="w-full sm:w-auto"
            >
              Get Started for Free
            </Button>
            <Button
              onClick={() => navigate('/pricing')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
