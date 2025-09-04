import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Tasks are clear, tracking is simple.",
      author: "Sarah M.",
      role: "Dental Assistant",
      clinic: "Bright Smiles Dental"
    },
    {
      quote: "Finally, our team stays organized effortlessly.",
      author: "Dr. James L.", 
      role: "Practice Owner",
      clinic: "Riverside Dental Care"
    },
    {
      quote: "No more confusion about daily priorities.",
      author: "Maria R.",
      role: "Office Manager", 
      clinic: "Family Dental Group"
    }
  ];

  return (
    <section className="container mx-auto py-20">
      <div className="text-center mb-12">
        <h2 className="text-[1.75rem] font-semibold mb-4 leading-[2.25rem]">
          What dental professionals say
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border border-border shadow-sm hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-sm font-medium mb-4 leading-[1.125rem]">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="text-xs text-muted-foreground leading-[1.125rem]">
                <div className="font-medium text-foreground">{testimonial.author}</div>
                <div>{testimonial.role}</div>
                <div>{testimonial.clinic}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}