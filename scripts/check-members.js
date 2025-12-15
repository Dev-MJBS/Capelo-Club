const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role if available for admin tasks

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function checkGroupMembers() {
  console.log('Checking groups and members...');

  // 1. Check Groups
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, title, members_count');

  if (groupsError) {
    console.error('Error fetching groups:', groupsError);
    return;
  }

  console.log('Groups:', groups);

  // 2. Check Group Members
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('*');

  if (membersError) {
    console.error('Error fetching group_members (Table might not exist):', membersError);
  } else {
    console.log(`Found ${members.length} group_members entries.`);
    // Count members per group manually to verify
    const counts = {};
    members.forEach(m => {
      counts[m.group_id] = (counts[m.group_id] || 0) + 1;
    });
    console.log('Calculated counts from group_members table:', counts);
  }

  // 3. Check Posts to see if we can backfill
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('group_id, user_id');
    
  if (postsError) {
      console.error('Error fetching posts:', postsError);
  } else {
      console.log(`Found ${posts.length} posts.`);
      const uniqueMembers = new Set();
      posts.forEach(p => uniqueMembers.add(`${p.group_id}-${p.user_id}`));
      console.log(`Found ${uniqueMembers.size} unique user-group pairs in posts (potential members).`);
  }
}

checkGroupMembers();
