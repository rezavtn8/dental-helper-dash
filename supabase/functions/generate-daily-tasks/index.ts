import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get target date (defaults to today)
    const url = new URL(req.url);
    const targetDateParam = url.searchParams.get('date');
    const targetDate = targetDateParam ? new Date(targetDateParam) : new Date();
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log(`Generating tasks for date: ${targetDateStr}`);

    // Call the database function to generate tasks
    const { data: results, error } = await supabase.rpc('generate_tasks_from_templates', {
      target_date: targetDateStr
    });

    if (error) {
      console.error('Error generating tasks:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate totals
    const totalTemplatesProcessed = results ? results.length : 0;
    const totalTasksCreated = results ? results.reduce((sum: number, result: any) => sum + result.tasks_created, 0) : 0;

    console.log(`Task generation complete:`, {
      targetDate: targetDateStr,
      templatesProcessed: totalTemplatesProcessed,
      tasksCreated: totalTasksCreated,
      results
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          targetDate: targetDateStr,
          templatesProcessed: totalTemplatesProcessed,
          tasksCreated: totalTasksCreated,
          details: results || []
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in task generation:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during task generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});