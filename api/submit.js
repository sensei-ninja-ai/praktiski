// api/submit.js - Vercel Serverless Function for Quiz Submissions

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      quiz_type,
      name,
      email,
      phone,
      company,
      website,
      role,
      total_score,
      category_scores,
      answers,
      scan_results,
      qualifyData,
      source,
      device,
      metadata
    } = req.body;

    // Basic validation
    if (!quiz_type) {
      return res.status(400).json({ error: 'quiz_type is required' });
    }

    if (quiz_type === 'bedrift' && (!name || !email)) {
      return res.status(400).json({ error: 'name and email are required for business quiz' });
    }

    // Log the submission for debugging
    console.log('Quiz submission received:', {
      quiz_type,
      name,
      email,
      company,
      total_score,
      source,
      device,
      timestamp: new Date().toISOString()
    });

    // For now, simulate database storage
    // When Supabase is connected, this will be replaced with actual DB insert
    const leadData = {
      id: generateId(),
      created_at: new Date().toISOString(),
      quiz_type,
      name: name || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      website: website || null,
      role: role || null,
      total_score,
      category_scores: category_scores || null,
      answers: answers || null,
      scan_results: scan_results || null,
      qualifyData: qualifyData || null,
      pipeline_stage: 'ny',
      notes: null,
      next_followup: null,
      source: source || 'unknown',
      device: device || 'unknown',
      metadata: metadata || null
    };

    // TODO: Insert into Supabase
    /*
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .single();
    
    if (error) {
      throw error;
    }
    */

    // For now, just store in memory/log
    console.log('Lead data would be saved:', leadData);

    // Return success response
    return res.status(200).json({
      success: true,
      id: leadData.id,
      message: 'Quiz submission received successfully'
    });

  } catch (error) {
    console.error('Error processing quiz submission:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process quiz submission'
    });
  }
}

// Helper function to generate unique IDs
function generateId() {
  return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/* 
SUPABASE INTEGRATION (ready to uncomment when needed):

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

Then uncomment the Supabase insert code above and add error handling.

Environment variables needed in Vercel:
- SUPABASE_URL=your_supabase_project_url
- SUPABASE_ANON_KEY=your_supabase_anon_key
*/