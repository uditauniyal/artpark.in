// Programmes and facilities. Text is condensed from the artpark.in programme pages
// (captured in research/artpark-in/*.json, 2026-10-24); numbers and names are as published there.
// Each item lists its sources.

const programs = [
  {
    slug: 'advanced-robotics', projects: ['camras'], status: 'ONGOING', dot: '', name: 'Advanced Robotic Systems',
    short: 'Next-generation robotics for India through four focused initiatives: humanoids, resilient multi-robot systems, a secure navigation stack and physical AI.',
    lede: 'Driving next-gen robotics in India through four focused innovation initiatives. Each targets a critical gap in robotics capability, with the aim of indigenous, intelligent and resilient systems.',
    image: '/assets/site/quadruped-team.webp', imageAlt: 'Engineers with a quadruped robot at ARTgarage', caption: 'A quadruped robot at ARTgarage.',
    rows: [
      ['Humanoids', 'Agile, dexterous humanoid robots for factory automation and healthcare assistance, integrating perception, manipulation, locomotion and foundation AI models for human-safe interaction. Built with industry partners to move quickly from prototype to deployment.'],
      ['Resilient multi-robot systems', 'Collaborative networks of aerial, ground and underwater robots for defence and civilian use, with distributed AI, multimodal sensing and autonomous coordination for surveillance and disaster management.'],
      ['Secure navigation stack (S-Nav)', 'Modular, encrypted navigation for autonomous systems that integrates GNSS, LiDAR and IMU sensors and is designed to meet ISO standards. ARTPARK startups such as Yaanendriya contribute to this ecosystem.'],
      ['Physical AI', 'Robot data farms, simulation centres, robot foundation models and human-guided training, so robots can learn faster and transfer skills across tasks.'],
    ],
    stats: [['₹78.4 Cr', 'CAMRAS investment by the Ministry of Heavy Industries'], ['8', 'CAMRAS projects at launch'], ['6', 'pre-venture teams that became startups'], ['2,800', 'professionals targeted by the CAMRAS skilling programme']],
    cards: [
      { title: 'CAMRAS', text: 'The Center for Advanced Manufacturing of Robotics and Autonomous Systems is an industry accelerator set up at ARTPARK @ IISc by the Ministry of Heavy Industries, to reduce India’s import footprint in robotic and autonomous systems. Its six pre-venture teams became Twara Robotics, Comrado Aerospace, Strider Robotics, AlgoFET, VayDyn and Yaanendriya.', image: '/assets/site/test-rigs.webp', imageAlt: 'Engineers at hardware test rigs in the robotics lab' },
      { title: 'Built at ARTgarage', text: 'Robots are built and tested at ARTgarage: indoor and outdoor arenas, fabrication, and a test track for autonomous vehicles.', image: '/assets/site/quadruped-assembly.webp', imageAlt: 'Two engineers assembling a quadruped robot', href: '/about/facilities/artgarage' },
    ],
    sources: ['https://www.artpark.in/advanced-robotics', 'https://www.artpark.in/advanced-robotics/camras'],
  },
  {
    slug: 'industry-5', projects: ['camras'], status: 'ONGOING', name: 'Integrated Industry 5.0 Platform',
    short: 'AI and automation for India’s 1.6 million MSMEs: digital twins, agentic workflows, robotics and human-machine collaboration.',
    lede: 'Purpose-driven, people-centric technology for Indian industries. AI and automation for India’s 1.6 million MSMEs, designed for how Indian manufacturing actually works.',
    image: '/assets/site/robot-training.webp', imageAlt: 'Participants at an industrial robot training course', caption: 'Industrial robot training at ARTPARK.',
    rows: [
      ['AI for the economy', 'Indian MSMEs produce 45% of industrial output and 40% of exports, yet fragmented data, reactive decision-making and manual oversight cost the sector time, yield and competitiveness. The platform embeds AI directly into industrial workflows.'],
      ['The connectivity layer', '5G private networks for mobile robots and drones, deterministic Ethernet TSN for safety-critical synchronisation, and Wi-Fi 7 for dense sensor networks.'],
      ['The physical workforce', 'From caged industrial robots to cobots working safely beside people, drones for inspection, and mobile manipulators.'],
      ['Envisaged impact', 'Automation of compliance and shop-floor operations, end-to-end traceability of assets, a lower carbon footprint with better sustainability reporting, and real-time decision making.'],
    ],
    cards: [
      { title: 'CAMRAS Accelerator Program', text: 'A ₹78.4 Cr MHI-funded accelerator that has taken six teams from prototype-stage research to funded, market-facing startups.', image: '/assets/site/fabrication.webp', imageAlt: 'Engineers working on a fabricated panel in the workshop', href: '/about/programs/advanced-robotics' },
    ],
    partnersNote: 'Partners in discussion: Bosch, Aequs, 7th Gen Ventures and KLE Tech.',
    sources: ['https://www.artpark.in/industry5', 'https://www.artpark.in/industry-50'],
  },
  {
    slug: 'health', projects: ['hrp-copilot', 'prism-h', 'heat-risk', 'dharini', 'kilkari', 'midas', 'oral-cancer-screening', 'tb-screening', 'livestock', 'mental-health-trainer', 'dengue-dashboard', 'climate-health', 'reimagine-health'], status: 'ONGOING', name: 'Health Data & AI',
    short: 'Data and AI-driven public health responses to endemic, epidemic and climate-related threats, deployed with city, state and national governments.',
    lede: 'Data and AI-driven public health responses to endemic, epidemic and climate-related threats. Leading computational epidemiology groups work with city, state and national governments, in an open-innovation ecosystem.',
    image: '/assets/site/hrp-training.webp', imageAlt: 'A health worker using the high-risk pregnancy copilot on a phone', imagePos: '50% 30%', caption: 'Training frontline workers on the high-risk pregnancy copilot.',
    stats: [['70M+', 'lives touched by PRISM-H in Karnataka'], ['1.2M+', 'houses surveyed for dengue larvae'], ['3,000+', 'ANMs using the high-risk pregnancy copilot'], ['40k+', 'patients screened for oral cancer']],
    rows: [
      ['PRISM-H · dengue', 'A live system in Karnataka that combines epidemiological trends, weather and environmental data to forecast dengue outbreaks at sub-district level, up to four weeks ahead. Recognised in the UN World Cities Report 2024; SKOCH Award for E-Governance, 2025.'],
      ['Heat-risk forecasting', 'Sub-district heat-risk predictions up to seven days ahead, built with the Government of Karnataka (KSNDMC, KSDMA and the Department of Health). Winner of Grand Challenges India and a winner-finalist of the IndiaAI Innovation Challenge 2025.'],
      ['Dharini · One Health', 'An open-source surveillance platform that brings together clinical, environmental and genomic surveillance of pathogens, focused on avian influenza, lumpy skin disease and foot-and-mouth disease.'],
      ['Livestock vaccination strategy', 'Supporting the Empowered Committee for Animal Health with evidence for disease-control strategy, starting with foot-and-mouth disease, which ICAR estimates costs ₹20,000 crore a year.'],
      ['High-risk pregnancy copilot', 'A WhatsApp assistant in Hindi, Telugu and Marathi that gives ANMs expert-verified guidance on 35 high-risk conditions. Deployed with 3,000+ ANMs in Uttar Pradesh, Telangana and Maharashtra. Gates Foundation Global Grand Challenges winner (2023); Google.org accelerator (2025).'],
      ['Kilkari AI chatbot', 'Trusted answers about pregnancy and infant care on WhatsApp, piloted with 1,505 mothers in Mumbai’s mMitra programme and designed for Kilkari, which reaches 3M+ women. Winner of Grand Challenges India by BIRAC.'],
      ['AI trainer for community mental health', 'A multi-agent trainer, built with CMHLP, to help train ASHAs in community mental health at scale. In prototyping.'],
      ['MIDAS · screening', 'India-specific medical imaging datasets, with ICMR and IISc. They power the Aarogya Aarohan oral cancer screening app (40k+ patients screened, 8 trial sites) and AI chest X-ray triage for TB, compatible with NIKSHAY.'],
      ['Calibrate', 'An open-source platform for evaluating AI agents. Raising The Village and The Agency Fund used it to test a field-agent tool for farming families in rural Uganda, catching nearly 150 errors before launch.'],
    ],
    cards: [
      { title: 'PRISM-H', text: 'Data flows from field surveys, weather and labs into forecasts that tell health teams where to act first.', image: '/assets/site/prism-h.webp', imageAlt: 'PRISM-H data flow diagram', fit: 'contain' },
      { title: 'Dharini', text: 'GeoLens shows where wild birds, farms and herds meet, and where risk is rising.', image: '/assets/site/dharini.webp', imageAlt: 'Dharini platform overview graphic', fit: 'contain' },
      { title: 'Oral cancer screening', text: 'A frontline worker photographs a lesion; the AI classifies risk in real time and routes high-risk cases to a specialist.', image: '/assets/site/oral-screening.webp', imageAlt: 'Phone-based oral cancer screening' },
    ],
    links: [['Read the story: Nature signals. We built the infrastructure to listen.', '/stories/nature-signals'], ['High-risk pregnancy copilot', 'https://www.artpark.in/language-data-ai/hrp-copilot'], ['Calibrate in rural Uganda', 'https://www.linkedin.com/feed/update/urn:li:activity:7516742471373160449/']],
    sources: ['https://www.artpark.in/health-initiatives', 'https://www.artpark.in/prism-h', 'https://www.artpark.in/heat-stress-forecasting', 'https://www.artpark.in/health-initiatives/environmental-survelliance', 'https://www.artpark.in/health-initiatives/livestock-modelling', 'https://www.artpark.in/language-data-ai/hrp-copilot', 'https://www.artpark.in/language-data-ai/kilkari-assistant-for-mothers-5dc4k', 'https://www.artpark.in/language-data-ai/mental-health-trainer', 'https://www.artpark.in/oral-cancer-screening', 'https://www.artpark.in/tb-screening', 'ARTPARK LinkedIn: Calibrate in Uganda'],
  },
  {
    slug: 'language', projects: ['vaani', 'respin', 'syspin', 'belongg-ai'], status: 'ONGOING', name: 'Language Data & AI',
    short: 'Vaani, RESPIN and SYSPIN: open speech and language data so AI can understand India’s languages, dialects and accents.',
    lede: 'India has 22 scheduled languages, hundreds of dialects and over a billion speakers. Most AI understands none of them well. ARTPARK, with IISc, is building the data foundation to change that.',
    image: '/assets/site/vaani-terminal.webp', imageAlt: 'Working in a terminal on Vaani data', caption: 'Working on Vaani data at ARTPARK.',
    stats: [['31.2k', 'hours of speech data'], ['109', 'languages covered'], ['165', 'districts'], ['156k+', 'speakers recorded']],
    rows: [
      ['Vaani', 'India’s largest open-source speech dataset, by IISc and ARTPARK and funded by Google: real voices from 165 districts, open via Bhashini and Hugging Face. The goal is 150,000+ hours from every district in India.'],
      ['RESPIN', 'Speech recognition datasets in 9 Indian languages, focused on agriculture and finance for the poor. A digital public good, open to all.'],
      ['SYSPIN', 'Open text-to-speech corpora and synthesis models in 9 Indian languages, for voice interfaces in health, education and governance.'],
      ['SraVaani 1.0', 'An open speech-recognition model for 65 Indian languages and dialects, built on Vaani data.'],
    ],
    quotes: [
      ['The Vaani dataset has been instrumental in bridging the data gap for Northeast Indian languages. Covering around 30 tribal languages, it enabled MWire Labs to build the first publicly available ASR system for Garo.', 'Badal Nyalang, Director, MWire Labs'],
      ['At SandLogic, we believe India’s AI future must be sovereign, inclusive, and representative of our people.', 'Dr. Kruthika K R, Founding Researcher, SandLogic Technologies'],
    ],
    links: [['Vaani on Hugging Face', 'https://huggingface.co/datasets/ARTPARK-IISc/Vaani'], ['Project Vaani', 'https://vaani.iisc.ac.in/'], ['SraVaani 1.0', 'https://huggingface.co/ARTPARK-IISc/SraVaani-1.0']],
    sources: ['https://www.artpark.in/language', 'https://www.artpark.in/language/vaani', 'https://www.artpark.in/language/respin', 'https://www.artpark.in/language/syspin', 'https://vaani.iisc.ac.in/'],
  },
  {
    slug: 'wired-wireless', projects: ['5g-test-lab'], videos: [['Tutorial on 5G Essentials: complete playlist', 'https://www.youtube.com/embed/videoseries?list=PLl5RpkrF6Z5a6FbZ74v2T0ms4qU6nqDrJ'], ['India’s first 5G-enabled drone corridor', 'https://www.youtube.com/embed/1GLSXiuG3R8'], ['Inside India’s 5G test lab at ARTPARK', 'https://www.youtube.com/embed/lTUHbFAFwvE'], ['Building India’s 5G future with drones, robots and industrial AI', 'https://www.youtube.com/embed/2hX8PXd3Tvc']], status: 'ONGOING', name: 'Wired & Wireless Technologies (CoE-WWT)',
    short: 'A Centre of Excellence, seed-funded by the Government of Karnataka, with a live 5G test lab at ARTgarage open to startups, academia and industry.',
    lede: 'The Center of Excellence – Wired & Wireless Technologies is established through seed funding by the Government of Karnataka to foster market-ready solutions in next-gen communications and AI, with the potential for societal-scale impact.',
    image: '/assets/site/5g-lab.webp', imageAlt: 'The 5G lab at ARTgarage', caption: 'The 5G test lab at ARTgarage.',
    stats: [['51', 'teams demonstrated 5G prototypes at ARTPARK'], ['75,000', 'sq ft indoor test area'], ['5 acres', 'outdoor test area'], ['1 of 100', 'Bharat 5G Labs (DoT)']],
    rows: [
      ['5G test lab', 'A Bharat 5G Use Case Lab and a parallel Karnataka 5G Test Lab, with private 5G coverage across ARTgarage indoors and outdoors. Open to startups, academia and industry at nominal cost.'],
      ['5G-enabled drones and UGVs', 'Multi-UAV and UGV operations over 5G, including beyond-visual-line-of-sight flights and a reference architecture for drone corridor management.'],
      ['InterSafe', 'A 5G road-safety system: roadside cameras, radar and sensors with edge AI that send hazard warnings to vehicles and phones in real time.'],
      ['LifeCircuit', 'A 5G emergency-care network that activates nearby first responders, finds the nearest defibrillator and alerts ambulances and hospitals.'],
    ],
    cards: [
      { title: 'Drones over 5G', text: 'India’s first 5G-enabled drone corridor work happens here.', image: '/assets/site/drone-room.webp', imageAlt: 'A drone hovering in the ARTgarage lab' },
      { title: '51 teams, one testbed', text: '51 teams demonstrated their 5G prototypes at ARTPARK, IISc; the top scorers head to India Mobile Congress 2026.', image: '/assets/site/5g-teams.webp', imageAlt: 'ARTPARK graphic of the 5G prototype demonstrations', fit: 'contain' },
    ],
    links: [['Write to the CoE team · wwtcoe@artpark.in', 'mailto:wwtcoe@artpark.in']],
    sources: ['https://www.artpark.in/programs/coe-wwt1', 'https://www.artpark.in/5g-test-lab-wwt-1', 'https://www.artpark.in/'],
  },
  {
    slug: 'academy', status: 'ONGOING', name: 'Academy',
    short: 'Skills in robotics, AI and autonomous systems: Spark sessions for founders, UG-PG fellowships, internships, courses and challenges.',
    lede: 'Fostering timely skills development, cultivating talent at regional and national levels, and helping people bridge the gap between research and commercialisation.',
    image: '/assets/site/skilling-session.webp', imageAlt: 'A skilling session in the ARTgarage commons', caption: 'A session at ARTgarage.',
    stats: [['15', 'UG-PG fellowship projects'], ['29', 'students supported (18 UG, 11 PG)'], ['5', 'products and prototypes designed'], ['~20', 'founders per Spark cohort']],
    rows: [
      ['Spark sessions', 'For aspiring deep-tech entrepreneurs: a cohort of about 20 founders, with expert sessions on MVPs, business models, product-market fit and fundraising.'],
      ['UG-PG fellowships', 'Top-up fellowships for final-year students’ projects in robotics, autonomous systems and AI.'],
      ['Internships', 'Including a summer internship in swarm robotics on the Rigbetel Tortoise Bot.'],
      ['Courses and challenges', 'Introduction to Robotics, IMTMA training, 5G essentials, and challenges such as the I-4AM ’24 Robotics Challenge and the University Rover Challenge 2024.'],
      ['ARCNet', 'The Applied Research Capability Network, a student-led programme under ARTPARK @ IISc.'],
    ],
    cards: [
      { title: 'I-4AM ’24 Robotics Challenge', text: 'Students building and competing with robots.', image: '/assets/site/i4am-challenge.webp', imageAlt: 'Students at the I-4AM 24 Robotics Challenge' },
      { title: 'Industrial robot training', text: 'Hands-on training on industrial robot arms.', image: '/assets/site/robot-training.webp', imageAlt: 'Participants at an industrial robot training course' },
    ],
    sources: ['https://www.artpark.in/skilling'],
  },
  {
    slug: 'artlabs', projects: ['zetesis'], status: 'ONGOING', name: 'ARTLabs',
    short: 'The early stage of the pipeline: Innovators-in-Residence turn bold ideas into technologies and ventures.',
    lede: 'Big ideas, real impact. ARTLabs is where bold ideas become innovations, technologies and ventures, bringing together deep-tech researchers, engineers and entrepreneurs across AI, robotics, health, climate and advanced systems.',
    image: '/assets/site/soldering.webp', imageAlt: 'An engineer soldering electronics at a bench', caption: 'Prototyping at ARTLabs.',
    rows: [
      ['Innovation projects', 'Led by Innovators-in-Residence, with a focus on real-world problems, product-market fit, early validation and commercialisation. Current projects: Taksa, Idle Robotics, Zetesis and Cold Chain Systems.'],
      ['Past projects, now startups', 'Twara Robotics, Comrado Aerospace, AlgoFET, VayDyn and Strider Robotics began as ARTLabs innovation projects.'],
    ],
    sources: ['https://www.artpark.in/artlabs'],
  },
  {
    slug: 'rdi', status: 'NEW', name: 'RDI Fund · Focused Research Organisation',
    short: 'ARTPARK was selected as one of five Focused Research Organisations among the 19 shortlisted members of the inaugural RDI Fund cohort.',
    lede: 'ARTPARK has announced its selection as one of five Focused Research Organisations among the 19 shortlisted members of the inaugural cohort of the national Research, Development and Innovation (RDI) Fund.',
    image: '/assets/linkedin/rdi-milestone.jpg', imageAlt: 'ARTPARK’s announcement of the first RDI cohort', fit: 'contain', caption: 'From ARTPARK’s announcement.',
    rows: [
      ['What it means', 'A step towards connecting research with commercial deployment: R&D and innovation projects moving toward deployment, at national scale.'],
    ],
    links: [['Read ARTPARK’s announcement', 'https://www.linkedin.com/feed/update/urn:li:activity:7516090774808072192/'], ['About the national RDI Fund', 'https://www.anrfonline.in/']],
    sources: ['ARTPARK LinkedIn post (October 2026)'],
  },
];

