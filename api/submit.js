// api/submit.js - Vercel Serverless Function for Quiz Submissions
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      quiz_type, name, email, phone, company,
      website, role, total_score, category_scores,
      answers, scan_results, qualifyData, source, device, metadata,
      city, referral_source
    } = req.body;

    if (!quiz_type) return res.status(400).json({ error: 'quiz_type is required' });
    if (quiz_type === 'bedrift' && (!name || !email)) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const leadData = {
      navn: name || null,
      epost: email || null,
      telefon: phone || null,
      bedrift: company || null,
      stilling: role || null,
      score: total_score || null,
      nivaa: scoreToNivaa(total_score),
      svar: { quiz_type, answers, scan_results, qualifyData, category_scores, website, device, metadata, city: city || null, referral_source: referral_source || null },
      kilde: source || 'quiz',
      status: 'ny'
    };

    const { data, error } = await supabase
      .from('quiz_leads')
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;

    console.log('Lead lagret:', data.id, email, total_score);

    return res.status(200).json({
      success: true,
      id: data.id,
      message: 'Quiz submission saved'
    });

  } catch (error) {
    console.error('Feil:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

function scoreToNivaa(score) {
  if (!score) return 'ukjent';
  if (score >= 80) return 'Moden';
  if (score >= 50) return 'Klar';
  if (score >= 25) return 'Utforsker';
  return 'Nybegynner';
}
