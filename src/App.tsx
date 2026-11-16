import {
  useEffect,
  lazy,
  useMemo,
  useRef,
  useState,
  Suspense,
  createContext,
  useContext,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Cloud,
  Download,
  FileText,
  Presentation,
  Trash2,
  Upload,
  Code2,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sun,
  Terminal,
  X,
  Moon,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { animate } from 'motion'
import { expertise as fallbackExpertise, experience as fallbackExperience, navItems, projects as fallbackProjects, researchNotes as fallbackResearchNotes, socials as fallbackSocials, type Project, type ProjectImage } from './data'
import { buildStates, contactIntents, decisions, editorialDefaults, intentFilters, learningTriad, notebookEntries, systemAnswers, systemNodes, systemTelemetry } from './featureData'

gsap.registerPlugin(ScrollTrigger)
const ParticleCanvas = lazy(() => import('./ParticleCanvas'))

type ManagedDocument = {
  id: string
  kind: 'cv' | 'presentation'
  title: string
  description: string
  url: string
  key?: string
  fileName: string
  contentType: string
  bytes?: number
  updatedAt?: string
}

type DocumentLibrary = {
  cv: ManagedDocument
  presentations: ManagedDocument[]
}

const fallbackDocuments: DocumentLibrary = {
  cv: { id: 'default-cv', kind: 'cv', title: 'Vincent Nyakundi CV', description: 'The current professional CV for Vincent Nyakundi.', url: '/vincent-nyakundi-cv.pdf', fileName: 'vincent-nyakundi-cv.pdf', contentType: 'application/pdf' },
  presentations: [],
}

type PortfolioContent = {
  projects: typeof fallbackProjects
  expertise: typeof fallbackExpertise
  experience: typeof fallbackExperience
  researchNotes: typeof fallbackResearchNotes
  socials: typeof fallbackSocials
  documents: DocumentLibrary
  editorial: typeof editorialDefaults
}

const fallbackContent: PortfolioContent = {
  projects: fallbackProjects,
  expertise: fallbackExpertise,
  experience: fallbackExperience,
  researchNotes: fallbackResearchNotes,
  socials: fallbackSocials,
  documents: fallbackDocuments,
  editorial: editorialDefaults,
}

function mergeContent(payload: { portfolio?: Partial<PortfolioContent>; editorial?: Partial<typeof editorialDefaults> }): PortfolioContent {
  const portfolio = payload.portfolio || {}
  const documents = (portfolio.documents || {}) as Partial<DocumentLibrary>
  return {
    ...fallbackContent,
    ...portfolio,
    documents: {
      ...fallbackDocuments,
      ...documents,
      presentations: Array.isArray(documents.presentations) ? documents.presentations : fallbackDocuments.presentations,
    },
    editorial: { ...fallbackContent.editorial, ...(payload.editorial || {}) },
  } as PortfolioContent
}

const PortfolioContext = createContext<PortfolioContent>(fallbackContent)
function usePortfolioContent() { return useContext(PortfolioContext) }

type RouteLinkProps = {
  to: string
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

const baseUrl = 'https://vincentnyakundi.com'

function navigate(to: string) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

function RouteLink({ to, children, className, style, onClick }: RouteLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (to.startsWith('/') && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      navigate(to)
    }
    onClick?.()
  }

  return <a className={className} style={style} href={to} onClick={handleClick}>{children}</a>
}

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const update = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  return pathname
}

function useRevealObserver(pathname: string) {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }
    const context = gsap.context(() => {
      elements.forEach((element) => {
        const isScale = element.classList.contains('reveal--scale')
        gsap.fromTo(element, { opacity: 0, y: isScale ? 0 : 24, scale: isScale ? .96 : 1 }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: .85,
          delay: Number.parseInt(getComputedStyle(element).getPropertyValue('--delay')) / 1000 || 0,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        })
      })
    })
    return () => context.revert()
  }, [pathname])
}

function LuxuryLoader() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setVisible(false), reduced ? 120 : 1050)
    return () => window.clearTimeout(timer)
  }, [])
  if (!visible) return null
  return <div className="luxury-loader" role="status" aria-label="Loading VINCEY"><div className="luxury-loader__mark"><span>VINCEY</span><i /></div><div className="luxury-loader__meta"><span>DIGITAL SYSTEMS / 2026</span><span>INITIALISING / 001</span></div></div>
}

function Magnetic({ children, strength = 8 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const move = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - rect.width / 2) / rect.width * strength
    const y = (event.clientY - rect.top - rect.height / 2) / rect.height * strength
    animate(ref.current, { transform: `translate3d(${x}px, ${y}px, 0)` }, { duration: .25, ease: 'easeOut' })
  }
  const reset = () => { if (ref.current) animate(ref.current, { transform: 'translate3d(0, 0, 0)' }, { duration: .45, ease: 'easeOut' }) }
  return <span ref={ref} className="magnetic-wrap" onPointerMove={move} onPointerLeave={reset}>{children}</span>
}

function useScrollChoreography(pathname: string) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.choreo').forEach((element) => gsap.fromTo(element, { y: 36, rotate: -1.5, opacity: .3 }, { y: -22, rotate: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 1 } }))
      gsap.utils.toArray<HTMLElement>('.kinetic-line').forEach((element) => gsap.fromTo(element, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: 'power4.out', delay: Number(element.dataset.delay || 0), scrollTrigger: { trigger: element, start: 'top 88%', once: true } }))
    })
    return () => context.revert()
  }, [pathname])
}

