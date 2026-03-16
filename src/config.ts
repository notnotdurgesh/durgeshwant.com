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
      logo: "/assets/experience/Google.png",
      skills: [
        { name: "React", icon: "Code" },
        { name: "TypeScript", icon: "FileJson" },
        { name: "Node.js", icon: "Server" },
        { name: "Generative AI", icon: "Zap" },
        { name: "Agentic Workflows", icon: "Bot" }
      ]
    },
    {
      role: "Full Stack Developer",
      company: "Comfac Tech Options",
      date: "Feb 2025 - Feb 2026",
      description: "Architected and scaled a mission-critical internal workforce management tool, boosting operational efficiency across multiple departments by a measurable 40%. Engineered dynamic, high-performance list and edit views using React, TypeScript, and GraphQL.",
      logo: "/assets/experience/cto.png",
      skills: [
        { name: "React", icon: "Code" },
        { name: "TypeScript", icon: "FileJson" },
        { name: "GraphQL", icon: "Share2" },
        { name: "Node.js", icon: "Server" },
        { name: "PostgreSQL", icon: "Database" },
        { name: "Tailwind CSS", icon: "Palette" }
      ]
    },
    {
      role: "Full Stack Developer",
      company: "Dynish Solutions",
      date: "Oct 2024 - Feb 2025",
      description: "Led a team of two engineers to architect and deploy a scalable navigation and routing system with Next.js, improving modularity and decreasing page load times by 35%. Implemented a robust, enterprise-grade Role-Based Access Control (RBAC) system.",
      logo: "/assets/experience/Dynish.png",
      skills: [
        { name: "Next.js", icon: "Globe" },
        { name: "React", icon: "Code" },
        { name: "TypeScript", icon: "FileJson" },
        { name: "RBAC", icon: "Shield" },
        { name: "AWS", icon: "Cloud" },
        { name: "Optimization", icon: "Zap" }
      ]
    },
    {
      role: "SWE Intern",
      company: "Umenit Solutions",
      date: "June 2024 - August 2024",
      description: "Built a high-throughput analytics backend to process and analyze user data, resulting in a 20% increase in user engagement and retention metrics. Developed an automated mailing system for sales and lead generation.",
      logo: "/assets/experience/umenit.png",
      skills: [
        { name: "Node.js", icon: "Server" },
        { name: "Python", icon: "Terminal" },
        { name: "Flask", icon: "Zap" },
        { name: "Data Analytics", icon: "BarChart" },
        { name: "Redis", icon: "Database" },
        { name: "Automation", icon: "Settings" }
      ]
    }
  ],
  projects: [
        {
      title: 'Google-Build-and-Blog-2k25 ',
      category: 'Winning hackathon project',
      description: 'Ai enabled music studio to synthese music',
      image: '/assets/probeat/image.png',
      color: '#15ff00ff', // Muted wood
      github: 'https://github.com/notnotdurgesh/Google-Build-and-Blog-20k25',
      skills: [
        { name: "React", icon: "Code" },
        { name: "Web Audio", icon: "Music" },
        { name: "Gemini", icon: "Zap" },
        { name: "Tailwind", icon: "Palette" }
      ]
    },
    {
      title: 'God Chat',
      category: 'User First Workspace',
      description: 'A premium, agentic workspace for creators that transforms AI conversations into an interactive knowledge graph, predictive suggestions, and visual branching to empower sophisticated, non-linear brainstorming.',
      image: '/assets/godchat/image.png',
      color: 'rgba(212, 0, 255, 1)ff', // Sage green
      github: 'https://github.com/notnotdurgesh/GodChat',
      skills: [
        { name: "React", icon: "Code" },
        { name: "D3.js", icon: "Share2" },
        { name: "Gemini 2.0", icon: "Zap" },
        { name: "Motion", icon: "Layers" },
        { name: "Vite", icon: "Zap" }
      ]
    },
    {
      title: 'AutoXL',
      category: 'AI-Powered Spreadsheet',
      description: 'An AI-driven, Excel-like web spreadsheet featuring virtual scrolling, undo/redo, and a multimodal Gemini agent with over 30 tool actions for complex data transformations.',
      image: '/assets/autoxl/product.png',
      color: '#d63636ff', // Warm honey
      github: 'https://github.com/notnotdurgesh/autoXL',
      live: 'https://autoxl.online',
      skills: [
        { name: "React", icon: "Code" },
        { name: "TypeScript", icon: "FileJson" },
        { name: "Canvas", icon: "Palette" },
        { name: "Workers", icon: "Cpu" },
        { name: "Node.js", icon: "Server" }
      ]
    },
    {
      title: 'FindFounder',
      category: 'Matchmaking Platform',
      description: 'A full-stack founder-developer matchmaking platform facilitating intelligent co-founder discovery with role-based routing, real-time notifications, and GitHub OAuth.',
      image: '/assets/findFounder/home.png',
      color: '#f38c0eff', // Muted wood
      github: 'https://github.com/notnotdurgesh/findFounder_fe',
      skills: [
        { name: "Next.js", icon: "Globe" },
        { name: "Tailwind", icon: "Palette" },
        { name: "Clerk", icon: "Lock" },
        { name: "PostgreSQL", icon: "Database" },
        { name: "Prisma", icon: "Layers" }
      ]
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
