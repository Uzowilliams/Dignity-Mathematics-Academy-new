// Shared Supabase client for Dignity Mathematics Academy portal pages.
// Loaded via CDN script tag before this file in each HTML page.

const SUPABASE_URL = 'https://mruqnkfqvgpkudlpzjsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydXFua2Zxdmdwa3VkbHB6anNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTA2MTUsImV4cCI6MjEwMzY4NjYxNX0.vkgsQ6DTjAx8pDmg3suq_noWZKxTuD7o9mnfb2e8894';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirects to the correct dashboard based on the logged-in user's role.
// Returns the profile row if successful, or null if not logged in.
async function requireLogin(expectedRole, loginPageUrl) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = loginPageUrl;
    return null;
  }
  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    window.location.href = loginPageUrl;
    return null;
  }
  if (expectedRole && profile.role !== expectedRole) {
    // Logged in, but wrong portal (e.g. a parent trying to open /admin)
    window.location.href = loginPageUrl;
    return null;
  }
  return profile;
}

async function logout(redirectTo) {
  await supabaseClient.auth.signOut();
  window.location.href = redirectTo;
}