function updateMetadata(pathname: string, content: PortfolioContent = fallbackContent) {
  const project = pathname.startsWith('/work/') ? content.projects.find((item) => item.slug === pathname.split('/')[2]) : undefined
  const research = pathname.startsWith('/research/') ? content.researchNotes.find((item) => item.slug === pathname.split('/')[2]) : undefined
  const meta = project
    ? { title: `${project.title} — Case Study — VINCEY`, description: project.description }
    : research
      ? { title: `${research.title} — VINCEY`, description: research.description }
      : routeMetadata[pathname] ?? routeMetadata['/404']

  document.title = meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  const canonical = document.querySelector('link[rel="canonical"]') ?? document.head.appendChild(document.createElement('link'))
  canonical.setAttribute('rel', 'canonical')
  canonical.setAttribute('href', `${baseUrl}${pathname}`)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${baseUrl}${pathname}`)
}

const routeMetadata: Record<string, { title: string; description: string }> = {
  '/': { title: 'VINCEY — Digital Engineering & Systems', description: 'Vincent Nyakundi is a multidisciplinary technologist exploring software, infrastructure, security, and intelligent systems.' },
  '/about': { title: 'About — VINCEY', description: 'The background and engineering philosophy of Vincent Nyakundi.' },
  '/expertise': { title: 'Expertise — VINCEY', description: 'Software engineering, cloud and DevOps, cybersecurity, and intelligent systems.' },
  '/work': { title: 'Work — VINCEY', description: 'Selected engineering work by Vincent Nyakundi, including AURELL and OralCare+.' },
  '/research': { title: 'Research — VINCEY', description: 'Technical notes, experiments, and research interests from Vincent Nyakundi.' },
  '/presentations': { title: 'Presentations — VINCEY', description: 'Presentations, talks, and shared technical work from Vincent Nyakundi.' },
  '/experience': { title: 'Experience — VINCEY', description: 'Education, project milestones, and practical experience.' },
  '/contact': { title: 'Contact — VINCEY', description: 'Discuss software, infrastructure, research, or an opportunity to collaborate.' },
  '/admin': { title: 'Admin — VINCEY', description: 'Private VINCEY portfolio administration.' },
  '/404': { title: 'Page not found — VINCEY', description: 'The requested VINCEY page could not be found.' },
}

function SectionLabel({ number, children, tone = 'default' }: { number: string; children: ReactNode; tone?: 'default' | 'light' }) {
  return <div className={`section-label section-label--${tone}`}><span>{number}</span><span>{children}</span></div>
}

function StatusPill({ status }: { status: Project['status'] }) {
  return <span className={`status-pill status-pill--${status.toLowerCase().replaceAll(' ', '-')}`}><span className="status-dot" />{status}</span>
}

function SocialLinks({ compact = false }: { compact?: boolean }) {
  const { socials } = usePortfolioContent()
  return <div className={`social-links ${compact ? 'social-links--compact' : ''}`}>
    {socials.map((social) => {
      const Icon = social.icon === 'github' ? Code2 : social.icon === 'linkedin' ? Terminal : social.icon === 'whatsapp' ? MessageCircle : social.icon === 'phone' ? Phone : Mail
      return <a key={social.label} href={social.href} target={social.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={social.label}><Icon size={compact ? 16 : 17} strokeWidth={1.8} /><span>{social.label}</span></a>
    })}
  </div>
}

function SiteNav({ pathname, theme, onToggleTheme }: { pathname: string; theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const { documents } = usePortfolioContent()
  const cvUrl = documents.cv?.url || fallbackDocuments.cv.url
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
    <div className="nav-inner">
      <RouteLink to="/" className="wordmark" onClick={() => setOpen(false)}>
        <img src="/brand/vincey-cloud-logo.png" alt="Vincent Nyakundi — Cloud Engineer, Cyber Security Analyst, Developer" className="wordmark-logo-final" />
      </RouteLink>
      <nav className={`desktop-nav ${open ? 'desktop-nav--open' : ''}`} aria-label="Primary navigation">
        {navItems.map((item) => <RouteLink key={item.href} to={item.href} className={isActive(item.href) ? 'nav-link nav-link--active' : 'nav-link'} onClick={() => setOpen(false)}>{item.label}</RouteLink>)}
      </nav>
      <div className="nav-actions"><a href={cvUrl} download className="nav-cv">Download CV <ArrowDownRight size={14} /></a><Magnetic><RouteLink to="/contact" className="nav-cta" onClick={() => setOpen(false)}>Let&apos;s Talk <ArrowUpRight size={15} /></RouteLink></Magnetic></div>
      <div className="nav-sidebar-footer">
        <SocialLinks compact />
        <div className="nav-sidebar-status"><span className="availability-dot" />Available for opportunities</div>
        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-pressed={theme === 'light'} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
        </button>
      </div>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen((value) => !value)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    <div id="primary-navigation" className={`mobile-panel ${open ? 'mobile-panel--open' : ''}`}>
      {navItems.map((item) => <RouteLink key={item.href} to={item.href} className={isActive(item.href) ? 'mobile-link mobile-link--active' : 'mobile-link'} onClick={() => setOpen(false)}><span>{item.label}</span><ArrowUpRight size={17} /></RouteLink>)}
      <div className="mobile-panel__actions"><a href={cvUrl} download className="button button--text" onClick={() => setOpen(false)}>Download CV <ArrowDownRight size={16} /></a><RouteLink to="/contact" className="button button--primary" onClick={() => setOpen(false)}>Let&apos;s Talk <ArrowUpRight size={16} /></RouteLink></div>
      <button className="mobile-theme-toggle" type="button" onClick={onToggleTheme} aria-pressed={theme === 'light'}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}{theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}</button>
      <div className="mobile-panel__foot"><span>Available for thoughtful work</span><span className="availability-dot" /></div>
    </div>
  </header>
}

function EngineeringVisual() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const style = { '--pointer-x': `${pointer.x}px`, '--pointer-y': `${pointer.y}px` } as CSSProperties
  const moveStage = (x: number, y: number) => { if (stageRef.current) animate(stageRef.current, { transform: `translate3d(${x}px, ${y}px, 0)` }, { duration: .45, ease: 'easeOut' }) }

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse), (max-width: 680px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  return <div className="engineering-visual" style={style} onPointerMove={(event) => {
    if (isMobile) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left - rect.width / 2) / 9
    const y = (event.clientY - rect.top - rect.height / 2) / 11
    setPointer({ x, y })
    moveStage(x, y)
  }} onPointerLeave={() => { setPointer({ x: 0, y: 0 }); moveStage(0, 0) }} aria-label="Abstract dimensional engineering structure">
    <div className="visual-coordinate">37° 17′ S / 23° 33′ E</div>
    <div className="visual-index">SYSTEM / 001</div>
    {!isMobile && <div className="visual-canvas" aria-hidden="true"><Suspense fallback={null}><ParticleCanvas /></Suspense></div>}
    <div ref={stageRef} className="visual-stage">
      <div className="visual-shadow" />
      <div className="visual-plane visual-plane--back" />
      <div className="visual-solid" aria-hidden="true"><span className="visual-solid__face visual-solid__face--front" /><span className="visual-solid__face visual-solid__face--side" /><span className="visual-solid__face visual-solid__face--top" /><span className="visual-solid__core" /></div>
      <div className="visual-ring visual-ring--outer" />
      <div className="visual-ring visual-ring--inner" />
      <div className="visual-spine" />
      <div className="visual-block visual-block--one" />
      <div className="visual-block visual-block--two" />
      <div className="visual-block visual-block--three" />
      <div className="visual-block visual-block--four" />
      <div className="visual-node visual-node--one" />
      <div className="visual-node visual-node--two" />
      <div className="visual-node visual-node--three" />
      <div className="visual-line visual-line--one" />
      <div className="visual-line visual-line--two" />
      <div className="visual-tag">BUILD / THINK / REPEAT</div>
    </div>
    <div className="visual-caption"><span>Interactive study in structure</span><span>Move through the form</span></div>
  </div>
}

function Hero() {
  return <section className="hero home-hero section-shell" id="top">
    <div className="hero-copy reveal reveal--up">
      <SectionLabel number="00 / 09">Digital engineering &amp; systems</SectionLabel>
      <p className="eyebrow">Multidisciplinary technologist <span className="eyebrow-rule" /> Nairobi / Kenya</p>
      <h1 className="kinetic-heading"><span className="kinetic-line" data-delay="0">I turn questions</span><br /><em className="kinetic-line" data-delay=".12">into living systems.</em></h1>
      <p className="hero-description">I follow the signal beneath the interface — mapping how people, code, infrastructure, and intelligence can work together to make technology feel inevitable.</p>
      <div className="hero-actions"><Magnetic><RouteLink to="/work" className="button button--primary">Explore my work <ArrowUpRight size={17} /></RouteLink></Magnetic><Magnetic><RouteLink to="/contact" className="button button--text">Let&apos;s connect <ArrowRight size={17} /></RouteLink></Magnetic></div>
      <div className="hero-foot"><div className="availability"><span className="availability-dot" />Currently building with intention</div><SocialLinks compact /></div>
    </div>
    <div className="hero-art reveal reveal--scale"><HeroCollage /></div>
    <div className="hero-scroll"><span>Scroll to inspect</span><ArrowDownRight size={17} /></div>
  </section>
}

function HomeHeroComposition() {
  return <section className="home-hero-composition" id="profile"><div className="home-hero-composition__environment" role="img" aria-label="Cloud engineering architecture with connected infrastructure systems" /><div className="home-hero-composition__panel reveal reveal--up"><SectionLabel number="01 / 09">The person behind the systems</SectionLabel><p className="eyebrow">Cloud engineering &amp; connected infrastructure <span className="eyebrow-rule" /> Nairobi / Kenya</p><h1><span>I&apos;m Vincent</span><em>Nyakundi</em></h1><div className="home-hero-composition__role"><span>01</span> CLOUD ENGINEER</div><p className="home-hero-composition__description">I explore how cloud infrastructure, software, and intelligent systems connect to make digital products reliable, useful, and ready for what comes next.</p><div className="hero-actions"><Magnetic><RouteLink to="/work" className="button button--primary">Explore my work <ArrowUpRight size={17} /></RouteLink></Magnetic><Magnetic><RouteLink to="/contact" className="button button--text">Let&apos;s connect <ArrowRight size={17} /></RouteLink></Magnetic></div><div className="home-hero-composition__foot"><span>BUILD / THINK / REPEAT</span><span>ACTIVE STUDY / CLOUD SYSTEMS</span></div></div><div className="home-hero-composition__markers" aria-hidden="true"><span>CONNECTED SYSTEMS / 001</span><span>01 / 09</span><i /></div></section>
}

function PortraitIntroduction() {
  const roles = [
    { label: 'CYBER SECURITY ANALYST', slug: 'security' },
    { label: 'CLOUD ENGINEER', slug: 'cloud' },
    { label: 'WEB DEVELOPER', slug: 'web' },
  ]
  const [roleIndex, setRoleIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setRoleIndex((index) => (index + 1) % roles.length), 10000)
    return () => window.clearInterval(timer)
  }, [])

  const role = roles[roleIndex]
  return <section className="home-opening" id="top">
    <div className="home-opening__inner">
      <div className="home-opening__hero" id="profile">
        <div className="home-opening__portrait-card reveal reveal--scale">
          <div className="home-opening__portrait">
            <picture><source srcSet="/portrait/vincent-nyakundi-luxury.webp" type="image/webp" /><img src="/portrait/vincent-nyakundi-luxury.png" alt="Vincent Nyakundi in a navy double-breasted suit" width="1632" height="2176" fetchPriority="high" /></picture>
          </div>
          <div className="home-opening__portrait-caption"><span className="home-opening__monogram">V</span><strong>VINCE</strong><small>Software Engineer<br />&amp; Cyber Security Analyst</small></div>
        </div>
        <div className="home-opening__identity reveal reveal--up">
          <SectionLabel number="01 / 03">The person behind the systems</SectionLabel>
          <h1>I&apos;m <span>Vincent</span><br /><em>Nyakundi</em></h1>
          <div className={`home-opening__role role-rotator--${role.slug}`} aria-live="polite"><span>0{roleIndex + 1}</span>{role.label}</div>
          <p>I&apos;m Vincent Nyakundi, a Computer Science student, software developer, and emerging technologist driven by curiosity and a passion for solving complex problems through technology.</p>
        </div>
      </div>
      <div className="home-opening__lower">
        <figure className="home-opening__systems reveal reveal--scale">
          <img src="/media/cloud-engineering-systems.webp" alt="Connected cloud infrastructure and digital systems" />
          <figcaption><span>01 / 03 · CLOUD SYSTEMS</span><span>Infrastructure as a connected practice</span></figcaption>
        </figure>
        <div className="home-opening__about reveal reveal--up">
          <div className="home-opening__about-copy">
            <p>Through independent projects, technical research, and continuous learning, I&apos;m building the knowledge and skills to engineer reliable, scalable, and meaningful digital systems.</p>
            <blockquote>I don&apos;t just want to use technology. I want to <strong>understand</strong> it, <strong>engineer</strong> it, and <strong>contribute</strong> to what comes next.</blockquote>
          </div>
          <div className="home-opening__socials"><SocialLinks /></div>
        </div>
      </div>
    </div>
  </section>
}

function IntroSection() {
  return <section className="intro-band section-shell section-shell--full" id="about-intro"><MotionGraphicField tone="purple" />
    <div className="intro-inner reveal reveal--up"><SectionLabel number="01 / 09" tone="light">A working perspective</SectionLabel><h2>Curiosity drives the questions. <span>Engineering turns them into systems.</span></h2><div className="intro-bottom"><p>I&apos;m Vincent Nyakundi, a Computer Science student and emerging technologist interested in designing, building, and understanding the systems shaping our digital world.</p><RouteLink to="/about" className="circle-link" aria-label="Read more about Vincent Nyakundi"><ArrowUpRight size={20} /></RouteLink></div></div>
  </section>
}

function MotionGraphicField({ tone = 'light' }: { tone?: 'light' | 'purple' | 'ink' }) {
  return <div className={`motion-graphic-field motion-graphic-field--${tone}`} aria-hidden="true"><span className="motion-graphic motion-graphic--ring" /><span className="motion-graphic motion-graphic--ring motion-graphic--ring-small" /><span className="motion-graphic motion-graphic--cube" /><span className="motion-graphic motion-graphic--cube motion-graphic--cube-small" /><span className="motion-graphic motion-graphic--beam" /><span className="motion-graphic motion-graphic--node" /><span className="motion-graphic motion-graphic--node motion-graphic--node-two" /></div>
}

function ImmersiveHUD() {
  const stages = [
    ['profile', 'THE PERSON'], ['about-intro', 'THE APPROACH'], ['work', 'SELECTED WORK'], ['expertise', 'THE SYSTEM'],
    ['philosophy', 'TRADE-OFFS'], ['research', 'EXPLORATION'], ['experience', 'TIMELINE'], ['contact', 'CONTACT'],
  ]
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
      let closest = 0
      stages.forEach(([id], index) => { const element = document.getElementById(id); if (element && element.getBoundingClientRect().top <= window.innerHeight * .42) closest = index })
      setActive(closest)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  const jump = (index: number) => document.getElementById(stages[index][0])?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  return <aside className="immersive-hud" aria-label="Homepage stage navigation"><div className="immersive-hud__top"><span>VINCEY / FIELD STUDY</span><span>{String(active + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}</span></div><div className="immersive-hud__line"><i style={{ transform: `scaleX(${progress})` }} /></div><div className="immersive-hud__bottom"><span>{stages[active][1]}</span><button type="button" onClick={() => jump((active + 1) % stages.length)} aria-label="Move to next homepage stage">NEXT <ArrowDownRight size={14} /></button></div></aside>
}

function CursorParticleTrail() {
  const [points, setPoints] = useState(() => Array.from({ length: 14 }, () => ({ x: -100, y: -100 })))
  const target = useRef({ x: -100, y: -100 })
  const current = useRef(Array.from({ length: 14 }, () => ({ x: -100, y: -100 })))
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return
    let frame = 0
    const move = (event: PointerEvent) => { if (event.pointerType !== 'touch') target.current = { x: event.clientX, y: event.clientY } }
    const tick = () => {
      current.current = current.current.map((point, index) => { const lead = index === 0 ? target.current : current.current[index - 1]; return { x: point.x + (lead.x - point.x) * (.28 - index * .012), y: point.y + (lead.y - point.y) * (.28 - index * .012) } })
      setPoints(current.current.map((point) => ({ ...point })))
      frame = window.requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', move, { passive: true }); frame = window.requestAnimationFrame(tick)
    return () => { window.removeEventListener('pointermove', move); window.cancelAnimationFrame(frame) }
  }, [])
  return <div className="cursor-particle-trail" aria-hidden="true">{points.map((point, index) => <i key={index} style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0) scale(${1 - index / 18})`, opacity: Math.max(0, .7 - index / 19) }} />)}</div>
}

