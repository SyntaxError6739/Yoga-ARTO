import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Bookmark, CalendarDays,
  Check, CheckCircle2, ChevronDown, Compass, Earth, Filter, Heart, Leaf, MapPin,
  Menu, Search, ShieldCheck, Sparkles, Sprout, TreePine, Users, Waves, X
} from 'lucide-react';
import './App.css';
import { addJourneyItem, loadDatabaseState, saveExperience } from './api';
import type { Opportunity } from './types';

const opportunities: Opportunity[] = [
  {
    id: 1, title: 'Restore the mangrove coast', place: 'Gazi Bay, Kenya', region: 'Coast',
    category: 'Nature', duration: '2.5 hours', contribution: 'Plant native seedlings',
    capacity: '4 spots left', level: 'Easy',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=85',
    description: 'Join local conservation stewards to support mangrove restoration and learn why these coastal forests matter.',
    tag: 'Community favourite'
  },
  {
    id: 2, title: 'A morning with local makers', place: 'Lamu Old Town, Kenya', region: 'Coast',
    category: 'Culture', duration: '3 hours', contribution: 'Learn & exchange skills',
    capacity: '6 spots left', level: 'Easy',
    image: 'https://images.unsplash.com/photo-1513415277900-a62401e19be4?auto=format&fit=crop&w=1000&q=85',
    description: 'Spend time with local artisans in a community-approved workshop where cultural knowledge stays in local hands.',
    tag: 'Culture-led'
  },
  {
    id: 3, title: 'Keep the shoreline thriving', place: 'Watamu, Kenya', region: 'Coast',
    category: 'Nature', duration: '90 minutes', contribution: 'Reduce coastal waste',
    capacity: '8 spots left', level: 'Easy',
    image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1000&q=85',
    description: 'Work alongside a local beach team to collect, sort and record waste to support better coastal decisions.',
    tag: 'High local value'
  },
  {
    id: 4, title: 'Community biodiversity walk', place: 'Arabuko-Sokoke, Kenya', region: 'Forest',
    category: 'Biodiversity', duration: '2 hours', contribution: 'Record species observations',
    capacity: '3 spots left', level: 'Moderate',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=85',
    description: 'Observe local biodiversity with a community guide and submit sightings for review by a local expert.',
    tag: 'Guided by locals'
  }
];

const navItems = [
  { label: 'Discover', icon: Compass },
  { label: 'My journey', icon: Sprout },
  { label: 'Impact report', icon: Activity },
  { label: 'Community', icon: Users }
];

