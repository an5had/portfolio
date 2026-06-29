const A = '/framer'; // downloaded Framer assets (app/public/framer)

export const PORTRAIT = `${A}/4Va4fg9MhlpIsjQOTIoMSAX68wM.png`;

export const CASES = [
  {
    id: 'wheelsup',
    no: '01',
    client: 'Wheels Up',
    sector: 'Aviation Analytics · USA',
    title: 'An aviation BI design system, unifying 60+ dashboards',
    year: '2024 - Present',
    role: 'UX Designer',
    accent: '#16243f',
    img: '/cases/wheelsup-cover.jpg',
    locked: true,
    summary:
      'I partnered directly with the VP of Business Intelligence to redesign and unify Wheels Up’s internal reporting ecosystem across operations, sales, maintenance, finance and member services, building a dedicated BI design system behind 60+ dashboards.',
    meta: [
      ['Role', 'UX Designer, BI design system, data viz, dashboard UX'],
      ['Scope', 'Audit, IA, internal reporting design system, 60+ dashboards'],
      ['Year', '2024 to present'],
    ],
    stats: [
      { n: 60, suffix: '+', label: 'dashboards standardised' },
      { n: 25, suffix: '%', label: 'faster report generation' },
      { n: 40, suffix: '%', label: 'boost to usability' },
    ],
    tags: ['Aviation', 'Data Visualisation', 'Design Systems', 'Enterprise'],

    intro:
      'Wheels Up is one of the largest private aviation companies in the US, running an extensive fleet and on-demand private flights. I partnered directly with the VP of Business Intelligence and Data Analytics to redesign and unify their internal reporting ecosystem, used across operations, sales, maintenance, finance and member services.',
    context: [
      ['Company', 'Wheels Up, private aviation (USA)'],
      ['My role', 'UX Designer (Exult Global)'],
      ['Partnered with', 'VP, Business Intelligence & Analytics'],
      ['Platform', 'Internal BI dashboards, Figma'],
      ['Timeline', '2024 to present'],
    ],
    challenge:
      'The BI ecosystem held 60+ dashboards spread across departments. They were already grouped (exec leadership, operations, sales, finance, maintenance, marketing), but they lacked visual consistency, leaned on dense table-based reports that buried the insight, used different navigation patterns, duplicated KPIs and never followed a unified design language. Proprietary data and client names are obscured per NDA.',
    approach: [
      { title: 'Audit and mapping', body: 'Reviewed dashboards across every category to surface repeated UI patterns, duplicated KPIs, layout inconsistencies, usability gaps and high-cognitive-load areas.' },
      { title: 'Build on the public-facing system', body: 'Adopted Wheels Up’s existing customer-facing design system as the foundation (grid, colour, typography, navigation, component behaviour) and aligned tone and accessibility with the customer-facing design leads.' },
      { title: 'An internal reporting design system', body: 'Independently designed a comprehensive BI system tailored to analytics: KPI modules, a full set of charts and data structures, and consistent dashboard layouts.' },
      { title: 'Reduce reporting friction', body: 'Simplified the information hierarchy so operational and executive teams read insights faster, and consolidated redundant reports along the way.' },
    ],
    outcomes: [
      { n: 60, suffix: '+', label: 'dashboards standardised under one visual language' },
      { n: 25, suffix: '%', label: 'faster reporting dashboard generation' },
      { n: 40, suffix: '%', label: 'boost to usability' },
      { text: 'A scalable internal design system, higher adoption and positive executive feedback.' },
    ],
    gallery: [
      { src: '/cases/wheelsup-screens.jpg', caption: 'The BI design system v1.0 and consolidated reports (details obscured per NDA).' },
      { src: '/cases/wheelsup-outcomes.jpg', caption: 'Outcomes and impact.' },
    ],
    learning:
      'Once every chart behaved the same way, people stopped decoding the interface and started reading the data. That was the whole point.',
  },
  {
    id: 'jobinarabia',
    no: '02',
    client: 'Jobin Arabia',
    sector: 'HR Tech · GCC',
    title: 'An applicant tracking system for hiring across the GCC',
    year: '2023 - 2024',
    role: 'UI/UX Designer',
    accent: '#16314a',
    img: `${A}/oqFr0RGQ9irjji1e4O2okFUkMY.png`,
    summary:
      'I designed both the admin and employer-facing sides of Jobin Arabia, an applicant tracking system for the GCC. The focus was on simplifying heavy workflows like job posting, candidate tracking and status updates.',
    meta: [
      ['Role', 'UI/UX Designer, admin + employer-facing'],
      ['Scope', 'Flows, IA, B2B web application'],
      ['Year', '2023 to 2024'],
    ],
    stats: [],
    tags: ['Enterprise', 'ATS / HR Tech', 'Web App', 'Workflow'],

    intro:
      'Jobin Arabia is an applicant tracking system that helps employers across the GCC hire faster. HR teams there juggle roles, locations and departments at once, so the design had to make a lot of moving parts feel manageable, even on the go.',
    context: [
      ['Company', 'Jobin Arabia (JIC IT Solutions)'],
      ['My role', 'UI/UX Designer, admin + employer-facing'],
      ['Platform', 'B2B web application'],
      ['Region', 'GCC'],
      ['Timeline', '2023 to 2024'],
    ],
    challenge:
      'Hiring at scale means heavy, repetitive work: posting jobs, tracking candidates through stages, and updating statuses across many roles, locations and departments. Busy HR teams needed one place to manage all of it without getting lost in the detail.',
    approach: [
      { title: 'Map the hiring workflow', body: 'I traced the full path for both admins and employers, from posting a job to tracking candidates to updating their status.' },
      { title: 'A centralised dashboard', body: 'One view to manage applicants across roles, locations and departments, so HR teams see the whole picture at a glance.' },
      { title: 'Multi-stage candidate tracking', body: 'A clear pipeline that keeps a candidate’s stage, details, schedule and evaluation together in one place.' },
      { title: 'Prototype and hand off', body: 'I prototyped the key flows, tested them with stakeholders, and handed documented components to the build team.' },
    ],
    outcomes: [
      { text: 'A central dashboard for applicants across roles, locations and departments.' },
      { text: 'Simpler job posting, candidate tracking and status updates.' },
      { text: 'Hiring that busy HR teams can manage on the go.' },
    ],
    gallery: [
      { src: `${A}/oqFr0RGQ9irjji1e4O2okFUkMY.png`, caption: 'Candidate detail inside the multi-stage requisition pipeline.' },
      { src: `${A}/WHpNaZiv2qVz214TPi3qKoOTrk.png`, caption: 'The requisitions board, where every open role lives.' },
      { src: `${A}/wz6LXyFTmUXE7vsJb5u5GMXT0Aw.png`, caption: 'Managing applicants across the talent pool.' },
      { src: `${A}/32uURZrnczbLvZu7wrJsU0mk8.gif`, caption: 'A short walkthrough of the hiring flow.' },
    ],
    learning:
      'The win here was not a prettier screen. It was taking away the moments where a recruiter had to hold everything in their head.',
  },
  {
    id: 'sea-arabia',
    no: '03',
    client: 'Sea Arabia',
    sector: 'Travel · GCC',
    title: 'A travel and experience booking platform for the GCC',
    year: '2023 - 2024',
    role: 'UI/UX Designer',
    accent: '#10403c',
    img: `${A}/mN0ybzQ9PSlVWZi4Kislo1oc8L8.jpg`,
    summary:
      'An end-to-end travel and experience booking platform for the GCC, from yacht rentals to desert safaris. I worked on the consumer side and the admin and vendor CMS, with localized UX and a scalable component system.',
    meta: [
      ['Role', 'UI/UX Designer, consumer + admin/vendor'],
      ['Scope', 'Consumer platform + vendor CMS'],
      ['Year', '2023 to 2024'],
    ],
    stats: [],
    tags: ['Consumer', 'Travel', 'Booking', 'CMS'],

    intro:
      'Sea Arabia lets people in the GCC discover, book and manage curated travel, from yacht rentals to desert safaris. It has two sides: travellers who want booking to feel easy, and admins and vendors who need full control over listings, pricing and inventory.',
    context: [
      ['Company', 'Sea Arabia (JIC IT Solutions)'],
      ['My role', 'UI/UX Designer, consumer + admin/vendor'],
      ['Platform', 'Consumer app + vendor CMS'],
      ['Region', 'GCC'],
      ['Timeline', '2023 to 2024'],
    ],
    challenge:
      'A booking platform has to make discovery feel light while keeping a lot of machinery behind it: curated packages, vendor listings, pricing, inventory, and content built for the region. The consumer side and the back office pull in different directions.',
    approach: [
      { title: 'Localized, intuitive navigation', body: 'Discovery was shaped around how the GCC audience actually browses and decides on a trip.' },
      { title: 'A confident booking flow', body: 'Discover, book and manage, with packages and activities, from yacht rentals to safaris, made easy to compare.' },
      { title: 'Admin and vendor CMS', body: 'A back office that gives admins and vendors full control over listings, pricing and inventory.' },
      { title: 'Scalable design components', body: 'One component system that holds up across the consumer app and the vendor side.' },
    ],
    outcomes: [
      { text: 'A light, image-forward booking experience built for the region.' },
      { text: 'A CMS giving admins and vendors control over listings, pricing and inventory.' },
      { text: 'A scalable component system shared across both sides of the platform.' },
    ],
    gallery: [
      { src: `${A}/mN0ybzQ9PSlVWZi4Kislo1oc8L8.jpg`, caption: 'Booking detail and the vendor-management back office.' },
    ],
    learning:
      'Designing both sides of a marketplace keeps you honest. Every bit of simplicity on the customer side is paid for by clarity in the back office.',
  },
  {
    id: 'bansal-tmt',
    no: '04',
    client: 'Bansal TMT',
    sector: 'Loyalty · India',
    title: 'A loyalty platform that turns purchases into points',
    year: '2023 - 2024',
    role: 'UI/UX Designer',
    accent: '#2a1f12',
    img: `${A}/fRRI3uXnNwxjhxeI1AX2KQk0pk0.png`,
    summary:
      'A loyalty management platform for Bansal Group that rewards contractors, architects and engineers for buying through verified distributors. A mobile-first, role-based app made ordering and tracking rewards simple, with an admin CMS behind it.',
    meta: [
      ['Role', 'UI/UX Designer, mobile + CMS'],
      ['Scope', 'iOS/Android app + admin web'],
      ['Year', '2023 to 2024'],
    ],
    stats: [],
    tags: ['Mobile', 'Loyalty', 'B2B', 'CMS'],

    intro:
      'Bansal Group wanted to drive sales and build stronger ties with the contractors, architects and engineers who buy their TMT steel. The idea was simple: let them earn and redeem points for purchases made through verified distributors, and make the whole thing easy on mobile.',
    context: [
      ['Company', 'Bansal Group (JIC IT Solutions)'],
      ['My role', 'UI/UX Designer, mobile + CMS'],
      ['Platform', 'iOS / Android + admin web'],
      ['Region', 'India'],
      ['Timeline', '2023 to 2024'],
    ],
    challenge:
      'A B2B loyalty programme has a lot going on: roles, verified purchases, points earned and redeemed, and order tracking. For it to actually get used, the app had to make earning and spending points feel as simple as checking a balance.',
    approach: [
      { title: 'A role-based, mobile-first experience', body: 'Built around how contractors, architects and engineers actually order and track their rewards.' },
      { title: 'Earn and redeem, made simple', body: 'Points come from verified-distributor purchases, and redeeming them sits a few taps away.' },
      { title: 'Rewards and order tracking', body: 'A clear balance and transaction history so users always know exactly where they stand.' },
      { title: 'An admin CMS', body: 'A web back office to manage offers, users, points and approvals.' },
    ],
    outcomes: [
      { text: 'Higher engagement from contractors, architects and engineers.' },
      { text: 'Simpler ordering and rewards tracking on mobile.' },
      { text: 'A loyalty loop that drove repeat business and a noticeable uptick in sales.' },
    ],
    gallery: [
      { src: `${A}/fRRI3uXnNwxjhxeI1AX2KQk0pk0.png`, caption: 'The Bansal TMT loyalty app on the home screen.' },
      { src: `${A}/Ip3233Ji0ermgIRU3cZ4nqchNZg.png`, caption: 'Points balance and transaction history.' },
      { src: `${A}/6iGkb5APxX0oeLW4WdxTh6XOCbo.gif`, caption: 'The loyalty flow in motion.' },
      { src: `${A}/WFIv6O2CuIWegGxQNgMQSQQ4Ok.png`, caption: 'Offers and redemption.' },
      { src: `${A}/XKHIjDXM0fbzraOWftPVBmVSZMw.png`, caption: 'Account and rewards detail.' },
    ],
    learning:
      'Most of it came down to one question: how many points do I have, and what can I do with them. Answer that instantly and people keep coming back.',
  },
  {
    id: 'hospital-discounts',
    no: '05',
    client: 'Bansal Hospital',
    sector: 'Healthcare · India',
    title: 'A discount management app for hospital staff',
    year: '2023 - 2024',
    role: 'UI/UX Designer',
    accent: '#13283a',
    img: `${A}/bh3YwCEyq1qFj5Gd9n1NRscA.png`,
    summary:
      'After the Bansal TMT app, Bansal Group came back for a Hospital Discount Management Application. Staff use a mobile app to create and approve medical discounts for eligible patients, with an admin CMS managing the app and user records.',
    meta: [
      ['Role', 'UI/UX Designer, mobile + CMS'],
      ['Scope', 'Staff mobile app + admin web'],
      ['Year', '2023 to 2024'],
    ],
    stats: [],
    tags: ['Mobile', 'Healthcare', 'Internal Tool', 'CMS'],

    intro:
      'Following the Bansal TMT loyalty app, Bansal Group came back to build a discount management app for their hospital. The goal was to help staff access and manage medical discounts for eligible patients, replacing a slow, manual process.',
    context: [
      ['Company', 'Bansal Hospital (JIC IT Solutions)'],
      ['My role', 'UI/UX Designer, mobile + CMS'],
      ['Platform', 'Staff mobile app + admin web'],
      ['Region', 'India'],
      ['Timeline', '2023 to 2024'],
    ],
    challenge:
      'Issuing medical discounts was a manual, paper-led process. Staff needed a fast way to create discounts for eligible patients and approve them, while administrators needed transparency and control over who did what.',
    approach: [
      { title: 'Map the discount workflow', body: 'Who creates a discount, who approves it, and the rules for which patients and staff are eligible.' },
      { title: 'A simple staff app', body: 'Create a discount, send it for approval, and track its status in a few clear taps.' },
      { title: 'Roles and approvals', body: 'Employee and non-employee requests handled with the right checks at each step.' },
      { title: 'An admin CMS', body: 'A web back office to manage the app, user records and approvals with full visibility.' },
    ],
    outcomes: [
      { text: 'A manual, paper-led process turned into a quick, trackable flow.' },
      { text: 'Faster access to medical benefits for eligible patients.' },
      { text: 'Transparency and control for administrators.' },
    ],
    gallery: [
      { src: `${A}/bh3YwCEyq1qFj5Gd9n1NRscA.png`, caption: 'Creating and approving a discount request.' },
    ],
    learning:
      'Internal tools live on trust. The moment staff can see exactly where a request sits, a manual process stops being a bottleneck.',
  },
  {
    id: 'solar-envoy',
    no: '06',
    client: 'SolarEnvoy',
    sector: 'Productivity · WeCreate',
    title: 'A productivity app that reached #6 on the App Store',
    year: '2021 - 2023',
    role: 'UI/UX Designer',
    accent: '#3a1f52',
    img: `${A}/Pg4bsgX9HcMzu93WWemgYEvSg.jpg`,
    summary:
      'I redesigned and enhanced SolarEnvoy across web and mobile, with user research, lighter task flows and a clean, intuitive interface. It was recognised for clarity and reached #6 in Productivity on the App Store.',
    meta: [
      ['Role', 'UI/UX Designer, research to UI'],
      ['Scope', 'Web + mobile redesign'],
      ['Year', '2021 to 2023'],
    ],
    stats: [{ n: 6, prefix: '#', suffix: '', label: 'Productivity, App Store' }],
    tags: ['Mobile', 'Productivity', 'Fintech'],

    intro:
      'At WeCreate (Mintyfusion) I redesigned SolarEnvoy across web and mobile. The goal was simple to say and hard to do: make a capable product feel effortless, clean enough that people choose it and stay.',
    context: [
      ['Company', 'SolarEnvoy (WeCreate / Mintyfusion)'],
      ['My role', 'UI/UX Designer'],
      ['Platform', 'Web + mobile'],
      ['Recognition', '#6, Productivity, App Store'],
      ['Timeline', '2021 to 2023'],
    ],
    challenge:
      'The product did a lot, but its interface asked too much of people. Task flows were heavier than they needed to be, and the visual language did not carry the clarity the brand wanted to stand for.',
    approach: [
      { title: 'Research the friction', body: 'User research surfaced where people stalled and where the flow worked against them.' },
      { title: 'Streamline the task flows', body: 'I reworked the core journeys to cut steps and surface the next action clearly.' },
      { title: 'A clean, intuitive UI', body: 'A calmer visual system lined up business goals with what users actually needed to do.' },
    ],
    outcomes: [
      { n: 6, prefix: '#', suffix: '', label: 'in Productivity on the App Store' },
      { text: 'Recognised for clean, intuitive design and user satisfaction.' },
    ],
    gallery: [
      { src: `${A}/Pg4bsgX9HcMzu93WWemgYEvSg.jpg`, caption: 'SolarEnvoy product identity.' },
    ],
    learning:
      'We focused on cutting friction, not on chasing a ranking. The ranking showed up afterwards.',
  },
];

