import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAnalytics() {
  try {
    console.log('🔍 Testing Analytics Data Sync...\n');
    
    // Get all tasks and users
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'assistant');
    
    if (tasksError || usersError) {
      console.error('Error fetching data:', { tasksError, usersError });
      return;
    }
    
    console.log(`📊 Found ${tasks?.length || 0} total tasks`);
    console.log(`👥 Found ${users?.length || 0} assistants`);
    
    // Analytics Summary
    const completedTasks = tasks?.filter(task => task.status === 'Done') || [];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const todayCompletedTasks = completedTasks.filter(task => {
      if (task.completed_at) {
        const completedDate = new Date(task.completed_at).toISOString().split('T')[0];
        return completedDate === todayStr;
      }
      return false;
    });
    
    console.log(`\n✅ Completed Tasks: ${completedTasks.length} total`);
    console.log(`📅 Completed Today: ${todayCompletedTasks.length}`);
    
    // Assistant Performance
    console.log('\n👨‍⚕️ Assistant Performance:');
    users?.forEach(user => {
      const userTasks = tasks?.filter(task => task.assigned_to === user.id) || [];
      const userCompleted = userTasks.filter(task => task.status === 'Done');
      const completionRate = userTasks.length > 0 ? Math.round((userCompleted.length / userTasks.length) * 100) : 0;
      
      console.log(`  ${user.name}: ${userCompleted.length}/${userTasks.length} tasks (${completionRate}%)`);
    });
    
    // Category Distribution
    console.log('\n📋 Task Categories:');
    const categories: { [key: string]: number } = {};
    tasks?.forEach(task => {
      const category = task.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} tasks`);
    });
    
    // Due Type Distribution
    console.log('\n⏰ Due Types:');
    const dueTypes: { [key: string]: number } = {};
    tasks?.forEach(task => {
      const dueType = task['due-type'] || 'No Due Type';
      dueTypes[dueType] = (dueTypes[dueType] || 0) + 1;
    });
    
    Object.entries(dueTypes).forEach(([dueType, count]) => {
      console.log(`  ${dueType}: ${count} tasks`);
    });
    
    console.log('\n🎉 Analytics test complete! All data is being calculated from real task completions.');
    
  } catch (error) {
    console.error('Error testing analytics:', error);
  }
}

testAnalytics();