const facilities = [
  { slug: 'artgarage', name: 'ARTgarage', text: '75,000 sq ft of advanced manufacturing equipment, clean rooms, communications infrastructure, GPU compute and indoor-outdoor test arenas at Jalahalli, 20 minutes from IISc.', image: '/assets/site/artgarage-hall.webp', alt: 'The main hall inside ARTgarage', href: '/about/facilities/artgarage' },
  { slug: 'robotic-test', name: 'Networked Robotic Test Facility', text: 'Indoor and outdoor arenas for ground robots, drones and underwater systems: multi-robot coordination, obstacle courses and sensor calibration.', image: '/assets/site/drone-lab.webp', alt: 'A drone flying inside the robotics lab' },
  { slug: 'fabrication', name: 'Advanced Manufacturing & Fabrication', text: 'CNC machining, FDM, SLA and SLS 3D printing, metal fabrication, PCB assembly and clean rooms, from CAD to working prototype in days.', image: '/assets/site/fabrication.webp', alt: 'Engineers working on a fabricated panel' },
  { slug: '5g-lab', name: 'Bharat 5G Lab & CoE-WWT', text: 'A live 5G testbed with hybrid 5G-Wi-Fi, Li-Fi and millimetre-wave systems, used to validate 5G-enabled autonomous systems and IoT.', image: '/assets/site/5g-lab.webp', alt: 'The 5G lab at ARTgarage', href: '/about/programs/wired-wireless' },
  { slug: 'gpu', name: 'GPU Compute Cluster', text: 'On-site high-performance compute for AI training, simulation and digital twins, for ARTPARK startups, fellows and research teams.', image: '/assets/site/workstations.webp', alt: 'Engineering workstations at ARTgarage' },
  { slug: 'brainz', name: 'BRAINz campus', text: 'A 9-acre Bengaluru Robotics and AI Innovation Zone being built with the Government of Karnataka, for AI, robotics, space, aerospace and defence, manufacturing and medtech.', image: '/assets/site/brainz-render.webp', alt: 'BRAINz campus vision render', href: '/about/facilities/brainz', render: true },
];