function ProjectStage() {
  return <div className="project-stage" aria-hidden="true"><span className="project-stage__orbit project-stage__orbit--one" /><span className="project-stage__orbit project-stage__orbit--two" /><span className="project-stage__core" /><span className="project-stage__beam" /><span className="project-stage__node project-stage__node--one" /><span className="project-stage__node project-stage__node--two" /></div>
}

function ProjectVisual({ project, compact = false }: { project: Project; compact?: boolean }) {
  const uploadedImage = project.images?.find((image) => image.role === 'hero') || project.images?.[0]
  return <div className={`project-visual project-visual--${project.accent} ${compact ? 'project-visual--compact' : ''}`}>
    {uploadedImage ? <div className="project-visual__uploaded-image" style={{ backgroundImage: `url(${uploadedImage.url})` }} role="img" aria-label={uploadedImage.alt} /> : <><ProjectStage /><div className="project-visual__grid" /><div className="project-visual__fallback-geometry">{project.title === 'AURELL' ? <div className="aurell-watch-scene" aria-label="Solid dimensional AURELL luxury watch study"><div className="aurell-watch-scene__strap aurell-watch-scene__strap--top" /><div className="aurell-watch-scene__strap aurell-watch-scene__strap--bottom" /><div className="aurell-watch-scene__case"><div className="aurell-watch-scene__bezel"><div className="aurell-watch-scene__dial"><span className="watch-marker watch-marker--12" /><span className="watch-marker watch-marker--3" /><span className="watch-marker watch-marker--6" /><span className="watch-marker watch-marker--9" /><span className="watch-hand watch-hand--hour" /><span className="watch-hand watch-hand--minute" /><span className="watch-center" /></div></div><i className="aurell-watch-scene__crown" /></div></div> : <><div className="oralcare-cross"><span /><span /></div><div className="oralcare-panel"><div /><div /><div /></div><div className="oralcare-ring" /></>}</div></>}
    <span className="project-visual__code">{project.title === 'AURELL' ? 'PRECISION / RETAIL' : 'CARE / ACCESS'}</span>
  </div>
}

function ProjectGallery() {
  const { projects } = usePortfolioContent()
  const railRef = useRef<HTMLDivElement>(null)
  const move = (distance: number) => railRef.current?.scrollBy({ left: distance, behavior: 'smooth' })
  return <section className="project-gallery" aria-label="Selected project previews">
    <div className="project-gallery__bar section-shell"><span>SELECTED WORK / 02</span><div className="project-gallery__controls"><span>DRAG TO EXPLORE</span><button type="button" aria-label="Previous projects" onClick={() => move(-360)}><ArrowRight size={15} /></button><button type="button" aria-label="Next projects" onClick={() => move(360)}><ArrowRight size={15} /></button></div></div>
    <div ref={railRef} className="project-gallery__rail" tabIndex={0}>
      {projects.map((project) => <RouteLink key={project.slug} to={`/work/${project.slug}`} className="project-gallery__item"><ProjectVisual project={project} compact /><div className="project-gallery__item-meta"><span>{project.title}</span><small>{project.status}</small></div></RouteLink>)}
    </div>
  </section>
}

function HeroCollage() {
  const { projects } = usePortfolioContent()
  const rootRef = useRef<HTMLDivElement>(null)
  const aurell = projects[0]
  const oralcare = projects[1]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !rootRef.current) return
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.hero-collage__item')
      gsap.fromTo(cards, { opacity: 0, y: 70, rotate: -2 }, { opacity: 1, y: 0, rotate: (index) => [-7, 5, -3][index] ?? 0, duration: 1.15, ease: 'power3.out', stagger: .14, delay: .25 })
    }, rootRef)
    return () => context.revert()
  }, [])

  return <div ref={rootRef} className="hero-collage" aria-label="Overlapping project studies">
    <div className="hero-collage__engineering"><EngineeringVisual /></div>
    <RouteLink to="/work/aurell" className="hero-collage__item hero-collage__item--aurell"><ProjectVisual project={aurell} compact /><span>AURELL / ACTIVE BUILD</span></RouteLink>
    <RouteLink to="/work/oralcare-plus" className="hero-collage__item hero-collage__item--oralcare"><ProjectVisual project={oralcare} compact /><span>ORALCARE+ / DEPLOYED</span></RouteLink>
    <div className="hero-collage__item hero-collage__item--system"><span>ARCHITECTURE / 02</span><strong>Typed boundaries.<br />Traceable records.</strong><small>ACTIVE STUDY / VINCEY</small></div>
  </div>
}