export const FEATURED = ['wheelsup', 'jobinarabia', 'sea-arabia'];
export const caseById = (id) => CASES.find((c) => c.id === id);

export const EXPLORATIONS = [
  {
    id: 'walkman',
    title: 'Sony Walkman TPS-L2',
    kicker: 'Figma illustration',
    body: 'A pixel-faithful recreation of the original 1979 Walkman, built entirely in Figma to push vector craft and shadow work.',
    img: `${A}/rr0wKWvyXpWh6CZH0Pvnn03Qh5k.png`,
  },
  {
    id: 'koii',
    title: 'Teenage Engineering K.O. II',
    kicker: 'Figma illustration',
    body: 'The EP-133 sampler, rebuilt in Figma down to every knob, pad and screen. A study in product detail and grid discipline.',
    img: `${A}/vxQf2iwydv932xkFZeTaiaa8.png`,
  },
];

export const EXPERIENCE = [
  { role: 'Senior UI/UX Designer', org: 'Exult Global', period: 'Feb 2024 - Present', note: 'Enterprise and analytics products for high-profile clients including Wheels Up, Dexcom, HIG Capital, Zayo and CyberProof. Component-based dashboards and decision tools.' },
  { role: 'UI/UX Designer', org: 'JIC IT Solutions', period: 'Jul 2023 - Feb 2024', note: 'Shipped Sea Arabia, Jobin Arabia (ATS), and the Bansal TMT loyalty and Hospital discount apps with CMS.' },
  { role: 'UI/UX Designer', org: 'WeCreate (Mintyfusion)', period: 'Jul 2021 - Apr 2023', note: 'Web and mobile across fintech and services. Designed SolarEnvoy, which reached #6 in Productivity on the App Store.' },
  { role: 'Creative Design Consultant', org: 'Freelance', period: 'Aug 2020 - Jul 2021', note: 'End to end UX and visual design for startups and SMEs, including Shutterup and Skillbus.' },
];