const artgarage = {
  facts: [['75k sq ft', 'area'], ['7+', 'specialised labs'], ['20 min', 'from IISc campus'], ['40 min', 'from the airport']],
  labs: [
    ['Networked Robotic Test Facility', 'Indoor and outdoor arenas for testing ground robots, drones and underwater systems in realistic conditions. Multi-robot coordination, obstacle courses and sensor calibration environments.'],
    ['Advanced Manufacturing & Fabrication', 'CNC machining, 3D printing (FDM, SLA, SLS), metal fabrication, PCB assembly and clean rooms. Everything needed to go from CAD to working prototype in days, not months.'],
    ['Autonomous Vehicle Test Facility', 'A dedicated test track for autonomous ground vehicles and drone corridors, including simulated urban environments, rough terrain and sensor-validation zones.'],
    ['Bharat 5G Lab & CoE-WWT', 'A live 5G testbed with hybrid 5G-Wi-Fi network, Li-Fi and millimetre-wave systems, used to validate 5G-enabled autonomous systems and IoT applications.'],
    ['GPU Compute Cluster', 'On-site high-performance compute for AI model training, simulation and digital twin development, for ARTPARK startups, fellows and research teams.'],
    ['Agri Robotics Centre of Excellence', 'A dedicated zone for developing and testing agricultural robots and precision farming systems.'],
  ],
  areas: [['Advanced Manufacturing', 'Robotics, automation and AI-driven production systems for India’s industrial base.'], ['HealthTech', 'Diagnostics AI, surgical robotics and clinical decision infrastructure for population-scale healthcare.'], ['Aerospace & Defence', 'Autonomous systems, surveillance robotics and next-generation propulsion.'], ['SpaceTech', 'Satellite systems, earth observation and in-space propulsion for India’s commercial space economy.']],
  source: 'https://www.artpark.in/artgarage',
};

