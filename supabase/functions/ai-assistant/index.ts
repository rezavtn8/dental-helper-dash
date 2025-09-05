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
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Conversation memory functions
const saveConversationMemory = async (supabase: any, userId: string, clinicId: string, message: string, response: string) => {
  try {
    await supabase
      .from('conversation_memory')
      .insert({
        user_id: userId,
        clinic_id: clinicId,
        user_message: message,
        ai_response: response,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to save conversation memory:', error);
    // Don't throw - this shouldn't break the main functionality
  }
};

const getConversationContext = async (supabase: any, userId: string, clinicId: string, limit = 5) => {
  try {
    const { data } = await supabase
      .from('conversation_memory')
      .select('user_message, ai_response, created_at')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (!data || data.length === 0) return '';
    
    return data.reverse().map(conv => 
      `User: ${conv.user_message}\nAI: ${conv.ai_response}\n---`
    ).join('\n');
  } catch (error) {
    console.error('Failed to get conversation context:', error);
    return '';
  }
};

// Enhanced error handling with fallback strategies
const handleAPIError = async (error: any, fallbackAction: () => Promise<any>) => {
  console.error('Primary API call failed:', error);
  
  try {
    console.log('Attempting fallback strategy...');
    return await fallbackAction();
  } catch (fallbackError) {
    console.error('Fallback also failed:', fallbackError);
    throw new Error(`Both primary and fallback methods failed: ${error.message}`);
  }
};

// Gemini API call function for fallback
const callGeminiAPI = async (prompt: string) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// Basic analysis prompt for fallback
const createBasicAnalysisPrompt = (clinicData: string) => {
  return `
Analyze this dental clinic data and provide 3-4 actionable recommendations as JSON cards:

${clinicData}

Return JSON in this exact format:
{
  "cards": [
    {
      "id": "unique-id",
      "title": "Brief Title",
      "description": "Detailed actionable recommendation",
      "type": "alert|suggestion|balance|overdue",
      "priority": "high|medium|low",
      "icon": "Lucide icon name",
      "size": "small|medium|large"
    }
  ]
}

Focus on: overdue tasks, workload balance, efficiency suggestions, missing data.
Do not wrap in markdown. Return only valid JSON.
  `;
};

console.log('Environment check:', {
  hasGeminiKey: !!GEMINI_API_KEY,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasSupabaseKey: !!SUPABASE_ANON_KEY,
  hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, clinicId, userId, action } = await req.json();
    
    // Create supabase client with service role for data access
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Verify user has access to this clinic
    const { data: userProfile } = await supabase
      .from('users')
      .select('clinic_id, role')
      .eq('id', userId)
      .single();
    
    if (!userProfile || userProfile.clinic_id !== clinicId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'analyze') {
      try {
        // Get conversation context for better understanding
        const conversationContext = await getConversationContext(supabase, userId, clinicId);

        // Fetch clinic data with enhanced context
        const [tasksResult, assistantsResult, patientLogsResult] = await Promise.all([
          supabase.from('tasks').select('*').eq('clinic_id', clinicId),
          supabase.from('users').select('*').eq('clinic_id', clinicId).eq('role', 'assistant'),
          supabase.from('patient_logs').select('*').eq('clinic_id', clinicId)
        ]);

        const tasks = tasksResult.data || [];
        const assistants = assistantsResult.data || [];
        const patientLogs = patientLogsResult.data || [];

        const clinicData = `
CLINIC DATA ANALYSIS:
Tasks (${tasks.length} total):
${tasks.map(t => `- ${t.title} (${t.status}, Priority: ${t.priority}, Assigned: ${t.assigned_to ? 'Yes' : 'No'})`).join('\n')}

Team Members (${assistants.length} total):
${assistants.map(a => `- ${a.name}`).join('\n')}

Recent Patient Logs:
${patientLogs.slice(-10).map(p => `- ${p.date}: ${p.patient_count} patients (${p.assistant_id})`).join('\n')}

Previous Conversation Context:
${conversationContext}
        `;

        let analysisResponse;
        
        // Use Gemini for analysis
        analysisResponse = await callGeminiAPI(createBasicAnalysisPrompt(clinicData));

        console.log('AI Analysis Response:', analysisResponse);

        // Parse JSON response with better error handling
        let cards = [];
        try {
          // Extract JSON from response if wrapped in markdown
          const jsonMatch = analysisResponse.match(/```json\n(.*)\n```/s) || 
                           analysisResponse.match(/```\n(.*)\n```/s) ||
                           [null, analysisResponse];
          
          const jsonStr = jsonMatch[1] || analysisResponse;
          const parsed = JSON.parse(jsonStr.trim());
          cards = parsed.cards || [];
        } catch (parseError) {
          console.error('Failed to parse analysis response:', parseError);
          console.error('Raw response:', analysisResponse);
          
          // Fallback: create a generic insight card
          cards = [{
            id: 'analysis-error',
            title: 'Analysis Available',
            description: 'AI analysis completed. Check logs for detailed insights.',
            type: 'suggestion',
            priority: 'medium',
            icon: 'Brain',
            size: 'medium'
          }];
        }

        // Save conversation to memory
        await saveConversationMemory(supabase, userId, clinicId, message, JSON.stringify(cards));

        return new Response(JSON.stringify({ cards }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Analysis error:', error);
        
        // Enhanced error handling with user-friendly response
        const fallbackCards = [{
          id: 'error-fallback',
          title: 'Analysis Temporarily Unavailable',
          description: 'Our AI analysis is temporarily unavailable. Please try again in a moment.',
          type: 'alert',  
          priority: 'medium',
          icon: 'AlertCircle',
          size: 'medium'
        }];

        return new Response(JSON.stringify({ cards: fallbackCards }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'create_bulk_tasks') {
      const bulkTaskPrompt = `
        Generate exactly 20 realistic tasks for an endodontics dental clinic. Return as JSON in this format:
        {
          "tasks": [
            {
              "title": "Task title",
              "description": "Detailed task description",
              "priority": "high|medium|low",
              "assigned_to": "Behgum|Kim|Hafsa|May|null",
              "due_type": "daily|weekly|monthly|once|EoD",
              "recurrence": "daily|weekly|monthly|once",
              "category": "cleaning|maintenance|inventory|patient-care|administrative|sterilization|equipment"
            }
          ]
        }
        
        Create diverse, realistic endodontic clinic tasks including:
        - Equipment maintenance (microscopes, rotary instruments, apex locators)
        - Sterilization procedures
        - Inventory management (gutta-percha, files, irrigation solutions)
        - Patient care protocols
        - Administrative duties
        - Cleaning routines
        - Emergency preparedness
        
        Distribute tasks among: Behgum, Kim, Hafsa, May (some can be unassigned)
        Use varied priorities and frequencies
        Make descriptions specific to endodontics
      `;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: bulkTaskPrompt }] }]
        })
      });

      const geminiData = await geminiResponse.json();
      console.log('Gemini API Response for bulk tasks:', JSON.stringify(geminiData, null, 2));
      
      if (!geminiResponse.ok) {
        console.error('Gemini API Error:', geminiData);
        throw new Error(`Gemini API error: ${geminiData.error?.message || 'Unknown error'}`);
      }
      
      if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
        console.error('Invalid Gemini response structure:', geminiData);
        throw new Error('Invalid response from Gemini API');
      }
      
      const responseText = geminiData.candidates[0].content.parts[0].text;
      
      // Parse JSON from response with improved error handling
      let bulkTaskData = null;
      try {
        console.log('Raw bulk task response:', responseText);
        
        // Clean the response text by removing markdown code blocks if present
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to find JSON in the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          bulkTaskData = JSON.parse(jsonMatch[0]);
        } else {
          // Try to parse the entire cleaned response as JSON
          bulkTaskData = JSON.parse(cleanedResponse);
        }
        
      } catch (e) {
        console.error('Failed to parse bulk task JSON:', e);
        console.error('Response text was:', responseText);
        throw new Error(`Failed to parse bulk task data: ${e.message}`);
      }

      if (!bulkTaskData || !bulkTaskData.tasks || !Array.isArray(bulkTaskData.tasks)) {
        console.error('Invalid bulk task data structure:', bulkTaskData);
        throw new Error('No valid bulk task data found in response');
      }

      // Get assistants data first
      const { data: assistants } = await supabase
        .from('users')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant');

      // Process and create all tasks
      const createdTasks = [];
      for (const taskData of bulkTaskData.tasks) {
        // Find assistant ID if assigned
        let assignedToId = null;
        if (taskData.assigned_to && taskData.assigned_to !== 'null') {
          const assistant = assistants?.find(a => 
            a.name.toLowerCase().includes(taskData.assigned_to.toLowerCase())
          );
          assignedToId = assistant?.id || null;
        }

        // Convert string "null" values to actual null for database insertion
        const processedBulkData = {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          assigned_to: assignedToId,
          'due-type': taskData.due_type || 'once',
          recurrence: taskData.recurrence || 'once',
          category: taskData.category || 'administrative',
          custom_due_date: taskData.custom_due_date === 'null' || taskData.custom_due_date === null ? null : taskData.custom_due_date,
          clinic_id: clinicId,
          created_by: userId,
          status: 'pending'
        };

        // Create task in database
        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert(processedBulkData)
          .select()
          .single();

        if (error) {
          console.error('Database error creating task:', error);
          // Continue with other tasks instead of failing completely
        } else {
          createdTasks.push(newTask);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        created_count: createdTasks.length,
        message: `Successfully created ${createdTasks.length} endodontic clinic tasks!`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create_task') {
      const taskPrompt = `
        Parse this task request into structured data:
        "${message}"
        
        IMPORTANT: Return ONLY a single JSON object, not an array.
        
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
        
        ASSIGNMENT RULES (VERY IMPORTANT):
        - Available assistants: Behgum, Kim, Hafsa, May
        - Use "null" (without quotes in JSON) if ANY of these phrases appear:
          * "keep it unassigned"
          * "don't assign"
          * "no one assigned" 
          * "leave unassigned"
          * "unassigned"
          * "no specific person"
          * "anyone can do it"
          * "open task"
          * "no assignment"
          * "leave it open"
          * "not assigned to anyone"
        - Only use assistant names if specifically mentioned: "assign to Kim", "for Hafsa", etc.
        - If no assistant is mentioned and no unassignment phrase is used, default to null
        
        EXAMPLES:
        Input: "Add cleaning task, keep it unassigned"
        Output: {"assigned_to": null}
        
        Input: "Create inventory check for Kim" 
        Output: {"assigned_to": "Kim"}
        
        Input: "Equipment maintenance, don't assign to anyone"
        Output: {"assigned_to": null}
        
        Input: "Daily cleaning task"
        Output: {"assigned_to": null}
        
        OTHER RULES:
        - Return ONLY ONE task object, not multiple tasks
        - Default recurrence: "once" 
        - Infer category from context (cleaning, maintenance, inventory, patient-care, administrative)
        - Set priority based on urgency keywords (high for "urgent"/"ASAP", medium for normal, low for "when possible")
        - Use "once" for due_type unless specified otherwise
        - Do not wrap the response in markdown code blocks
        - Return valid JSON only
      `;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: taskPrompt }] }]
        })
      });

      const geminiData = await geminiResponse.json();
      console.log('Gemini API Response for task creation:', JSON.stringify(geminiData, null, 2));
      
      if (!geminiResponse.ok) {
        console.error('Gemini API Error:', geminiData);
        throw new Error(`Gemini API error: ${geminiData.error?.message || 'Unknown error'}`);
      }
      
      if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
        console.error('Invalid Gemini response structure:', geminiData);
        throw new Error('Invalid response from Gemini API');
      }
      
      const responseText = geminiData.candidates[0].content.parts[0].text;
      
      // Parse JSON from response with improved error handling
      let taskData = null;
      try {
        console.log('Raw Gemini response:', responseText);
        
        // Clean the response text by removing markdown code blocks if present
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to find JSON in the response
        let jsonToparse = null;
        
        // Look for both objects {...} and arrays [...]
        const objectMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        
        if (objectMatch && arrayMatch) {
          // Both found, prefer object for single task creation
          jsonToparse = objectMatch[0];
        } else if (objectMatch) {
          jsonToparse = objectMatch[0];
        } else if (arrayMatch) {
          // If only array found, we'll extract the first item
          const arrayData = JSON.parse(arrayMatch[0]);
          if (Array.isArray(arrayData) && arrayData.length > 0) {
            taskData = arrayData[0]; // Take first item from array
          } else {
            throw new Error('Empty array returned');
          }
        } else {
          // Try to parse the entire cleaned response as JSON
          jsonToparse = cleanedResponse;
        }
        
        if (jsonToparse && !taskData) {
          taskData = JSON.parse(jsonToparse);
        }
        
      } catch (e) {
        console.error('Failed to parse task JSON:', e);
        console.error('Response text was:', responseText);
        throw new Error(`Failed to parse task data: ${e.message}`);
      }

      if (!taskData) {
        console.error('No task data extracted from response:', responseText);
        throw new Error('No valid task data found in response');
      }
      
      // Validate required fields
      if (!taskData.title || taskData.title.trim() === '') {
        throw new Error('Task title is required');
      }

      // Get assistants data first
      const { data: assistants } = await supabase
        .from('users')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('role', 'assistant');

      // Find assistant ID if assigned
      let assignedToId = null;
      console.log('Original assigned_to from Gemini:', taskData.assigned_to);
      
      if (taskData.assigned_to && taskData.assigned_to !== 'null' && taskData.assigned_to !== null) {
        const assistant = assistants?.find(a => 
          a.name.toLowerCase().includes(taskData.assigned_to.toLowerCase())
        );
        assignedToId = assistant?.id || null;
        console.log(`Assigning to: ${taskData.assigned_to} -> ${assignedToId ? 'Found assistant' : 'Not found, leaving unassigned'}`);
      } else {
        console.log('Task left unassigned (null or "null" value)');
      }

      // Convert string "null" values to actual null for database insertion
      const processedTaskData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        assigned_to: assignedToId,
        'due-type': taskData.due_type || 'once',
        recurrence: taskData.recurrence || 'once',
        category: taskData.category || 'administrative',
        custom_due_date: taskData.custom_due_date === 'null' || taskData.custom_due_date === null ? null : taskData.custom_due_date,
        clinic_id: clinicId,
        created_by: userId,
        status: 'pending'
      };

      // Create task in database
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert(processedTaskData)
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