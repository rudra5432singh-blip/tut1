const { OpenAI } = require('openai');

// ─── Smart Fallback Generator ──────────────────────────────────────────────────
// This fires when OpenAI is unavailable / not configured. It does keyword-based
// classification so the demo still looks realistic instead of returning generic
// "other" for every complaint.

const KEYWORD_RULES = [
  {
    keywords: ['pothole', 'road', 'highway', 'pavement', 'asphalt', 'traffic', 'accident', 'street'],
    category:  'Roads & Infrastructure',
    department: 'Road Maintenance Department',
    urgency:   'High',
    citizen_rec: 'Avoid the area and use alternate routes if possible.',
    authority_rec: 'Inspect and repair the road surface within 48 hours to prevent accidents.',
    eta: '3-5 business days'
  },
  {
    keywords: ['garbage', 'waste', 'trash', 'litter', 'dump', 'sanitation', 'smell', 'stink', 'filth'],
    category:  'Sanitation',
    department: 'Sanitation Department',
    urgency:   'Medium',
    citizen_rec: 'Keep distance from the affected area and report to local municipal body.',
    authority_rec: 'Deploy sanitation team for immediate cleanup and schedule regular waste collection.',
    eta: '1-2 business days'
  },
  {
    keywords: ['light', 'streetlight', 'lamp', 'dark', 'electricity', 'power', 'outage', 'wire'],
    category:  'Electricity',
    department: 'Electricity Department',
    urgency:   'Medium',
    citizen_rec: 'Report the exact location to the electricity department and avoid damaged wires.',
    authority_rec: 'Dispatch electrical team to inspect and restore power or fix the streetlight.',
    eta: '24-48 hours'
  },
  {
    keywords: ['water', 'pipe', 'leak', 'burst', 'supply', 'tap', 'flooding', 'pipeline', 'sewage', 'drain', 'drainage'],
    category:  'Water Supply',
    department: 'Water Supply Department',
    urgency:   'High',
    citizen_rec: 'Conserve water and avoid contact with leaking water until issue is resolved.',
    authority_rec: 'Send plumbing crew to identify and repair the water pipe leak immediately.',
    eta: '2-3 business days'
  },
  {
    keywords: ['safety', 'crime', 'theft', 'suspicious', 'police', 'emergency', 'danger', 'violence'],
    category:  'Public Safety',
    department: 'Police Department',
    urgency:   'Urgent',
    citizen_rec: 'Stay in a safe location and contact police emergency number (100) immediately.',
    authority_rec: 'Increase police patrolling in the designated area and investigate the reported incident.',
    eta: 'Immediate'
  },
  {
    keywords: ['park', 'tree', 'garden', 'playground', 'bench', 'green'],
    category:  'Parks & Recreation',
    department: 'Parks Department',
    urgency:   'Low',
    citizen_rec: 'Report issue to local parks department and avoid the damaged area.',
    authority_rec: 'Parks maintenance team should inspect and restore the facility.',
    eta: '5-7 business days'
  }
];

const WORKFLOW = [
  'complaint_received',
  'department_assigned',
  'inspection_scheduled',
  'work_in_progress',
  'resolved'
];

function generateFallback(description) {
  const lower = description.toLowerCase();
  const match = KEYWORD_RULES.find(rule => rule.keywords.some(kw => lower.includes(kw)));

  const rule = match || {
    category:  'Other',
    department: 'Municipal Administration',
    urgency:   'Normal',
    citizen_rec: 'Keep records of the issue and follow up with local municipal office.',
    authority_rec: 'Assign the complaint to the appropriate department for inspection and resolution.',
    eta: '5-7 business days'
  };

  // Generate a short formal title from description (first 60 chars)
  const cleanDesc = description.trim();
  const title = cleanDesc.length > 60
    ? cleanDesc.substring(0, 57) + '...'
    : cleanDesc;

  const summary = `${rule.category} issue reported by citizen: ${cleanDesc.substring(0, 100)}`;

  return {
    title,
    category:  rule.category,
    department: rule.department,
    urgency:   rule.urgency,
    summary,
    citizen_recommendation:   rule.citizen_rec,
    authority_recommendation: rule.authority_rec,
    resolution_workflow: WORKFLOW,
    estimated_resolution_time: rule.eta
  };
}

// ─── OpenAI Setup ──────────────────────────────────────────────────────────────
let openai = null;
try {
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('dummy')) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('[AI] OpenAI client initialized.');
  } else {
    console.log('[AI] No valid OPENAI_API_KEY found. Using smart keyword fallback.');
  }
} catch (err) {
  console.warn('[AI] Failed to initialize OpenAI client:', err.message);
}

// ─── Main Classifier ──────────────────────────────────────────────────────────
const classifyComplaint = async (description) => {
  // If OpenAI is not configured, skip straight to fallback
  if (!openai) {
    const result = generateFallback(description);
    console.log('[AI] Fallback used. Category:', result.category, '| Urgency:', result.urgency);
    return result;
  }

  try {
    console.log('[AI] Sending complaint to OpenAI for classification...');

    const prompt = `You are an AI civic issue analyzer.

Analyze the citizen complaint and return ONLY a valid JSON object with these exact fields:

{
  "title": "Short official title for the complaint (max 10 words)",
  "category": "one of: Roads & Infrastructure, Water Supply, Electricity, Sanitation, Public Safety, Parks & Recreation, Other",
  "department": "responsible government department name",
  "urgency": "one of: Low, Normal, Medium, High, Urgent",
  "summary": "1-2 sentence official summary",
  "citizen_recommendation": "actionable advice for the citizen",
  "authority_recommendation": "specific action for the government department",
  "resolution_workflow": ["complaint_received", "department_assigned", "inspection_scheduled", "work_in_progress", "resolved"],
  "estimated_resolution_time": "realistic time estimate"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Complaint:\n' + description }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const raw = response.choices[0].message.content;
    const ai = JSON.parse(raw);

    const result = {
      title:                    ai.title || description.substring(0, 60),
      category:                 ai.category || 'Other',
      department:               ai.department || 'Municipal Administration',
      urgency:                  ai.urgency || 'Normal',
      summary:                  ai.summary || description.substring(0, 100),
      citizen_recommendation:   ai.citizen_recommendation || 'Please follow up with your local municipal office.',
      authority_recommendation: ai.authority_recommendation || 'Review and assign to appropriate team.',
      resolution_workflow:      ai.resolution_workflow || WORKFLOW,
      estimated_resolution_time: ai.estimated_resolution_time || '5-7 business days'
    };

    console.log('[AI] OpenAI response OK. Category:', result.category, '| Urgency:', result.urgency);
    return result;

  } catch (error) {
    console.error('[AI] OpenAI error, switching to keyword fallback:', error.message);
    const result = generateFallback(description);
    console.log('[AI] Fallback used. Category:', result.category);
    return result;
  }
};

module.exports = { classifyComplaint };
