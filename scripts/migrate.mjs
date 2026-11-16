import { closePool, ensureSchema, getPool } from '../server/db.mjs'

const projects = [
  {
    slug: 'aurell', title: 'AURELL', kicker: 'LUXURY RETAIL SYSTEMS', description: 'A luxury watch retail, inventory, accounting and POS management system in active development.', status: 'In progress', accent: 'purple', stack: ['TypeScript', 'React', 'API design', 'Data modeling'], result: 'A focused operational system for a high-consideration retail workflow.', overview: 'AURELL is being shaped as an internal operating surface for luxury watch retail: inventory, sales, accounting context, and point-of-sale workflows in one connected system.', problem: 'Luxury retail needs a careful relationship between product identity, stock movement, sales context, and financial records. The challenge is to make those connections legible without turning the tool into a noisy dashboard.', objectives: ['Create a durable product and inventory model.', 'Connect sales workflows to stock movement.', 'Make accounting context visible at the moment of decision.', 'Keep the system modular enough for future operational growth.'], solution: 'The current direction treats the system as a set of deliberate operational journeys rather than a collection of disconnected admin screens. Each workflow is designed around clear state changes and traceable records.', architecture: 'The architecture is being developed around typed application boundaries, structured domain data, and service-ready interfaces. The portfolio intentionally documents the direction without claiming an unfinished system is deployed.', implementation: ['Separate product identity from inventory events.', 'Keep workflow state explicit for predictable transitions.', 'Use reusable interface patterns for retail operations.', 'Document planned functionality separately from the active build.'], tradeoffs: ['Prioritizing a coherent operational model over a wider but shallower feature list.', 'Keeping infrastructure decisions flexible while the domain model is refined.', 'Choosing clarity and auditability over decorative dashboard density.'], currentStatus: 'Active development. Functionality and architecture are evolving; planned capabilities are not presented as complete.', resources: [{ label: 'Case study notes', href: '#case-study' }], liveUrl: null,
  },
  {
    slug: 'oralcare-plus', title: 'OralCare+', kicker: 'CLINIC EXPERIENCE', description: 'A deployed dental clinic website and appointment-booking platform built for a clearer patient journey.', status: 'Deployed', accent: 'lilac', stack: ['Responsive web', 'Appointment flow', 'Accessible UI', 'Deployment'], result: 'A public-facing digital experience that gives patients a clearer path from discovery to enquiry.', overview: 'OralCare+ is a live dental clinic website and appointment-booking platform. It focuses on helping prospective patients understand the service, trust the practice, and take the next step.', problem: 'A clinic website has to balance reassurance, useful information, local relevance, and a low-friction route to booking. Too much detail creates friction; too little detail creates uncertainty.', objectives: ['Clarify the clinic offer and patient journey.', 'Make appointment intent easy to express.', 'Keep the experience responsive and readable.', 'Ship a stable public deployment.'], solution: 'The implementation uses a calm information hierarchy and a direct booking path, with content structured around patient questions rather than internal service categories.', architecture: 'The live project is presented here as a front-end and deployment case study. This portfolio does not invent private infrastructure details that are not part of the public project evidence.', implementation: ['Responsive layouts for common patient browsing contexts.', 'Clear call-to-action placement around booking intent.', 'Content hierarchy designed for scanability.', 'Public deployment available for inspection.'], tradeoffs: ['Reducing decorative interaction in favor of trust and clarity.', 'Keeping the booking action visible without making every section feel like an advertisement.', 'Treating mobile readability as a primary experience.'], currentStatus: 'Deployed and available to visit. The live experience is the source of truth for the public implementation.', resources: [{ label: 'Open live project', href: 'https://oralcare-plus.onrender.com', external: true }], liveUrl: 'https://oralcare-plus.onrender.com',
  },
]

const content = {
  projects,
  expertise: [
    { index: '01', title: 'Software Engineering', description: 'Designing and building web experiences, application logic, APIs, data models, and maintainable product surfaces.', skills: ['Web development', 'Frontend and backend systems', 'API design', 'Database architecture', 'Application engineering'] },
    { index: '02', title: 'Cloud & DevOps', description: 'Understanding the infrastructure and delivery paths that keep digital products observable, deployable, and resilient.', skills: ['Cloud infrastructure', 'Linux administration', 'Deployment and hosting', 'CI/CD concepts', 'Infrastructure automation'] },
    { index: '03', title: 'Cybersecurity', description: 'Approaching systems with a defensive mindset: understand the surface, reduce risk, and make trust explicit.', skills: ['Security fundamentals', 'Systems analysis', 'Defensive security', 'Ethical security testing', 'Vulnerability analysis'] },
    { index: '04', title: 'Intelligent Systems', description: 'Exploring AI-assisted workflows, automation, research, and the emerging tools that change how systems are made.', skills: ['AI-assisted workflows', 'Automation', 'Technical research', 'Data-oriented systems', 'Emerging technologies'] },
  ],
  experience: [
    { year: 'NOW', type: 'EDUCATION', title: 'Computer Science studies', organization: 'Machakos University', description: 'Building a rigorous foundation across computing while developing practical systems through independent work and experimentation.' },
    { year: '01', type: 'INDEPENDENT PROJECT', title: 'OralCare+', organization: 'Deployed web platform', description: 'A public dental clinic website and appointment-booking experience, available as a live reference.' },
    { year: '02', type: 'ACTIVE DEVELOPMENT', title: 'AURELL', organization: 'Retail operations system', description: 'A developing system for luxury watch retail, inventory, accounting context, and point-of-sale management.' },
  ],
  researchNotes: [
    { slug: 'systems-in-progress', label: 'WORKING NOTE', title: 'Systems in progress are still worth understanding.', description: 'A placeholder for future technical notes on architecture, trade-offs, security, and the lessons that emerge while building.' },
    { slug: 'research-led-builds', label: 'EXPLORATION', title: 'Curiosity is a valid engineering input.', description: 'This section will grow with genuine experiments, prototypes, and technical writing rather than filler publications.' },
  ],
  socials: [
    { label: 'GitHub', href: 'https://github.com/Vincent-Devop', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'linkedin' },
    { label: 'Email', href: 'mailto:vincent.nyakundi.tech@gmail.com', icon: 'mail' },
    { label: 'WhatsApp', href: 'https://wa.me/254743879279', icon: 'whatsapp' },
    { label: 'Call', href: 'tel:+254718232238', icon: 'phone' },
  ],
}

try {
  await ensureSchema()
  const db = getPool()
  await db.query(
    `INSERT INTO portfolio_content (content_key, content_value) VALUES ($1, $2::jsonb)
     ON CONFLICT (content_key) DO UPDATE SET content_value = EXCLUDED.content_value, updated_at = NOW()`,
    ['portfolio', JSON.stringify(content)],
  )
  console.log('VINCEY Neon schema and portfolio content are ready.')
} finally {
  await closePool()
}
