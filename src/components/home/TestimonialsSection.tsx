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
          <h2 className="text-3xl font-bold mb-4">What dental teams say</h2>
          <p className="text-lg text-muted-foreground">
            Real feedback from practices using our task management system.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm mb-4">"{testimonial.quote}"</p>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium">{testimonial.author}</p>
                  <p>{testimonial.role}</p>
                  <p>{testimonial.clinic}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}