export const CAPABILITIES = [
  { no: '01', title: 'Enterprise & Data', body: 'Component-based dashboards, KPI tools and scalable design systems that make data-heavy platforms actually usable.' },
  { no: '02', title: 'Product & Research', body: 'User research, journey mapping and systems thinking that line design decisions up with real business goals.' },
  { no: '03', title: 'AI & Emerging Tech', body: 'Exploring AI-powered experiences and how technology and human behaviour keep reshaping each other.' },
];

// High-profile clients delivered at Exult Global
export const CLIENTS = [
  { name: 'Wheels Up', url: 'https://wheelsup.com', logo: '/logos/wheelsup.svg' },
  { name: 'Dexcom', url: 'https://www.dexcom.com/', logo: '/logos/dexcom.svg' },
  { name: 'HIG Capital', url: 'https://hig.com/', logo: '/logos/hig.svg' },
  { name: 'Zayo', url: 'https://www.zayo.com/', logo: '/logos/zayo.png' },
  { name: 'CyberProof', url: 'https://www.cyberproof.com/', logo: '/logos/cyberproof.png' },
];

export const TOOLS = ['Figma', 'Framer', 'Protopie', 'Adobe XD', 'FigJam', 'Design Systems', 'Prototyping', 'Usability Testing', 'Data Viz', 'HTML/CSS'];

export const FACTS = [
  ['Now', 'Senior UX Designer, Exult Global'],
  ['Experience', '5+ years'],
  ['Based', 'India, working globally'],
  ['Education', 'B.Tech, Computer Science'],
];

export const SOCIALS = [
  ['LinkedIn', 'https://in.linkedin.com/in/an5had'],
  ['Instagram', 'https://www.instagram.com/an5had/'],
  ['X / Twitter', 'https://x.com/an5had'],
];
