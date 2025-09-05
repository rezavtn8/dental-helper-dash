-- Create conversation memory table for AI assistant
CREATE TABLE IF NOT EXISTS public.conversation_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation memory
CREATE POLICY "Users can view their own conversation history" 
ON public.conversation_memory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation entries" 
ON public.conversation_memory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation entries" 
ON public.conversation_memory 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_conversation_memory_user_clinic_date 
ON public.conversation_memory (user_id, clinic_id, created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_conversation_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversation_memory_updated_at
BEFORE UPDATE ON public.conversation_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_memory_updated_at();