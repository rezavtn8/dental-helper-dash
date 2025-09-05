import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, clinicId, userId, action } = await req.json();
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    if (action === 'analyze') {
      // Fetch current data for analysis
      const [tasksResponse, assistantsResponse, patientLogsResponse] = await Promise.all([
        supabase.from('tasks').select('*').eq('clinic_id', clinicId),
        supabase.from('users').select('*').eq('clinic_id', clinicId).eq('role', 'assistant'),
        supabase.from('patient_logs').select('*').eq('clinic_id', clinicId)
      ]);

      const tasks = tasksResponse.data || [];
      const assistants = assistantsResponse.data || [];
      const patientLogs = patientLogsResponse.data || [];

      const analysisPrompt = `
        Analyze this dental clinic data and provide recommendations as JSON cards:
        
        Tasks: ${JSON.stringify(tasks)}
        Assistants: ${JSON.stringify(assistants)}
        Patient Logs: ${JSON.stringify(patientLogs)}
        
        Create exactly 4 recommendation cards based on this data. Return JSON in this format:
        {
          "cards": [
            {
              "id": "unique-id",
              "title": "Card Title",
              "description": "Brief description",
              "type": "overdue|balance|suggestion|alert",
              "priority": "high|medium|low",
              "icon": "AlertTriangle|Users|Lightbulb|Bell",
              "size": "small|medium|large"
            }
          ]
        }
        
        Focus on:
        - Overdue tasks (if any)
        - Patient load balance between assistants
        - Maintenance/recurring task suggestions
        - Missing logs or data alerts
        
        Only use assistant names: Behgum, Kim, Hafsa, May
      `;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }]
        })
      });

      const geminiData = await geminiResponse.json();
      const responseText = geminiData.candidates[0].content.parts[0].text;
      
      // Parse JSON from response
      let cards = [];
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          cards = parsed.cards || [];
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }

      return new Response(JSON.stringify({ cards }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create_task') {
      const taskPrompt = `
        Parse this task request into structured data:
        "${message}"
        
        Extract and return JSON in this exact format:
        {
          "title": "Task title",
          "description": "Task description", 
          "priority": "high|medium|low",
          "assigned_to": "Behgum|Kim|Hafsa|May|null",
          "due_type": "daily|weekly|monthly|once",
          "recurrence": "daily|weekly|monthly|once",
          "category": "cleaning|maintenance|inventory|patient-care|administrative",
          "custom_due_date": "YYYY-MM-DD HH:mm:ss or null"
        }
        
        Rules:
        - Only use assistants: Behgum, Kim, Hafsa, May
        - Default recurrence: "once"
        - If no specific assistant mentioned, set assigned_to to null
        - Infer category from context
        - Set priority based on urgency keywords
      `;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: taskPrompt }] }]
        })
      });

      const geminiData = await geminiResponse.json();
      const responseText = geminiData.candidates[0].content.parts[0].text;
      
      // Parse JSON from response
      let taskData = null;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          taskData = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse task JSON:', e);
        throw new Error('Failed to parse task data');
      }

      if (!taskData) {
        throw new Error('No task data extracted');
      }

      // Find assistant ID if assigned
      let assignedToId = null;
      if (taskData.assigned_to) {
        const assistant = assistants.find(a => 
          a.name.toLowerCase().includes(taskData.assigned_to.toLowerCase())
        );
        assignedToId = assistant?.id || null;
      }

      // Create task in database
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          assigned_to: assignedToId,
          'due-type': taskData.due_type,
          recurrence: taskData.recurrence,
          category: taskData.category,
          custom_due_date: taskData.custom_due_date,
          clinic_id: clinicId,
          created_by: userId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to create task');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        task: newTask,
        message: `Task "${taskData.title}" created successfully!`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});