function WorkPreview({ compact = false }: { compact?: boolean }) {
  const { projects } = usePortfolioContent()
  return <section className={`work-section section-shell ${compact ? 'work-section--compact' : ''}`} id="work"><MotionGraphicField />
    <div className="section-heading reveal reveal--up"><div><SectionLabel number="02 / 09">Selected work</SectionLabel><h2>Systems with a point of view.</h2></div><p>Projects are documented honestly: what is live, what is being shaped, and what the decisions reveal.</p></div>
    <div className="project-rail-wrap"><div className="project-rail" tabIndex={0} aria-label="Selected projects. Use arrow keys to move between projects." onKeyDown={(event) => { if (event.key === 'ArrowRight') event.currentTarget.scrollBy({ left: 360, behavior: 'smooth' }); if (event.key === 'ArrowLeft') event.currentTarget.scrollBy({ left: -360, behavior: 'smooth' }) }}>{projects.map((project, index) => <article className="project-card reveal reveal--up" key={project.slug} style={{ '--delay': `${index * 90}ms` } as CSSProperties}><ProjectVisual project={project} /><div className="project-card__body"><div className="project-card__meta"><span>{project.kicker}</span><StatusPill status={project.status} /></div><h3>{project.title}</h3><p>{project.description}</p><div className="project-card__foot"><span>{project.stack.slice(0, 2).join(' / ')}</span><RouteLink to={`/work/${project.slug}`} className="arrow-link">View case study <ArrowUpRight size={16} /></RouteLink></div></div></article>)}</div></div>
    {!compact && <div className="work-section__footer"><span>01—02 / Drag, swipe or use arrow keys</span><RouteLink to="/work" className="text-link">View all work <ArrowRight size={16} /></RouteLink></div>}
  </section>
}