function App() {
  const [availableOpportunities, setAvailableOpportunities] = useState<Opportunity[]>(opportunities);
  const [activeNav, setActiveNav] = useState('Discover');
  const [category, setCategory] = useState('All experiences');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState<number[]>([2]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [joined, setJoined] = useState<number[]>([]);
  const [toast, setToast] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    loadDatabaseState().then((state) => {
      setAvailableOpportunities(state.opportunities);
      setSaved(state.saved);
      setJoined(state.joined);
    }).catch(() => {
      notify('Database unavailable; using this session locally');
    });
  }, []);

  const filtered = useMemo(() => availableOpportunities.filter((item) => {
    const matchesCategory = category === 'All experiences' || item.category === category;
    const q = search.toLowerCase();
    return matchesCategory && `${item.title} ${item.place} ${item.contribution}`.toLowerCase().includes(q);
  }), [category, search]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const toggleSave = (id: number) => {
    const nextSaved = !saved.includes(id);
    setSaved((old) => nextSaved ? [...old, id] : old.filter((x) => x !== id));
    saveExperience(id, nextSaved).then(() => {
      notify(nextSaved ? 'Experience saved for later' : 'Removed from your saved experiences');
    }).catch(() => notify('Could not save this change; it is kept for this session'));
  };

  const joinActivity = (item: Opportunity) => {
    if (!joined.includes(item.id)) setJoined((old) => [...old, item.id]);
    addJourneyItem(item.id).catch(() => notify('Could not sync your journey; it is kept for this session'));
    setSelected(null);
    setActiveNav('My journey');
    notify(`Added “${item.title}” to your journey`);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Leaf size={22} strokeWidth={2.3} /></div>
          <div><div className="brand-name">arto<span>.</span></div><div className="brand-caption">REGENERATIVE TRAVEL</div></div>
          <button className="icon-button mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={19}/></button>
        </div>

        <div className="profile-switch">
          <div className="avatar">AY</div>
          <div className="profile-copy"><strong>Your journey</strong><span>Curious explorer</span></div>
          <ChevronDown size={16} className="muted-icon"/>
        </div>

        <div className="nav-label">YOUR SPACE</div>
        <nav className="side-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-link ${activeNav === label ? 'active' : ''}`} onClick={() => {setActiveNav(label); setMobileMenu(false);}}>
              <Icon size={18} strokeWidth={1.9}/><span>{label}</span>
              {label === 'My journey' && joined.length > 0 && <span className="nav-count">{joined.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer"/>
        <div className="community-card">
          <div className="community-icon"><Heart size={17} fill="currentColor"/></div>
          <p className="community-title">Travel can leave a place better.</p>
          <p className="community-copy">Every small contribution can support a stronger destination.</p>
          <button onClick={() => setActiveNav('Impact report')} className="text-action">See your impact <ArrowRight size={14}/></button>
          <div className="community-leaves"><Sprout size={72}/></div>
        </div>
        <div className="sidebar-footer"><ShieldCheck size={14}/> Community-first by design</div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={21}/></button>
          <div className="breadcrumb">Your space <span>/</span> <strong>{activeNav}</strong></div>
          <div className="topbar-right">
            <span className="privacy-pill"><ShieldCheck size={14}/> Privacy-first</span>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up!')}><Bell size={19}/><i/></button>
            <div className="top-avatar">AY</div>
          </div>
        </header>

        {activeNav === 'Discover' && <>
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={14}/> YOUR NEXT CHAPTER, WITH PURPOSE</div>
              <h1>See the world.<br/><em>Give something back.</em></h1>
              <p className="welcome-subtitle">Find meaningful experiences that help places and communities thrive.</p>
            </div>
            <div className="welcome-art" aria-label="Illustration of regenerative nature">
              <div className="art-sun"/><div className="art-hill hill-one"/><div className="art-hill hill-two"/>
              <div className="art-tree"><span/><i/><b/></div>
              <div className="art-note"><span className="live-dot"/> Travel with a lighter footprint</div>
            </div>
          </section>

          <section className="impact-strip">
            <div className="impact-intro"><div className="impact-leaf"><Sprout size={21}/></div><div><strong>Regeneration starts here</strong><span>Small actions. Meaningful local change.</span></div></div>
            <div className="strip-stat"><strong>Community-led</strong><span>Local priorities first</span></div>
            <div className="strip-stat"><strong>Evidence-backed</strong><span>Impact, not just promises</span></div>
            <div className="strip-stat"><strong>Privacy-respecting</strong><span>Your data, treated carefully</span></div>
          </section>

          <section className="section-heading">
            <div><div className="eyebrow">MADE FOR MEANINGFUL TRAVEL</div><h2>Experiences with a <em>positive trace</em></h2><p>Community-approved ways to make your time count.</p></div>
            <button className="view-all" onClick={() => {setCategory('All experiences'); setSearch('');}}>Explore all <ArrowRight size={16}/></button>
          </section>

          <section className="discovery-tools">
            <label className="search-box"><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search places, experiences, or impact..." /></label>
            <div className="filter-wrap"><Filter size={16}/><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by experience type"><option>All experiences</option><option>Nature</option><option>Culture</option><option>Biodiversity</option></select><ChevronDown size={14}/></div>
          </section>

          <section className="experience-grid">
            {filtered.map((item) => <article className="experience-card" key={item.id}>
              <div className="card-image" style={{backgroundImage: `linear-gradient(180deg, rgba(10,30,24,.02), rgba(10,30,24,.28)), url("${item.image}")`}}>
                <span className="card-tag"><Leaf size={12}/>{item.tag}</span>
                <button className={`save-button ${saved.includes(item.id) ? 'is-saved' : ''}`} onClick={() => toggleSave(item.id)} aria-label={saved.includes(item.id) ? 'Unsave experience' : 'Save experience'}><Bookmark size={17} fill={saved.includes(item.id) ? 'currentColor' : 'none'}/></button>
              </div>
              <div className="card-content">
                <div className="place-line"><MapPin size={13}/>{item.place}</div>
                <h3>{item.title}</h3>
                <p className="card-description">{item.description}</p>
                <div className="card-meta"><span><CalendarDays size={14}/>{item.duration}</span><span><Sprout size={14}/>{item.level}</span></div>
                <div className="card-bottom"><div><small>YOUR CONTRIBUTION</small><strong>{item.contribution}</strong></div><button className="round-arrow" onClick={() => setSelected(item)} aria-label={`View ${item.title}`}><ArrowUpRight size={19}/></button></div>
              </div>
            </article>)}
          </section>
          {filtered.length === 0 && <div className="empty-state"><Search size={24}/><strong>No experiences found</strong><span>Try another search or select a different category.</span></div>}

          <section className="capacity-banner">
            <div className="capacity-icon"><Waves size={22}/></div>
            <div className="capacity-copy"><span className="eyebrow">TRAVEL THAT LISTENS</span><h3>Better moments begin with the right balance.</h3><p>ARTO is designed to help guide visitors toward places and times that work for destinations—not just tourists.</p></div>
            <div className="capacity-status"><span className="status-dot"/> Capacity-aware planning <ArrowRight size={15}/></div>
          </section>
        </>}

        {activeNav === 'My journey' && <section className="subpage">
          <div className="eyebrow"><Compass size={14}/> YOUR PERSONAL JOURNEY</div><h1>Your journey,<br/><em>with purpose.</em></h1>
          <p className="welcome-subtitle">Your selected experiences and next steps, all in one place.</p>
          {joined.length === 0 ? <div className="journey-empty"><div className="empty-illustration"><Sprout size={38}/></div><h2>Your next meaningful moment starts here</h2><p>You haven’t added an experience yet. Explore community-approved activities and choose one that feels right for you.</p><button className="primary-button" onClick={() => setActiveNav('Discover')}>Discover experiences <ArrowRight size={16}/></button></div> :
          <div className="journey-list">{availableOpportunities.filter(x => joined.includes(x.id)).map(x => <div className="journey-item" key={x.id}><img src={x.image} alt=""/><div><span className="eyebrow">ADDED TO YOUR JOURNEY</span><h3>{x.title}</h3><p><MapPin size={14}/>{x.place} <span>·</span> {x.duration}</p><div className="pending-badge">Planning stage</div></div><button className="outline-button" onClick={() => setSelected(x)}>View details</button></div>)}</div>}
          <div className="note-panel"><ShieldCheck size={19}/><div><strong>Your choices stay yours</strong><p>This demo stores your selections only in the current page session. No booking or payment is processed.</p></div></div>
        </section>}

        {activeNav === 'Impact report' && <section className="subpage">
          <div className="eyebrow"><Activity size={14}/> YOUR REGENERATION REPORT</div><h1>Every contribution<br/><em>has a story.</em></h1><p className="welcome-subtitle">A transparent view of what you have contributed—and what still needs validation.</p>
          <div className="report-summary"><div><span className="report-icon"><Sprout size={20}/></span><small>ACTIVITIES JOINED</small><strong>{joined.length}</strong><span>In this demo session</span></div><div><span className="report-icon"><ShieldCheck size={20}/></span><small>VERIFIED CONTRIBUTIONS</small><strong>0</strong><span>No claims verified yet</span></div><div><span className="report-icon"><Earth size={20}/></span><small>LONG-TERM OUTCOMES</small><strong>Pending</strong><span>Follow-up evidence required</span></div></div>
          <div className="report-table"><div className="table-title"><div><h2>Contribution activity</h2><p>Verification status is always visible.</p></div><span className="demo-chip">DEMO DATA</span></div>
            <div className="verification-row"><div className="verification-symbol pending"><CalendarDays size={17}/></div><div className="verification-main"><strong>Sample mangrove restoration</strong><span>Example record · 28 seedlings planted</span></div><span className="verification-status pending-status">Long-term outcome pending</span></div>
            <div className="verification-row"><div className="verification-symbol verified"><CheckCircle2 size={17}/></div><div className="verification-main"><strong>Sample beach cleanup</strong><span>Example record · 12.4 kg waste collected</span></div><span className="verification-status verified-status">Evidence-supported</span></div>
            <p className="report-disclaimer">Illustrative examples from the project documentation—not live or independently verified results. Real impact claims require evidence and community validation.</p>
          </div>
        </section>}

        {activeNav === 'Community' && <section className="subpage">
          <div className="eyebrow"><Users size={14}/> COMMUNITY CO-GOVERNANCE</div><h1>Local voices.<br/><em>Lasting value.</em></h1><p className="welcome-subtitle">Communities should help decide which experiences happen, what meaningful impact looks like, and how contributions are validated.</p>
          <div className="community-feature-grid"><div className="governance-card"><div className="governance-icon"><Users size={22}/></div><h3>Community-defined priorities</h3><p>Local groups can shape regenerative needs, capacity limits, cultural protocols and what success means for their destination.</p><span><Check size={15}/> Local decision-making first</span></div><div className="governance-card"><div className="governance-icon"><ShieldCheck size={22}/></div><h3>Human-led validation</h3><p>Facilitators and knowledge holders review claims. AI can assist with evidence, but it does not replace local judgement.</p><span><Check size={15}/> Transparent evidence status</span></div><div className="governance-card"><div className="governance-icon"><Heart size={22}/></div><h3>Respect for culture</h3><p>Community-curated knowledge and cultural guardrails help protect sensitive traditions from inappropriate commercialization.</p><span><Check size={15}/> Culture with consent</span></div></div>
          <div className="note-panel"><ShieldCheck size={19}/><div><strong>Designed around trust</strong><p>ARTO’s proposed model uses privacy-conscious records, clear validation roles, and an auditable history for impact claims.</p></div></div>
        </section>}

        <footer className="main-footer"><div className="footer-brand"><Leaf size={15}/> arto<span>.</span></div><span>Travel that helps places thrive.</span><span className="footer-right">Community-first · Privacy-respecting · Evidence-led</span></footer>
      </main>

      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close icon-button" onClick={() => setSelected(null)} aria-label="Close details"><X size={20}/></button>
        <img className="modal-image" src={selected.image} alt=""/>
        <div className="modal-body"><span className="card-tag modal-tag"><Leaf size={12}/>{selected.tag}</span><div className="place-line"><MapPin size={13}/>{selected.place}</div><h2 id="modal-title">{selected.title}</h2><p>{selected.description}</p>
          <div className="modal-facts"><div><CalendarDays size={16}/><span><small>DURATION</small><strong>{selected.duration}</strong></span></div><div><Users size={16}/><span><small>AVAILABILITY</small><strong>{selected.capacity}</strong></span></div><div><Sprout size={16}/><span><small>ACTIVITY LEVEL</small><strong>{selected.level}</strong></span></div></div>
          <div className="verification-note"><ShieldCheck size={18}/><span><strong>Community-approved activity</strong><small>Participation and impact would be reviewed using evidence and local validation.</small></span></div>
          <button className="primary-button full-button" onClick={() => joinActivity(selected)}>{joined.includes(selected.id) ? 'Added to your journey' : 'Add to my journey'} <ArrowRight size={17}/></button>
          <p className="modal-footnote">Prototype only · This action does not make a reservation.</p>
        </div>
      </div></div>}

      {toast && <div className="toast-message"><CheckCircle2 size={17}/>{toast}</div>}
    </div>
  );
}

export default App;
