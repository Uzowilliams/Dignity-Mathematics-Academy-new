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


// ---- Phone-number logins (for parents who have no email) ----
// A parent's phone number is turned into a hidden "login email" like
// ph2348031234567@uzoholdings.online. No mail is ever sent to it. The parent just types the phone number.
const PHONE_LOGIN_DOMAIN = 'uzoholdings.online';

// "0803 123 4567", "+234 803 123 4567", "8031234567"  ->  "2348031234567"  (or null if it is not a valid number)
function normalizeNgPhone(input) {
  const d = String(input || '').replace(/\D/g, '');
  if (d.length === 13 && d.startsWith('234')) return d;
  if (d.length === 11 && d.startsWith('0')) return '234' + d.slice(1);
  if (d.length === 10) return '234' + d;
  return null;
}
function phoneToEmail(input) {
  const n = normalizeNgPhone(input);
  return n ? 'ph' + n + '@' + PHONE_LOGIN_DOMAIN : null;
}
// Shows a hidden phone login as the phone number (0803...) and leaves real emails alone
function prettyLogin(email) {
  const m = String(email || '').match(/^ph234(\d{10})@/i);
  return m ? '0' + m[1] : (email || '');
}