const brainz = {
  spaces: [
    ['Prototyping and Experimentation Labs', 'Advanced fabrication, electronics assembly and testing infrastructure, so teams can move from simulation to physical prototype rapidly and iteratively.'],
    ['Global Innovation Centers', 'Spaces for international corporations, research institutions and government bodies to co-innovate with India’s deep-tech ecosystem.'],
    ['Innovation Spaces and Pods', 'Flexible, modular work environments for startups, research groups and corporate R&D teams.'],
    ['Open Innovation Zones for Collaboration', 'Public-facing innovation spaces where industry, academia, government and civil society can engage.'],
    ['Academic Research and Skilling', 'Zones for faculty research, postdoctoral work, and skilling and fellowship programmes.'],
  ],
  partners: [['The Vision Partner', 'Naming rights for the entire campus, and a permanent seat on the governing board.'], ['The Pillar Partner', 'Naming rights for a key campus facility, with prominent branding at its entrance.'], ['The Support Partner', 'Recognition as a Founding Partner, with a permanent installation at the campus entrance.']],
  source: 'https://www.artpark.in/brainz',
};

module.exports = { programs, facilities, artgarage, brainz };

// Real destinations that artpark.in links to from each programme (captured in research/artpark-media.json).
module.exports.resources = {
  health: [
    ['Health toolkits and resources', 'https://health.artpark.ai/'],
    ['Health data catalogue', 'https://health.artpark.ai/data/'],
    ['Dharini, the environmental surveillance platform', 'https://in.dharini.artpark.ai/'],
    ['Dengue pipeline code (epipipeline) on GitHub', 'https://github.com/dsih-artpark/epipipeline'],
    ['Disease dashboard code on GitHub', 'https://github.com/dsih-artpark/disease-dashboard-v2'],
    ['PRISM-H app code on GitHub', 'https://github.com/dsih-artpark/prismh-app'],
    ['Let’s Talk @ ARTPARK, episode 1 with Dr. Vishal Rao', 'https://www.youtube.com/watch?v=fZntmGY10Uk'],
  ],
  language: [
    ['Case study: MWire Labs builds Garo speech recognition', 'https://vaani.iisc.ac.in/case-studies/mwirelabs'],
    ['Case study: SandLogic, Hindi call analytics', 'https://vaani.iisc.ac.in/case-studies/sandlogic'],
    ['Case study: Shunya Labs, speech to text for India', 'https://vaani.iisc.ac.in/case-studies/shunyalabs'],
    ['Case study: Spring Lab, voice naturalness', 'https://vaani.iisc.ac.in/case-studies/springlab'],
    ['RESPIN', 'https://respin.iisc.ac.in/'],
    ['SYSPIN', 'https://syspin.iisc.ac.in/'],
    ['Vaani in the press', 'https://vaani.iisc.ac.in/articles'],
    ['White paper: Legal framework for open-sourcing language data in India', '/publications/legal-framework-language-data'],
  ],
  'wired-wireless': [
    ['CoE-WWT brochure', 'https://drive.google.com/file/d/1zjHNqWUMsd3gJnGnK6VGC5HLJprjserG/view'],
    ['5G lab user agreement', 'https://docs.google.com/document/d/1l-G91SskoQJAUD3uuXaibS4ZbEqnAKTP/edit?usp=sharing'],
    ['Bharat 5G Labs (Department of Telecommunications)', 'https://www.bharat5glabs.gov.in/institutes'],
  ],
  academy: [
    ['Selected projects and fellowship awardees 2023–24', '/docs/Selected-Projects-and-Fellowship-Awardees-2023-2024.pdf'],
    ['Projects selected for poster presentation and exhibition', '/docs/ARTPARK-IISc-supported-projects-selected-for-Poster-presentation-and-Exhibition-projects.pdf'],
    ['University Rover Challenge 2024', '/docs/University-Rover-Challenge-2024.pdf'],
    ['IndiaSkills State Level Competition 2024', '/docs/IndiaSkills-State-Level-Competition-2024.pdf'],
    ['Pravega ’24 Robotics Challenge', '/docs/Pravega24-_-Robotics-Challenge.pdf'],
    ['I-4AM ’24 Robotics Challenge', '/docs/I-4AM-24-Robotics-Challenge.pdf'],
    ['IEEE RAS PESU 2023', '/docs/IEEE-RAS-PESU-2023.pdf'],
    ['International Educators’ Bootcamp 2023 (with STEMpedia)', 'https://thestempedia.com/international-bootcamp-on-ai-python-and-robotics-for-school-educators/'],
    ['Codeavour 5.0 International', 'https://codeavour.org/'],
    ['AI-MPOWER, with ZenteiQ', 'https://www.zenteiq.com/course/ai-mpower'],
  ],
  artlabs: [
    ['Taksa: the open-source factory OS, on GitHub', 'https://github.com/artpark-hub/taksa'],
  ],
};
