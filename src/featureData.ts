export type SystemNode = {
  id: string
  title: string
  short: string
  tools: string[]
  project: string
  question: string
  approach: string
}

export const systemNodes: SystemNode[] = [
  { id: 'software', title: 'Software Engineering', short: 'Build the surface and the logic beneath it.', tools: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'], project: 'OralCare+', question: 'How can an interface make the next action obvious?', approach: 'I start with the journey, then make the boundaries, state changes, and data model explicit.' },
  { id: 'cloud', title: 'Cloud Infrastructure', short: 'Make systems deployable, observable, and resilient.', tools: ['Linux', 'Docker', 'Neon', 'Deployment'], project: 'VINCEY portfolio', question: 'What needs to hold when the first impression fades?', approach: 'I treat delivery as part of the product: environments, health, failure paths, and recovery should be legible.' },
  { id: 'security', title: 'Cybersecurity', short: 'Reduce risk by understanding the surface.', tools: ['Threat modeling', 'Defensive security', 'Access control', 'Auditability'], project: 'AURELL', question: 'Where could trust become ambiguous?', approach: 'I look for explicit identity, constrained access, traceable events, and the smallest honest surface.' },
  { id: 'intelligent', title: 'Intelligent Systems', short: 'Use automation to extend attention, not replace judgment.', tools: ['AI workflows', 'Automation', 'Data modeling', 'Research'], project: 'Independent experiments', question: 'What should a system notice before a person has to?', approach: 'I keep intelligent behavior bounded, explainable, and connected to a real workflow.' },
  { id: 'research', title: 'Research', short: 'Turn curiosity into questions that can change the build.', tools: ['Field notes', 'Prototypes', 'Observation', 'Iteration'], project: 'Systems in progress', question: 'What is still unresolved, and why does it matter?', approach: 'I document the question, the evidence, the decision, and the uncertainty that remains.' },
]

export const buildStates = {
  aurell: [
    { label: 'DOMAIN MODEL', known: 'Product identity and inventory events should remain distinct.', built: 'Core entities and relationships are being shaped.', open: 'Which accounting context belongs at the point of sale?' },
    { label: 'WORKFLOW DESIGN', known: 'Retail decisions move through traceable state changes.', built: 'Operational journeys are being mapped around inventory and sales.', open: 'How much flexibility should each role have?' },
    { label: 'IMPLEMENTATION', known: 'Typed boundaries make an evolving system easier to reason about.', built: 'The application direction and reusable patterns are in active development.', open: 'Which service boundaries should become stable first?' },
    { label: 'TESTING', known: 'Auditability matters more than decorative dashboard density.', built: 'Assumptions are being tested through domain questions and prototypes.', open: 'What evidence will prove the model holds under edge cases?' },
    { label: 'NEXT DECISION', known: 'The system should stay honest about what is unfinished.', built: 'The next work is narrowing the operational model.', open: 'Which workflow deserves to become the first complete vertical slice?' },
  ],
  oralcare: [
    { label: 'DISCOVER', known: 'Patients need quick reassurance and useful context.', built: 'A responsive public-facing clinic experience is deployed.', open: 'Which questions should be answered before a visitor needs to ask?' },
    { label: 'TRUST', known: 'Clarity and tone shape whether a clinic feels credible.', built: 'Information hierarchy is structured around patient concerns.', open: 'How can the experience feel warmer without adding friction?' },
    { label: 'CHOOSE SERVICE', known: 'The next action should be visible without feeling aggressive.', built: 'Services and calls to action are arranged for scanability.', open: 'Where does a patient hesitate in the journey?' },
    { label: 'REQUEST APPOINTMENT', known: 'Booking intent should be easy to express on mobile.', built: 'The appointment path is available in the live deployment.', open: 'What feedback would make the handoff feel more complete?' },
  ],
}

export const decisions = [
  { title: 'Separate product identity from inventory events.', alternatives: 'One mutable record, or a history of state changes.', why: 'A watch is a durable product record while stock movement is a sequence of events. Separation keeps the system auditable.', uncertain: 'The exact accounting boundary is still being refined.', tag: 'AURELL / DATA MODEL' },
  { title: 'Prefer a direct booking path over decorative interaction.', alternatives: 'More animation, more content, or a shorter decision path.', why: 'For OralCare+, trust and clarity matter more than making every surface perform.', uncertain: 'The patient journey can evolve as real usage reveals hesitation.', tag: 'ORALCARE+ / EXPERIENCE' },
  { title: 'Keep unfinished work visibly unfinished.', alternatives: 'Present the intention as a completed feature, or hide the uncertainty.', why: 'A portfolio should communicate how systems are built, not manufacture proof.', uncertain: 'The next vertical slice for AURELL is still a live question.', tag: 'VINCEY / PRACTICE' },
]

export const systemTelemetry = [
  ['CURRENT MODE', 'BUILDING'], ['ACTIVE STUDY', 'AURELL'], ['LAST NOTE', 'SYSTEMS IN PROGRESS'], ['LOCATION', 'NAIROBI / KENYA'], ['AVAILABILITY', 'OPEN TO SELECTIVE WORK'],
]

export const intentFilters = [
  { id: 'public', label: 'Need a public-facing experience?', projects: ['oralcare-plus'] },
  { id: 'infrastructure', label: 'Interested in infrastructure?', projects: ['aurell'] },
  { id: 'architecture', label: 'Want to understand the architecture?', projects: ['aurell', 'oralcare-plus'] },
  { id: 'security', label: 'Looking for security-minded thinking?', projects: ['aurell'] },
  { id: 'early', label: 'Exploring an early-stage system?', projects: ['aurell'] },
]

export const systemAnswers = [
  ['What is Vincent currently building?', 'AURELL — an active retail operations system for luxury watches, inventory, accounting context, and point-of-sale workflows. It is in formation, and the portfolio documents the decisions without presenting planned functionality as complete.'],
  ['How does he approach security?', 'By making trust explicit: understand the surface, constrain access, separate identity from events, and keep important decisions traceable.'],
  ['What is the difference between AURELL and OralCare+?', 'AURELL is an active internal system concerned with operational state. OralCare+ is a deployed public experience concerned with trust, clarity, and the path to an appointment.'],
  ['What does he want to learn next?', 'How reliable operational systems represent state, how cloud delivery changes the shape of a product, and how intelligent tools can extend attention without hiding judgment.'],
]

export const notebookEntries = [
  { id: '001', type: 'QUESTION', title: 'How should operational systems represent state?', body: 'A state is not only a label. It is a record of what changed, why it changed, and what can happen next.', changed: 'The AURELL model now treats inventory movement as an event rather than a property to overwrite.', open: 'Which transitions need explicit approval?' },
  { id: '002', type: 'OBSERVATION', title: 'Clarity is a security feature.', body: 'When a person can see the boundary, the next decision, and the source of a record, trust becomes easier to inspect.', changed: 'Admin and portfolio workflows now expose status rather than implying certainty.', open: 'How can this clarity survive at larger scale?' },
  { id: '003', type: 'EXPERIMENT', title: 'Designing interfaces around traceable records.', body: 'The most useful interface may be the one that lets a person follow a decision backward through the system.', changed: 'Case studies now show the question, the trade-off, and the unresolved edge.', open: 'What should be made visible without overwhelming the reader?' },
]

export const learningTriad = [
  ['CURRENTLY LEARNING', 'Cloud delivery, defensive security, and the architecture behind intelligent systems.'],
  ['CURRENTLY BUILDING', 'AURELL — a more coherent operational model for luxury retail workflows.'],
  ['CURRENTLY QUESTIONING', 'How much of a system should be visible at the moment a decision is made?'],
]

export const contactIntents = [
  ['Build a web product', 'I want to discuss building a web product.'],
  ['Improve infrastructure', 'I want to discuss improving infrastructure or delivery.'],
  ['Understand a security problem', 'I want to discuss a security-minded systems problem.'],
  ['Discuss research', 'I want to discuss a research question or technical experiment.'],
  ['Something else', 'I have another question or collaboration in mind.'],
]

export const editorialDefaults = { systemNodes, buildStates, decisions, systemTelemetry, intentFilters, systemAnswers, notebookEntries, learningTriad, contactIntents }
