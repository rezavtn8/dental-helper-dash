-- Create default_task_templates table (global templates)
CREATE TABLE public.default_task_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text,
  specialty text,
  "due-type" text,
  recurrence text,
  owner_notes text,
  checklist jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Add defaults_imported column to clinics table
ALTER TABLE public.clinics 
ADD COLUMN defaults_imported boolean DEFAULT false;

-- Enable RLS on default_task_templates
ALTER TABLE public.default_task_templates ENABLE ROW LEVEL SECURITY;

-- Allow owners to read default templates
CREATE POLICY "Owners can read default templates" 
ON public.default_task_templates 
FOR SELECT 
USING (get_current_user_role() = 'owner');

-- Add trigger for updated_at on default_task_templates
CREATE TRIGGER update_default_task_templates_updated_at
BEFORE UPDATE ON public.default_task_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.default_task_templates (
  title, description, category, specialty, "due-type", recurrence, owner_notes, checklist
) VALUES 
(
  'Morning Opening Routine',
  'Essential daily opening procedures for the clinic',
  'Operational',
  'General',
  'Before Opening',
  'Daily',
  'Must be completed before first patient arrives',
  '[
    {"id": "1", "title": "Turn on all equipment", "description": "Power on compressors, computers, and dental units", "completed": false},
    {"id": "2", "title": "Check sterilization equipment", "description": "Verify autoclave completed cycle and check indicators", "completed": false},
    {"id": "3", "title": "Review daily schedule", "description": "Confirm appointments and prepare patient files", "completed": false},
    {"id": "4", "title": "Set up treatment rooms", "description": "Prepare instruments and supplies for first appointments", "completed": false}
  ]'::jsonb
),
(
  'Daily Closing Checklist',
  'End-of-day shutdown and security procedures',
  'Operational',
  'General',
  'End of Day',
  'Daily',
  'Complete before leaving the clinic',
  '[
    {"id": "1", "title": "Secure patient files", "description": "Lock cabinets and secure digital records", "completed": false},
    {"id": "2", "title": "Clean and disinfect", "description": "Sanitize all contact surfaces and equipment", "completed": false},
    {"id": "3", "title": "Power down equipment", "description": "Turn off non-essential equipment safely", "completed": false},
    {"id": "4", "title": "Set security system", "description": "Activate alarm and lock all entrances", "completed": false}
  ]'::jsonb
),
(
  'Endo Opening Routine',
  'Specialized setup for endodontic procedures',
  'Specialty',
  'Endodontic',
  'Before Opening',
  'Daily',
  'Critical for endo suite preparation',
  '[
    {"id": "1", "title": "Set up microscope", "description": "Check focus, light settings, and lens cleanliness", "completed": false},
    {"id": "2", "title": "Prepare irrigation solutions", "description": "Mix sodium hypochlorite and EDTA solutions", "completed": false},
    {"id": "3", "title": "Test rotary instruments", "description": "Verify torque settings and file integrity", "completed": false},
    {"id": "4", "title": "Check digital radiography", "description": "Test sensor and imaging software", "completed": false}
  ]'::jsonb
),
(
  'Ortho Weekly Setup',
  'Weekly preparation for orthodontic appointments',
  'Specialty',
  'Orthodontic',
  'Before Opening',
  'Weekly',
  'Prepare for ortho appointment block',
  '[
    {"id": "1", "title": "Organize bracket inventory", "description": "Sort and count brackets by size and type", "completed": false},
    {"id": "2", "title": "Prepare archwires", "description": "Organize wires by size and material", "completed": false},
    {"id": "3", "title": "Check pliers and tools", "description": "Ensure all orthodontic instruments are clean and functional", "completed": false},
    {"id": "4", "title": "Review treatment plans", "description": "Check progress notes for scheduled patients", "completed": false}
  ]'::jsonb
),
(
  'Weekly Deep Clean',
  'Comprehensive cleaning and maintenance routine',
  'Operational',
  'Maintenance',
  'End of Week',
  'Weekly',
  'Schedule during slower periods for thorough cleaning',
  '[
    {"id": "1", "title": "Deep clean operatories", "description": "Detailed cleaning of all surfaces and hard-to-reach areas", "completed": false},
    {"id": "2", "title": "Equipment maintenance", "description": "Check and maintain dental units, compressors", "completed": false},
    {"id": "3", "title": "Inventory spot check", "description": "Count supplies and note reorder needs", "completed": false},
    {"id": "4", "title": "Update maintenance logs", "description": "Record completed maintenance and note issues", "completed": false}
  ]'::jsonb
),
(
  'Monthly Inventory Audit',
  'Complete supply and equipment inventory review',
  'Operational',
  'Inventory',
  'End of Month',
  'Monthly',
  'Schedule for last working day of month',
  '[
    {"id": "1", "title": "Count disposable supplies", "description": "Complete count of gloves, masks, gauze, barriers", "completed": false},
    {"id": "2", "title": "Check expiration dates", "description": "Remove expired items and note replacements needed", "completed": false},
    {"id": "3", "title": "Update inventory system", "description": "Record counts in practice management software", "completed": false},
    {"id": "4", "title": "Generate reorder list", "description": "Create purchase orders for low-stock items", "completed": false}
  ]'::jsonb
),
(
  'New Patient Prep',
  'Preparation checklist for new patient appointments',
  'Operational',
  'Patient Care',
  'Before 1PM',
  'Daily',
  'Complete before new patient arrives',
  '[
    {"id": "1", "title": "Prepare intake forms", "description": "Print and organize new patient paperwork", "completed": false},
    {"id": "2", "title": "Set up consultation room", "description": "Prepare room for examination and discussion", "completed": false},
    {"id": "3", "title": "Review patient history", "description": "Check medical history and previous records", "completed": false},
    {"id": "4", "title": "Prepare camera/imaging", "description": "Set up intraoral camera and X-ray equipment", "completed": false}
  ]'::jsonb
),
(
  'Emergency Kit Check',
  'Monthly verification of emergency supplies and medications',
  'Operational',
  'Safety',
  'End of Month',
  'Monthly',
  'Critical safety requirement - do not skip',
  '[
    {"id": "1", "title": "Check medication expiration", "description": "Verify all emergency medications are current", "completed": false},
    {"id": "2", "title": "Test equipment", "description": "Check AED, oxygen tank, and emergency equipment", "completed": false},
    {"id": "3", "title": "Inventory supplies", "description": "Count bandages, gauze, and first aid supplies", "completed": false},
    {"id": "4", "title": "Update emergency contacts", "description": "Verify contact information for emergency services", "completed": false}
  ]'::jsonb
),
(
  'Sterilization Weekly Check',
  'Weekly verification of sterilization protocols and equipment',
  'Operational',
  'Sterilization',
  'End of Week',
  'Weekly',
  'Essential for infection control compliance',
  '[
    {"id": "1", "title": "Test autoclave cycles", "description": "Run test cycles with biological indicators", "completed": false},
    {"id": "2", "title": "Check chemical indicators", "description": "Verify proper color change on test strips", "completed": false},
    {"id": "3", "title": "Clean ultrasonic baths", "description": "Change solutions and clean ultrasonic units", "completed": false},
    {"id": "4", "title": "Update sterilization logs", "description": "Record test results and maintenance performed", "completed": false}
  ]'::jsonb
),
(
  'Staff Training Session',
  'Monthly team training and protocol review',
  'Operational',
  'Training',
  'End of Month',
  'Monthly',
  'Schedule during lunch break or after hours',
  '[
    {"id": "1", "title": "Review safety protocols", "description": "Go over emergency procedures and safety guidelines", "completed": false},
    {"id": "2", "title": "Practice new procedures", "description": "Train on new equipment or updated protocols", "completed": false},
    {"id": "3", "title": "Discuss patient feedback", "description": "Review recent feedback and improvement strategies", "completed": false},
    {"id": "4", "title": "Update training records", "description": "Document completed training and certifications", "completed": false}
  ]'::jsonb
);