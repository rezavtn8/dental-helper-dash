import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
export function TestimonialsSection() {
  const testimonials = [{
    quote: "Tasks are clear, tracking is simple.",
    author: "Sarah M.",
    role: "Dental Assistant",
    clinic: "Bright Smiles Dental"
  }, {
    quote: "Finally, our team stays organized effortlessly.",
    author: "Dr. James L.",
    role: "Practice Owner",
    clinic: "Riverside Dental Care"
  }, {
    quote: "No more confusion about daily priorities.",
    author: "Maria R.",
    role: "Office Manager",
    clinic: "Family Dental Group"
  }];
  
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trusted by dental teams</h2>
          <p className="text-muted-foreground text-lg">Real feedback from real practices</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="text-foreground mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm">
                  <div className="font-medium text-foreground">{testimonial.author}</div>
                  <div className="text-muted-foreground">{testimonial.role}</div>
                  <div className="text-muted-foreground">{testimonial.clinic}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}