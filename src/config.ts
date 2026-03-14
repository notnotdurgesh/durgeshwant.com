export const CONFIG = {
  personal: {
    name: "Reddy Durgeshwant",
    role: "Full Stack Developer",
    tagline: "Building real-world, high-performance web applications.",
    about: "I am a Full Stack Developer focused on architecting robust and efficient systems. I specialize in modern web technologies to solve complex problems and deliver seamless, high-performance user experiences.",
    email: "durgeshwantreddy@gmail.com",
    phone: "+91-7702734399",
    links: {
      linkedin: "https://www.linkedin.com/in/itsdurgesh/",
      github: "https://github.com/notnotdurgesh",
    }
  },
  experience: [
    {
      role: "Open-Source Contributor",
      company: "Self-Employed",
      date: "Feb 2026 - Present",
      description: "Contributing to various open-source projects like Google's Agent Development Kit Project and building my own projects.",
      logo: "src/data/assets/experience/Google.png",
    },
    {
      role: "Full Stack Developer",
      company: "Comfac Tech Options",
      date: "Feb 2025 - Feb 2026",
      description: "Architected and scaled a mission-critical internal workforce management tool, boosting operational efficiency across multiple departments by a measurable 40%. Engineered dynamic, high-performance list and edit views using React, TypeScript, and GraphQL.",
      logo: "src/data/assets/experience/cto.png",
    },
    {
      role: "Full Stack Developer",
      company: "Dynish Solutions",
      date: "Oct 2024 - Feb 2025",
      description: "Led a team of two engineers to architect and deploy a scalable navigation and routing system with Next.js, improving modularity and decreasing page load times by 35%. Implemented a robust, enterprise-grade Role-Based Access Control (RBAC) system.",
      logo: "src/data/assets/experience/Dynish.png",
    },
    {
      role: "SWE Intern",
      company: "Umenit Solutions",
      date: "June 2024 - August 2024",
      description: "Built a high-throughput analytics backend to process and analyze user data, resulting in a 20% increase in user engagement and retention metrics. Developed an automated mailing system for sales and lead generation.",
      logo: "src/data/assets/experience/umenit.png",
    }
  ],
  projects: [
    {
      title: 'God Chat',
      category: 'User First Workspace',
      description: 'A premium, agentic workspace for creators that transforms AI conversations into an interactive knowledge graph, predictive suggestions, and visual branching to empower sophisticated, non-linear brainstorming.',
      image: 'src/data/assets/godchat/image.png',
      color: 'rgba(212, 0, 255, 1)ff', // Sage green
      github: 'https://github.com/notnotdurgesh/GodChat',
    },
    {
      title: 'AutoXL',
      category: 'AI-Powered Spreadsheet',
      description: 'An AI-driven, Excel-like web spreadsheet featuring virtual scrolling, undo/redo, and a multimodal Gemini agent with over 30 tool actions for complex data transformations.',
      image: 'src/data/assets/autoxl/product.png',
      color: '#d63636ff', // Warm honey
      github: 'https://github.com/notnotdurgesh/autoXL',
      live: 'https://autoxl.online'
    },
    {
      title: 'FindFounder',
      category: 'Matchmaking Platform',
      description: 'A full-stack founder-developer matchmaking platform facilitating intelligent co-founder discovery with role-based routing, real-time notifications, and GitHub OAuth.',
      image: 'src/data/assets/findFounder/home.png',
      color: '#f38c0eff', // Muted wood
      github: 'https://github.com/notnotdurgesh/findFounder_fe',
    },
    {
      title: 'Google-Build-and-Blog-20k25 ',
      category: 'Winning hackathon project',
      description: 'Ai enabled music studio to synthese music',
      image: 'src/data/assets/probeat/image.png',
      color: '#15ff00ff', // Muted wood
      github: 'https://github.com/notnotdurgesh/Google-Build-and-Blog-20k25',
    },


  ],
  skills: [
    { name: 'React / Next.js', orbit: 1, angle: 0 },
    { name: 'Git / Bitbucket', orbit: 1, angle: 120 },
    { name: 'Express.js / TS - Node.js', orbit: 1, angle: 240 },
    { name: 'REST / GraphQL', orbit: 2, angle: 45 },
    { name: 'Tailwind / MUI / AntD / ShadCN', orbit: 2, angle: 165 },
    { name: 'NoSQL / SQL', orbit: 2, angle: 285 },
    { name: 'Python / Flask / FastAPI', orbit: 3, angle: 90 },
    { name: 'AWS / Docker / GCP / Vercel', orbit: 3, angle: 210 },
    { name: 'GSAP / Motion / Three.js', orbit: 3, angle: 330 },
  ]
};