function SystemTelemetry() {
  const { editorial } = usePortfolioContent()
  return <div className="system-telemetry" aria-label="VINCEY field status"><div className="system-telemetry__head"><span>VINCEY / FIELD STATUS</span><span className="availability"><i className="availability-dot" />LIVE STUDY</span></div><div className="system-telemetry__grid">{editorial.systemTelemetry.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div>
}

function SystemMap() {
  const { editorial } = usePortfolioContent()
  const [selected, setSelected] = useState(editorial.systemNodes[0])
  return <section className="system-map-section section-shell section-shell--full" id="system-map"><div className="system-map-inner"><div className="section-heading section-heading--light reveal reveal--up"><div><SectionLabel number="03 / 09" tone="light">System map</SectionLabel><h2>Five ways<br />into the system.</h2></div><p>Select a node to see the question, tools, and project behind the lens. Nothing here is a percentage — it is a way of working.</p></div><div className="system-map-layout"><div className="system-map-visual" aria-label="Interactive map of Vincent's technical interests"><div className="system-map-orbit system-map-orbit--outer" /><div className="system-map-orbit system-map-orbit--inner" /><div className="system-map-center"><span>VINCEY</span><strong>build / question / repeat</strong></div>{editorial.systemNodes.map((node, index) => { const angle = (index / editorial.systemNodes.length) * Math.PI * 2 - Math.PI / 2; const x = 50 + Math.cos(angle) * 39; const y = 50 + Math.sin(angle) * 39; return <button key={node.id} type="button" className={`system-node ${selected.id === node.id ? 'system-node--active' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => setSelected(node)}><span>0{index + 1}</span>{node.title}</button> })}</div><div className="system-map-detail reveal reveal--scale"><div className="system-map-detail__top"><span>SELECTED LENS / {selected.id.toUpperCase()}</span><span>{selected.project}</span></div><h3>{selected.title}</h3><p className="system-map-detail__short">{selected.short}</p><div className="system-map-detail__columns"><div><span>TOOLS / TECHNOLOGIES</span><div className="system-tool-list">{selected.tools.map((tool) => <b key={tool}>{tool}</b>)}</div></div><div><span>ENGINEERING QUESTION</span><p>{selected.question}</p></div></div><div className="system-map-detail__approach"><span>APPROACH</span><p>{selected.approach}</p></div></div></div></div></section>
}

function BuildState({ project }: { project: Project }) {
  const { editorial } = usePortfolioContent()
  const states = editorial.buildStates[project.slug as keyof typeof editorial.buildStates] || editorial.buildStates.aurell
  const [active, setActive] = useState(0)
  const timelineRef = useRef<HTMLElement>(null)
  const state = states[active]
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 680px)').matches || !timelineRef.current) return
    const buttons = timelineRef.current.querySelectorAll('button')
    const context = gsap.context(() => gsap.to(buttons, { opacity: .34, stagger: .08, scrollTrigger: { trigger: timelineRef.current, start: 'top 24%', end: 'bottom 70%', scrub: 1, onUpdate: (trigger) => { const index = Math.min(states.length - 1, Math.floor(trigger.progress * states.length)); setActive(index) } } }), timelineRef)
    return () => context.revert()
  }, [project.slug, states.length])
  return <section ref={timelineRef} className={`build-state build-state--${project.slug}`} id="build-state"><div className="build-state__head"><span>BUILD STATE / {project.title}</span><span>0{active + 1} / 0{states.length}</span></div><div className="build-state__rail">{states.map((item, index) => <button key={item.label} type="button" className={index === active ? 'is-active' : ''} onClick={() => setActive(index)}><small>0{index + 1}</small><span>{item.label}</span></button>)}</div><div className="build-state__content"><div><span>WHAT IS KNOWN</span><p>{state.known}</p></div><div><span>WHAT IS BUILT</span><p>{state.built}</p></div><div><span>WHAT REMAINS OPEN</span><p>{state.open}</p></div></div></section>
}

function EngineeringDecisionLog() {
  const { editorial } = usePortfolioContent()
  return <section className="decision-log section-shell" id="decisions"><div className="section-heading reveal reveal--up"><div><SectionLabel number="04 / 09">Under the surface</SectionLabel><h2>Decisions<br /><em>with receipts.</em></h2></div><p>The work becomes more useful when the alternatives, trade-offs, and uncertainty stay visible.</p></div><div className="decision-list">{editorial.decisions.map((decision, index) => <article className="decision-entry reveal reveal--up" key={decision.title} style={{ '--delay': `${index * 80}ms` } as CSSProperties}><div className="decision-entry__index">0{index + 1}</div><div><span className="decision-entry__tag">{decision.tag}</span><h3>{decision.title}</h3><div className="decision-entry__grid"><p><b>ALTERNATIVES</b>{decision.alternatives}</p><p><b>WHY THIS PATH</b>{decision.why}</p><p><b>STILL UNCERTAIN</b>{decision.uncertain}</p></div></div></article>)}</div></section>
}

function IntentFilters() {
  const { projects } = usePortfolioContent()
  const { editorial } = usePortfolioContent()
  const [active, setActive] = useState(editorial.intentFilters[0])
  const matches = projects.filter((project) => active.projects.includes(project.slug))
  return <section className="intent-filters section-shell" id="find-your-path"><div className="section-heading reveal reveal--up"><div><SectionLabel number="02 / 09">Find your path</SectionLabel><h2>Start with<br /><em>the question.</em></h2></div><p>Choose the reason you arrived. The work will meet you there.</p></div><div className="intent-filter-layout"><div className="intent-questions">{editorial.intentFilters.map((filter) => <button key={filter.id} type="button" className={active.id === filter.id ? 'is-active' : ''} onClick={() => setActive(filter)}>{filter.label}<ArrowUpRight size={16} /></button>)}</div><div className="intent-results"><span>THE SYSTEM SUGGESTS</span>{matches.map((project) => <RouteLink key={project.slug} to={`/work/${project.slug}`}><strong>{project.title}</strong><small>{project.kicker} / {project.status}</small><ArrowUpRight size={18} /></RouteLink>)}</div></div></section>
}

function AskTheSystem() {
  const { editorial } = usePortfolioContent()
  const [selected, setSelected] = useState(0)
  return <section className="ask-system section-shell"><div className="ask-system__inner"><div><SectionLabel number="05 / 09" tone="light">Ask the system</SectionLabel><h2>A small answer<br /><em>from the field.</em></h2><p>Not a chatbot. Four curated doors into how Vincent is thinking, building, and learning.</p></div><div className="ask-system__answers"><div className="ask-system__questions">{editorial.systemAnswers.map(([question], index) => <button key={question} type="button" className={selected === index ? 'is-active' : ''} onClick={() => setSelected(index)}>{question}</button>)}</div><div className="ask-system__response"><span>VINCEY / RESPONSE 0{selected + 1}</span><p>{editorial.systemAnswers[selected][1]}</p></div></div></div></section>
}

function ResearchNotebook() {
  const { editorial } = usePortfolioContent()
  return <section className="notebook-section section-shell" id="notebook"><div className="section-heading reveal reveal--up"><div><SectionLabel number="05 / 09">Research notebook</SectionLabel><h2>Questions that<br /><em>change the build.</em></h2></div><p>A living shelf for observations, experiments, and open questions — not a list of invented publications.</p></div><div className="notebook-grid">{editorial.notebookEntries.map((entry) => <article className="notebook-entry reveal reveal--up" key={entry.id}><div className="notebook-entry__top"><span>FIELD NOTE {entry.id}</span><span>{entry.type}</span></div><h3>{entry.title}</h3><p>{entry.body}</p><div><span>WHAT CHANGED</span><p>{entry.changed}</p></div><div><span>OPEN QUESTION</span><p>{entry.open}</p></div></article>)}</div></section>
}

function LearningTriad() {
  const { editorial } = usePortfolioContent()
  return <section className="learning-triad section-shell"><div className="learning-triad__head"><SectionLabel number="06 / 09">Direction of travel</SectionLabel><h2>Not only what I&apos;ve done.<br /><em>What I&apos;m becoming.</em></h2></div><div className="learning-triad__grid">{editorial.learningTriad.map(([label, text], index) => <article key={label} className={`learning-card learning-card--${index + 1}`}><span>0{index + 1} / {label}</span><p>{text}</p></article>)}</div></section>
}

function ProjectArtifact({ project }: { project: Project }) {
  const steps = project.slug === 'aurell' ? ['Product identity', 'Stock event', 'Sale', 'Accounting context'] : ['Discover', 'Trust', 'Choose service', 'Request appointment']
  return <div className={`project-artifact project-artifact--${project.slug}`}><div className="project-artifact__geometry" aria-hidden="true"><i /><b /><span /></div><div className="project-artifact__head"><span>INTERACTIVE ARTIFACT</span><span>{project.slug === 'aurell' ? 'EVENT TRACE' : 'PATIENT JOURNEY'}</span></div><div className="project-artifact__flow">{steps.map((step, index) => <div key={step} className="artifact-step"><span>0{index + 1}</span><strong>{step}</strong>{index < steps.length - 1 && <i />}</div>)}</div><p>{project.slug === 'aurell' ? 'A durable record becomes more useful when the event that changed it can still be followed.' : 'A clear path lets a patient move from uncertainty to a next step without learning the clinic’s internal structure.'}</p></div>
}

function ExpertiseSection() {
  const { expertise } = usePortfolioContent()
  const icons = [Code2, Cloud, ShieldCheck, Terminal]
  return <section className="expertise-section section-shell section-shell--full" id="expertise"><MotionGraphicField /><div className="expertise-inner"><div className="section-heading section-heading--light reveal reveal--up"><div><SectionLabel number="03 / 09" tone="light">Technical expertise</SectionLabel><h2>Four ways into<br />the system.</h2></div><p>Not a list of percentages. A set of working lenses, grounded in building, testing, and staying curious.</p></div><div className="expertise-list">{expertise.map((item, index) => { const Icon = icons[index]; return <article className="expertise-item reveal reveal--up" key={item.title} style={{ '--delay': `${index * 70}ms` } as CSSProperties}><div className="expertise-item__top"><span>{item.index}</span><Icon size={22} strokeWidth={1.5} /></div><div><h3>{item.title}</h3><p>{item.description}</p><div className="skill-list">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><ArrowUpRight size={20} className="expertise-item__arrow" /></article> })}</div></div></section>
}

function PhilosophyMotion() {
  const motionRoot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !motionRoot.current) return
    const context = gsap.context(() => {
      const sheets = gsap.utils.toArray<HTMLElement>('.motion-sheet')
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: motionRoot.current, start: 'top 82%', end: 'bottom 24%', scrub: 1.1 },
      })
      timeline
        .fromTo(sheets[0], { x: 130, y: -95, rotate: 12, opacity: 0 }, { x: 0, y: 0, rotate: -6, opacity: 1, ease: 'none' }, 0)
        .fromTo(sheets[1], { x: -150, y: 24, rotate: -12, opacity: 0 }, { x: -12, y: 18, rotate: 5, opacity: 1, ease: 'none' }, .15)
        .fromTo(sheets[2], { x: 90, y: 150, rotate: 15, opacity: 0 }, { x: 28, y: 74, rotate: -3, opacity: 1, ease: 'none' }, .3)
        .to(sheets[0], { x: 4, y: -14, rotate: -3, ease: 'none' }, .62)
        .to(sheets[1], { x: -8, y: 26, rotate: 3, ease: 'none' }, .72)
        .to(sheets[2], { x: 35, y: 64, rotate: -6, ease: 'none' }, .82)
      gsap.to('.motion-orbit', { rotate: 360, duration: 22, repeat: -1, ease: 'none' })
    }, motionRoot)
    return () => context.revert()
  }, [])

  return <div ref={motionRoot} className="philosophy-motion reveal reveal--scale" aria-label="Animated engineering principles">
    <div className="motion-orbit motion-orbit--one" />
    <div className="motion-orbit motion-orbit--two" />
    <div className="motion-centerline" />
    <div className="motion-sheet motion-sheet--purple"><span>01</span><strong>Make the invisible<br />legible.</strong><small>OBSERVE / MODEL</small></div>
    <div className="motion-sheet motion-sheet--paper"><span>02</span><strong>Choose trade-offs<br />on purpose.</strong><small>DECIDE / SHIP</small></div>
    <div className="motion-sheet motion-sheet--citrus"><span>03</span><strong>Keep learning<br />in public.</strong><small>TEST / REPEAT</small></div>
    <div className="motion-caption"><span>SCROLL-DRIVEN SYSTEM STUDY</span><span>03 / 03</span></div>
  </div>
}

function PhilosophySection() {
  return <section className="philosophy-section section-shell" id="philosophy"><MotionGraphicField /><div className="philosophy-copy reveal reveal--up"><SectionLabel number="04 / 09">Engineering philosophy</SectionLabel><h2>Beyond writing code.<br /><span>Understanding the systems behind it.</span></h2><p>Architecture is a series of choices made visible over time. I care about the parts that hold a product together when the first impression fades: reliability, maintainability, security, data integrity, and the trade-offs that make a system honest.</p><RouteLink to="/about" className="text-link">Read the longer version <ArrowRight size={16} /></RouteLink></div><PhilosophyMotion /></section>
}

function ResearchSection() {
  const { researchNotes } = usePortfolioContent()
  return <section className="research-section section-shell" id="research"><MotionGraphicField /><div className="section-heading reveal reveal--up"><div><SectionLabel number="05 / 09">Research &amp; exploration</SectionLabel><h2>Still becoming.</h2></div><p>A growing shelf for technical notes, experiments, prototypes, and lessons from projects. No invented publications — only work that earns its way here.</p></div><div className="research-grid">{researchNotes.map((note, index) => <RouteLink to={`/research/${note.slug}`} className="research-card reveal reveal--up" key={note.slug} style={{ '--delay': `${index * 80}ms` } as CSSProperties}><div className="research-card__meta"><span>{note.label}</span><ArrowUpRight size={18} /></div><h3>{note.title}</h3><p>{note.description}</p><span className="research-card__index">0{index + 1}</span></RouteLink>)}</div></section>
}

function ExperienceSection() {
  const { experience } = usePortfolioContent()
  return <section className="experience-section section-shell" id="experience"><MotionGraphicField /><div className="section-heading reveal reveal--up"><div><SectionLabel number="06 / 09">Experience &amp; education</SectionLabel><h2>A timeline in motion.</h2></div><p>Education, independent work, and active builds — separated clearly so the story stays accurate.</p></div><div className="timeline">{experience.map((item, index) => <div className="timeline-item reveal reveal--up" key={item.title} style={{ '--delay': `${index * 80}ms` } as CSSProperties}><div className="timeline-marker"><span>{item.year}</span><i /></div><div className="timeline-copy"><span className="timeline-type">{item.type}</span><h3>{item.title}</h3><strong>{item.organization}</strong><p>{item.description}</p></div></div>)}</div><RouteLink to="/experience" className="text-link reveal reveal--up">View the full timeline <ArrowRight size={16} /></RouteLink></section>
}

function ContactSection() {
  const { editorial } = usePortfolioContent()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [intent, setIntent] = useState(editorial.contactIntents[0][0])
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, message, intent, website }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.ok) throw new Error(result.error || 'The message could not be sent.')
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'The message could not be sent. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  return <section className="contact-section section-shell section-shell--full" id="contact"><MotionGraphicField tone="purple" />
    <div className="contact-inner">
      <div className="contact-copy reveal reveal--up">
        <SectionLabel number="07 / 09" tone="light">Contact</SectionLabel>
        <h2>Have an idea<br /><span>worth engineering?</span></h2>
        <p>Let&apos;s discuss software, infrastructure, research, or an opportunity to collaborate.</p>
        <SocialLinks />
      </div>
      <div className="contact-form-wrap reveal reveal--scale">
        <div className="form-topline"><span>START A CONVERSATION</span><span>01 / 02</span></div>
        {submitted ? (
          <div className="form-success">
            <div className="success-icon"><Check size={20} /></div>
            <h3>Message prepared.</h3>
            <p>Thanks for reaching out. Your note is ready to be sent directly — I&apos;ll get back to you as soon as I can.</p>
            <a className="button button--dark" href={`mailto:vincent.nyakundi.tech@gmail.com?subject=Conversation from ${encodeURIComponent(email)}&body=${encodeURIComponent(message)}`}>Open email client <ArrowUpRight size={16} /></a>
            <button type="button" className="text-link text-link--dark" onClick={() => setSubmitted(false)}>Edit message</button>
          </div>
        ) : (
            <form onSubmit={handleSubmit}>
            <label className="form-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
            <fieldset className="contact-intents"><legend>What are you exploring?</legend><div>{editorial.contactIntents.map(([label, starter]) => <button key={label} type="button" className={intent === label ? 'is-active' : ''} onClick={() => { setIntent(label); if (!message) setMessage(starter) }}>{label}</button>)}</div></fieldset>
            <label htmlFor="contact-name">Your name<input id="contact-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Vincent, hello..." /></label>
            <label htmlFor="contact-email">Your email<input id="contact-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label>
            <label htmlFor="contact-message">What are you thinking about?<textarea id="contact-message" required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="A project, a question, a system worth exploring..." rows={4} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-bottom"><span>Your note is stored securely for a direct reply.</span><button className="button button--dark" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send message'} <ArrowUpRight size={16} /></button></div>
          </form>
        )}
      </div>
    </div>
  </section>
}

function Footer() {
  return <footer className="site-footer section-shell"><div className="footer-top"><RouteLink to="/" className="wordmark"><img src="/brand/vincey-cloud-logo.png" alt="Vincent Nyakundi logo" className="footer-logo-image" /></RouteLink><p>Independent technologist exploring the systems behind the screen.</p><a className="back-top" href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }}>Back to top <ArrowUpRight size={15} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Vincent Nyakundi</span><div className="footer-links">{navItems.slice(1, 5).map((item) => <RouteLink key={item.href} to={item.href}>{item.label}</RouteLink>)}</div><span>Made with curiosity / 01</span><RouteLink to="/admin" className="footer-private-link" aria-label="Private admin panel"><span className="footer-private-glyph" aria-hidden="true">·</span><span className="footer-private-label">Admin access</span></RouteLink></div></footer>
}

function HomePage() {
  return <><PortraitIntroduction /><SystemTelemetry /><IntroSection /><ProjectGallery /><IntentFilters /><Hero /><WorkPreview /><SystemMap /><EngineeringDecisionLog /><PhilosophySection /><AskTheSystem /><ResearchSection /><ResearchNotebook /><LearningTriad /><ExperienceSection /><ContactSection /></>
}

function InteriorHero({ label, number, title, description, scene = 'systems' }: { label: string; number: string; title: ReactNode; description: string; scene?: string }) {
  return <section className={`interior-hero interior-hero--${scene} section-shell`}><div className={`page-scene page-scene--${scene}`} aria-hidden="true"><span className="page-scene__cube page-scene__cube--one" /><span className="page-scene__cube page-scene__cube--two" /><span className="page-scene__ring" /><span className="page-scene__node" /></div><div className="interior-hero__environment" aria-hidden="true" /><SectionLabel number={number}>{label}</SectionLabel><h1 className="interior-title reveal reveal--up">{title}</h1><p className="interior-description reveal reveal--up">{description}</p></section>
}

function AboutPage() {
  return <><InteriorHero scene="about" label="About the person behind the systems" number="01 / 06" title={<>A technologist in the<br /><em>making.</em></>} description="I am Vincent Nyakundi, a Computer Science student and emerging technologist interested in software, infrastructure, security, and intelligent systems." /><section className="about-body section-shell"><div className="about-statement reveal reveal--up"><span className="pull-quote-mark">“</span><h2>The work is not only to make things run. It is to understand why they hold together.</h2></div><div className="about-columns reveal reveal--up"><div><p>I am building a practice around the intersection of engineering and inquiry. That means learning the fundamentals, shipping real work, documenting the choices, and staying honest about what is still in progress.</p><p>The portfolio is designed as a living record rather than a finished claim. It will grow with the systems, notes, and experiments that deserve to be made public.</p></div><div className="about-facts"><div><span>Focus</span><strong>Software / Cloud / Security / AI</strong></div><div><span>Education</span><strong>Computer Science<br />Machakos University</strong></div><div><span>Approach</span><strong>Curious, precise, evidence-led</strong></div></div></div></section><PhilosophySection /><ContactSection /></>
}

function ExpertisePage() {
  return <><InteriorHero scene="expertise" label="Capabilities, without the theatre" number="02 / 06" title={<>Four ways into<br /><em>the system.</em></>} description="A working map of the technical areas I am developing through projects, study, research, and deliberate practice." /><ExpertiseSection /><section className="section-shell expertise-note"><SectionLabel number="/">A note on evidence</SectionLabel><h2>Competence is demonstrated in the work.</h2><p>I do not use proficiency percentages here. The strongest signal is a clear explanation of what was built, why it was built that way, what remains unresolved, and what the system taught me.</p></section></>
}

function WorkPage() {
  return <><InteriorHero scene="work" label="Selected work & case studies" number="03 / 06" title={<>Builds with<br /><em>consequence.</em></>} description="A compact portfolio of live work and active development — presented with enough context to understand the decisions behind the interface." /><WorkPreview compact /><section className="section-shell work-principles"><SectionLabel number="/">Case study standard</SectionLabel><h2>Every project should explain the system, not just show the surface.</h2><div className="principles-grid"><span>01 / Context</span><span>02 / Decisions</span><span>03 / Trade-offs</span><span>04 / Status</span></div></section></>
}

function CaseStudyPage({ project }: { project: Project }) {
  return <><InteriorHero scene={project.slug === 'aurell' ? 'aurell' : 'oralcare'} label={`${project.kicker} / ${project.status}`} number="03 / 06" title={<>{project.title}<br /><em>{project.title === 'AURELL' ? 'in formation.' : 'in the wild.'}</em></>} description={project.description} /><section className="case-study-visual section-shell"><ProjectVisual project={project} /></section><section className="case-study section-shell"><div className="case-study__intro"><StatusPill status={project.status} /><h2>{project.result}</h2><p>{project.overview}</p>{project.resources.map((resource) => <a href={resource.href} key={resource.label} className="button button--primary" target={resource.external ? '_blank' : undefined} rel={resource.external ? 'noreferrer' : undefined}>{resource.label} <ArrowUpRight size={16} /></a>)}</div><ProjectArtifact project={project} /><BuildState project={project} /><div className="case-study__sections"><CaseBlock label="01 / Problem or opportunity" title="Start with the tension."><p>{project.problem}</p></CaseBlock><CaseBlock label="02 / Objectives" title="What the system needs to make possible."><ul>{project.objectives.map((objective) => <li key={objective}><Check size={16} />{objective}</li>)}</ul></CaseBlock><CaseBlock label="03 / Proposed solution" title="Make the path easier to see."><p>{project.solution}</p></CaseBlock><CaseBlock label="04 / System architecture" title="Structure is part of the interface."><p>{project.architecture}</p></CaseBlock><CaseBlock label="05 / Implementation decisions" title="Small decisions compound."><ul>{project.implementation.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></CaseBlock><CaseBlock label="06 / Challenges & trade-offs" title="The work is in the constraints."><ul>{project.tradeoffs.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></CaseBlock><CaseBlock label="07 / Current status" title="No overclaiming."><p>{project.currentStatus}</p></CaseBlock></div></section><ContactSection /></>
}

function CaseBlock({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <article className="case-block reveal reveal--up"><div className="case-block__label">{label}</div><div><h3>{title}</h3>{children}</div></article>
}

function ResearchPage() {
  const { researchNotes } = usePortfolioContent()
  return <><InteriorHero scene="research" label="Technical notes & exploration" number="04 / 06" title={<>Questions worth<br /><em>following.</em></>} description="A future-facing section for genuine technical writing, experiments, prototypes, and lessons from projects." /><section className="section-shell research-page-grid"><div className="research-empty reveal reveal--up"><span className="empty-index">RESEARCH / 00</span><h2>The shelf is intentionally small.</h2><p>Good research takes time. This space will grow as notes become clear enough to share, with no fabricated publications filling the gaps.</p><RouteLink to="/contact" className="text-link">Suggest a question <ArrowRight size={16} /></RouteLink></div>{researchNotes.map((note, index) => <RouteLink to={`/research/${note.slug}`} key={note.slug} className="research-card research-card--large reveal reveal--up" style={{ '--delay': `${index * 80}ms` } as CSSProperties}><div className="research-card__meta"><span>{note.label}</span><ArrowUpRight size={18} /></div><h3>{note.title}</h3><p>{note.description}</p><span className="research-card__index">0{index + 1}</span></RouteLink>)}</section></>
}

function ResearchDetailPage({ note }: { note: typeof fallbackResearchNotes[number] }) {
  return <><InteriorHero label={note.label} number="04 / 06" title={<>A note on<br /><em>{note.title.toLowerCase()}</em></>} description={note.description} /><section className="research-detail section-shell"><div className="research-detail__aside"><span>FIELD NOTE</span><span>VINCEY / 2026</span></div><article><p className="lead-paragraph">This page is a placeholder for a genuine research note. The structure is ready for a technical essay, a prototype log, or a documented lesson from a project.</p><p>When the material is ready, it will explain the question, the working hypothesis, the implementation or investigation, what changed along the way, and what remains unresolved.</p><RouteLink to="/research" className="text-link">Back to research <ArrowRight size={16} /></RouteLink></article></section></>
}

function ExperiencePage() {
  return <><InteriorHero scene="experience" label="Education, projects & milestones" number="05 / 06" title={<>The path is<br /><em>still unfolding.</em></>} description="A factual timeline that separates formal education, independent projects, and active experiments." /><ExperienceSection /><section className="section-shell experience-note"><div className="experience-note__mark">/</div><h2>The most important line is the next one.</h2><p>Experience is not only a list of titles. It is the accumulated ability to make better decisions in the next system.</p></section></>
}

function ContactPage() {
  return <><InteriorHero scene="contact" label="Open channel" number="06 / 06" title={<>Let&apos;s make<br /><em>something hold.</em></>} description="If you are thinking about software, infrastructure, research, or a thoughtful collaboration, send a note." /><ContactSection /></>
}

function PresentationsPage() {
  const { documents } = usePortfolioContent()
  const presentations = documents.presentations || []
  return <><InteriorHero scene="research" label="Talks, decks & shared thinking" number="05 / 07" title={<>Ideas worth<br /><em>showing.</em></>} description="A growing library of presentations and technical material from Vincent Nyakundi's work across software, cloud, security, and intelligent systems." /><section className="documents-page section-shell"><div className="documents-page__intro"><div><SectionLabel number="01 / 02">Current documents</SectionLabel><h2>Useful material,<br /><em>kept close.</em></h2></div><a className="button button--primary" href={documents.cv?.url || fallbackDocuments.cv.url} download><Download size={16} /> Download current CV</a></div>{presentations.length === 0 ? <div className="documents-empty"><Presentation size={28} /><h3>The presentation shelf is ready.</h3><p>New decks and talks will appear here when they are added through the private admin library.</p></div> : <div className="documents-grid">{presentations.map((document, index) => <article className="document-card reveal reveal--up" key={document.id} style={{ '--delay': `${index * 80}ms` } as CSSProperties}><div className="document-card__top"><span>0{index + 1} / PRESENTATION</span><Presentation size={18} /></div><h3>{document.title}</h3><p>{document.description || 'A presentation from the VINCEY technical archive.'}</p><div className="document-card__foot"><span>{document.fileName}</span><a className="arrow-link" href={document.url} target="_blank" rel="noreferrer">Open file <ArrowUpRight size={16} /></a></div></article>)}</div>}</section></>
}

type AdminProject = {
  slug: string
  title: string
  kicker?: string
  description?: string
  status?: string
  liveUrl?: string | null
  currentStatus?: string
  images?: ProjectImage[]
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [projectsState, setProjectsState] = useState<AdminProject[]>([])
  const [submissions, setSubmissions] = useState<Array<{ id: string; name: string; email: string; message: string; intent?: string; created_at: string }>>([])
  const [documentsState, setDocumentsState] = useState<DocumentLibrary>(fallbackDocuments)
  const [selected, setSelected] = useState<AdminProject | null>(null)
  const [newProject, setNewProject] = useState({ slug: '', title: '', kicker: '', description: '', status: 'Planned', liveUrl: '', currentStatus: '' })
  const [presentationDraft, setPresentationDraft] = useState({ title: '', description: '' })
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState<'cv' | 'presentation' | null>(null)
  const [editorialJson, setEditorialJson] = useState(() => JSON.stringify(editorialDefaults, null, 2))

  const request = async (path: string, options?: RequestInit) => {
    const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Request failed')
    return body
  }

  const loadDashboard = async () => {
    const [projectsResponse, submissionsResponse, editorialResponse, documentsResponse] = await Promise.all([request('/api/admin/projects'), request('/api/admin/submissions'), request('/api/admin/editorial'), request('/api/admin/documents')])
    setProjectsState(projectsResponse.projects || [])
    setSubmissions(submissionsResponse.submissions || [])
    setDocumentsState(documentsResponse.documents || fallbackDocuments)
    setEditorialJson(JSON.stringify({ ...editorialDefaults, ...(editorialResponse.editorial || {}) }, null, 2))
    setAuthenticated(true)
  }

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    try { await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }); setPassword(''); await loadDashboard() } catch (error) { setMessage(error instanceof Error ? error.message : 'Login failed') }
  }

  const saveProject = async (event: FormEvent) => {
    event.preventDefault()
    if (!selected) return
    try { const response = await request(`/api/admin/projects/${selected.slug}`, { method: 'PUT', body: JSON.stringify(selected) }); setProjectsState((items) => items.map((item) => item.slug === selected.slug ? response.project : item)); setSelected(response.project); setMessage('Project saved.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save project') }
  }

  const createProject = async (event: FormEvent) => {
    event.preventDefault()
    try { const response = await request('/api/admin/projects', { method: 'POST', body: JSON.stringify(newProject) }); setProjectsState((items) => [...items, response.project]); setSelected(response.project); setNewProject({ slug: '', title: '', kicker: '', description: '', status: 'Planned', liveUrl: '', currentStatus: '' }); setMessage('Project created.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not create project') }
  }

  const uploadProjectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selected) return
    setUploading(true)
    setMessage('Preparing secure image upload…')
    try {
      const prepared = await request(`/api/admin/projects/${selected.slug}/images/presign`, { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type, bytes: file.size }) })
      const uploadResponse = await fetch(prepared.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!uploadResponse.ok) throw new Error('The image could not be transferred to storage.')
      const finalized = await request(`/api/admin/projects/${selected.slug}/images`, { method: 'POST', body: JSON.stringify({ key: prepared.key, fileName: file.name, contentType: file.type, bytes: file.size, role: 'hero', alt: `${selected.title} project image` }) })
      setProjectsState((items) => items.map((item) => item.slug === selected.slug ? finalized.project : item))
      setSelected(finalized.project)
      setMessage('Project image uploaded. Open public pages will update automatically.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not upload project image')
    } finally { setUploading(false) }
  }

  const uploadDocument = async (event: ChangeEvent<HTMLInputElement>, kind: 'cv' | 'presentation') => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (kind === 'presentation' && !presentationDraft.title.trim()) { setMessage('Add a presentation title before uploading.'); return }
    setUploadingDocument(kind)
    setMessage(`Preparing secure ${kind === 'cv' ? 'CV' : 'presentation'} upload…`)
    try {
      const prepared = await request('/api/admin/documents/presign', { method: 'POST', body: JSON.stringify({ kind, filename: file.name, contentType: file.type, bytes: file.size }) })
      const uploadResponse = await fetch(prepared.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!uploadResponse.ok) throw new Error('The document could not be transferred to storage.')
      const finalized = await request('/api/admin/documents', { method: 'POST', body: JSON.stringify({ kind, key: prepared.key, fileName: file.name, contentType: file.type, bytes: file.size, title: kind === 'cv' ? 'Vincent Nyakundi CV' : presentationDraft.title, description: kind === 'cv' ? 'The current professional CV for Vincent Nyakundi.' : presentationDraft.description }) })
      setDocumentsState(finalized.documents || fallbackDocuments)
      if (kind === 'presentation') setPresentationDraft({ title: '', description: '' })
      setMessage(`${kind === 'cv' ? 'CV' : 'Presentation'} uploaded and published to the public site.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not upload ${kind}`)
    } finally { setUploadingDocument(null) }
  }

  const removePresentation = async (id: string) => {
    try { const response = await request(`/api/admin/documents/${id}`, { method: 'DELETE' }); setDocumentsState(response.documents || fallbackDocuments); setMessage('Presentation removed from the public library.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not remove presentation') }
  }

  const saveEditorial = async (event: FormEvent) => {
    event.preventDefault()
    try { const parsed = JSON.parse(editorialJson); await request('/api/admin/editorial', { method: 'PUT', body: JSON.stringify(parsed) }); setMessage('Editorial systems content saved.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save editorial content') }
  }

  if (!authenticated) return <section className="admin-page section-shell"><div className="admin-login"><SectionLabel number="PRIVATE / 01">VINCEY administration</SectionLabel><h1>Keep the system<br /><em>legible.</em></h1><p>Manage public project entries, documents, and messages from the private operations surface.</p><form onSubmit={login} className="admin-form"><label>Admin password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label><button className="button button--primary" type="submit">Enter admin <ArrowUpRight size={16} /></button>{message && <span className="form-message form-message--error">{message}</span>}</form></div></section>

  return <section className="admin-page section-shell"><div className="admin-header"><div><SectionLabel number="PRIVATE / 02">Operations surface</SectionLabel><h1>Portfolio<br /><em>control.</em></h1></div><button type="button" className="button button--text" onClick={async () => { await request('/api/admin/logout', { method: 'POST' }); setAuthenticated(false) }}>Sign out <ArrowUpRight size={16} /></button></div>{message && <p className="admin-notice">{message}</p>}<div className="admin-layout"><div className="admin-column"><div className="admin-panel"><div className="admin-panel__heading"><div><span className="admin-kicker">PROJECT ENTRIES</span><h2>Live portfolio content</h2></div><span>{projectsState.length} records</span></div><div className="admin-project-list">{projectsState.map((project) => <button type="button" key={project.slug} className={`admin-project-row ${selected?.slug === project.slug ? 'admin-project-row--active' : ''}`} onClick={() => setSelected(project)}><span><strong>{project.title}</strong><small>{project.slug}</small></span><span>{project.status || 'Planned'} <ArrowUpRight size={15} /></span></button>)}</div></div><div className="admin-panel"><div className="admin-panel__heading"><div><span className="admin-kicker">NEW RECORD</span><h2>Add a project</h2></div><Plus size={20} /></div><form className="admin-form admin-form--grid" onSubmit={createProject}><label>Slug<input value={newProject.slug} onChange={(event) => setNewProject({ ...newProject, slug: event.target.value })} required /></label><label>Title<input value={newProject.title} onChange={(event) => setNewProject({ ...newProject, title: event.target.value })} required /></label><label>Kicker<input value={newProject.kicker} onChange={(event) => setNewProject({ ...newProject, kicker: event.target.value })} /></label><label>Status<input value={newProject.status} onChange={(event) => setNewProject({ ...newProject, status: event.target.value })} /></label><label className="admin-form__wide">Description<textarea value={newProject.description} onChange={(event) => setNewProject({ ...newProject, description: event.target.value })} rows={3} /></label><button className="button button--primary" type="submit">Create project <Plus size={16} /></button></form></div></div><div className="admin-column">{selected ? <form className="admin-panel admin-form" onSubmit={saveProject}><div className="admin-panel__heading"><div><span className="admin-kicker">EDIT RECORD</span><h2>{selected.title}</h2></div><Save size={20} /></div><label>Slug<input value={selected.slug} onChange={(event) => setSelected({ ...selected, slug: event.target.value })} /></label><label>Title<input value={selected.title} onChange={(event) => setSelected({ ...selected, title: event.target.value })} /></label><label>Kicker<input value={selected.kicker || ''} onChange={(event) => setSelected({ ...selected, kicker: event.target.value })} /></label><label>Status<input value={selected.status || ''} onChange={(event) => setSelected({ ...selected, status: event.target.value })} /></label><label>Live URL<input type="url" value={selected.liveUrl || ''} onChange={(event) => setSelected({ ...selected, liveUrl: event.target.value })} /></label><label>Description<textarea value={selected.description || ''} onChange={(event) => setSelected({ ...selected, description: event.target.value })} rows={4} /></label><label>Current status<textarea value={selected.currentStatus || ''} onChange={(event) => setSelected({ ...selected, currentStatus: event.target.value })} rows={4} /></label><div className="admin-media-field"><span className="admin-kicker">PROJECT IMAGE</span>{selected.images?.[0] && <img className="admin-media-preview" src={selected.images[0].url} alt={selected.images[0].alt} />}<label className="admin-upload-label">{uploading ? 'Uploading…' : 'Upload / replace hero image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadProjectImage} disabled={uploading} /></label><small>JPG, PNG, WebP, or AVIF up to 8 MB. The public visual updates after storage confirmation.</small></div><button className="button button--primary" type="submit">Save changes <Save size={16} /></button></form> : <div className="admin-panel admin-panel--empty"><span className="admin-kicker">SELECT A PROJECT</span><h2>Choose a record to edit.</h2><p>Changes are written to the Neon-backed portfolio content record.</p></div>}<div className="admin-panel admin-panel--documents"><div className="admin-panel__heading"><div><span className="admin-kicker">DOCUMENT LIBRARY</span><h2>CV &amp; presentations</h2></div><FileText size={20} /></div><div className="admin-document-block"><div><strong>Current CV</strong><small>{documentsState.cv?.fileName || 'vincent-nyakundi-cv.pdf'}</small></div><a className="text-link" href={documentsState.cv?.url || fallbackDocuments.cv.url} target="_blank" rel="noreferrer">Open <ArrowUpRight size={15} /></a><label className="admin-upload-label"><Upload size={15} />{uploadingDocument === 'cv' ? 'Uploading CV…' : 'Upload / replace CV'}<input type="file" accept="application/pdf" onChange={(event) => uploadDocument(event, 'cv')} disabled={uploadingDocument !== null} /></label><small>PDF only, up to 25 MB. Replacing the CV updates the public Download CV links.</small></div><div className="admin-document-block"><strong>Add presentation</strong><label>Title<input value={presentationDraft.title} onChange={(event) => setPresentationDraft({ ...presentationDraft, title: event.target.value })} placeholder="e.g. Cloud systems briefing" /></label><label>Description<textarea value={presentationDraft.description} onChange={(event) => setPresentationDraft({ ...presentationDraft, description: event.target.value })} rows={3} placeholder="A short description for visitors." /></label><label className="admin-upload-label"><Presentation size={15} />{uploadingDocument === 'presentation' ? 'Uploading presentation…' : 'Upload presentation'}<input type="file" accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={(event) => uploadDocument(event, 'presentation')} disabled={uploadingDocument !== null} /></label><small>PDF, PPT, or PPTX up to 25 MB.</small></div><div className="admin-document-list">{documentsState.presentations.length === 0 ? <p className="admin-empty-copy">No presentations published yet.</p> : documentsState.presentations.map((document) => <div className="admin-document-row" key={document.id}><div><strong>{document.title}</strong><small>{document.fileName}</small></div><div><a href={document.url} target="_blank" rel="noreferrer" aria-label={`Open ${document.title}`}><ArrowUpRight size={15} /></a><button type="button" onClick={() => removePresentation(document.id)} aria-label={`Remove ${document.title}`}><Trash2 size={15} /></button></div></div>)}</div></div><div className="admin-panel"><div className="admin-panel__heading"><div><span className="admin-kicker">CONTACT INBOX</span><h2>Recent submissions</h2></div><span>{submissions.length} messages</span></div><div className="submission-list">{submissions.length === 0 ? <p className="admin-empty-copy">No submissions yet.</p> : submissions.map((submission) => <article className="submission" key={submission.id}><div><strong>{submission.name}</strong><a href={`mailto:${submission.email}`}>{submission.email}</a></div><time dateTime={submission.created_at}>{new Date(submission.created_at).toLocaleDateString()}</time><p>{submission.intent && <strong className="submission-intent">{submission.intent}</strong>}{submission.message}</p></article>)}</div></div><div className="admin-panel admin-panel--editorial"><div className="admin-panel__heading"><div><span className="admin-kicker">EDITORIAL SYSTEMS</span><h2>Map, notes &amp; prompts</h2></div><Save size={20} /></div><p className="admin-empty-copy">Edit the structured JSON for the systems map, build states, decision log, research notebook, learning triad, field status, and contact intents. Changes appear on the public site after refresh.</p><form className="admin-form" onSubmit={saveEditorial}><textarea className="admin-editorial-textarea" value={editorialJson} onChange={(event) => setEditorialJson(event.target.value)} rows={18} spellCheck={false} /><button className="button button--primary" type="submit">Save editorial content <Save size={16} /></button></form></div></div></div></section>
}

function NotFoundPage() {
  return <section className="not-found section-shell"><SectionLabel number="404 / 404">Signal not found</SectionLabel><h1>This route<br /><em>isn&apos;t here.</em></h1><p>The page may have moved, or it may still be a system worth building.</p><RouteLink to="/" className="button button--primary">Return home <ArrowUpRight size={17} /></RouteLink></section>
}

function App() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'dark' | 'light'>(() => window.localStorage.getItem('vincey-theme') === 'light' ? 'light' : 'dark')
  const [content, setContent] = useState<PortfolioContent>(fallbackContent)
  const [transitioning, setTransitioning] = useState(false)
  useRevealObserver(pathname)
  useScrollChoreography(pathname)
  useEffect(() => {
    let active = true
    fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject(new Error('content unavailable'))).then((payload) => {
      if (!active || !payload.content?.portfolio) return
      setContent(mergeContent(payload.content))
    }).catch(() => undefined)
    return () => { active = false }
  }, [])
  useEffect(() => {
    const stream = new EventSource('/api/content/stream')
    const refresh = () => fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject(new Error('content unavailable'))).then((payload) => {
      if (!payload.content?.portfolio) return
      setContent(mergeContent(payload.content))
    }).catch(() => undefined)
    stream.addEventListener('content-updated', refresh)
    return () => { stream.removeEventListener('content-updated', refresh); stream.close() }
  }, [])
  useEffect(() => { updateMetadata(pathname, content) }, [pathname, content])
  useEffect(() => { window.localStorage.setItem('vincey-theme', theme) }, [theme])
  useEffect(() => {
    setTransitioning(true)
    const timer = window.setTimeout(() => setTransitioning(false), 420)
    return () => window.clearTimeout(timer)
  }, [pathname])
  const project = useMemo(() => pathname.startsWith('/work/') ? content.projects.find((item) => item.slug === pathname.split('/')[2]) : undefined, [pathname, content.projects])
  const note = useMemo(() => pathname.startsWith('/research/') ? content.researchNotes.find((item) => item.slug === pathname.split('/')[2]) : undefined, [pathname, content.researchNotes])
  const page = pathname === '/' ? <HomePage />
    : pathname === '/about' ? <AboutPage />
      : pathname === '/expertise' ? <ExpertisePage />
        : pathname === '/work' ? <WorkPage />
          : project ? <CaseStudyPage project={project} />
            : pathname === '/research' ? <ResearchPage />
              : note ? <ResearchDetailPage note={note} />
                : pathname === '/presentations' ? <PresentationsPage />
                : pathname === '/experience' ? <ExperiencePage />
                  : pathname === '/contact' ? <ContactPage />
                    : pathname === '/admin' ? <AdminPage />
                    : <NotFoundPage />

  const transitionIsAurell = pathname === '/work/aurell'
  return <PortfolioContext.Provider value={content}><div className={`app ${pathname === '/' ? 'app--home' : ''}`} data-theme={theme}><LuxuryLoader /><div className={`route-transition ${transitioning ? 'route-transition--active' : ''} ${transitionIsAurell ? 'route-transition--aurell' : ''}`} aria-hidden="true"><span>{transitionIsAurell ? 'AURELL / CASE STUDY' : 'VINCEY / SYSTEMS'}</span></div><CursorParticleTrail /><SiteNav pathname={pathname} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} /><main>{page}</main><Footer /></div></PortfolioContext.Provider>
}

export default App
