export const PROJECT_ICON_MAP = {
  // Frameworks
  'vue': 'logos:vue',
  'react': 'logos:react',
  'next': 'logos:nextjs-icon',
  'nuxt': 'logos:nuxt-icon',
  'svelte': 'logos:svelte-icon',
  'angular': 'logos:angular-icon',
  'laravel': 'logos:laravel',
  'blade': 'logos:laravel', // Blade usually implies Laravel

  // Languages
  'javascript': 'logos:javascript',
  'typescript': 'logos:typescript-icon',
  'html': 'logos:html-5',
  'css': 'logos:css-3',
  'python': 'logos:python',
  'c#': 'logos:c-sharp',
  'c++': 'logos:c-plusplus',
  'c': 'logos:c',
  'java': 'logos:java',
  'php': 'logos:php',
  'go': 'logos:go',
  'dart': 'logos:dart',
  'rust': 'logos:rust',
  'ruby': 'logos:ruby',
  'swift': 'logos:swift',
  'kotlin': 'logos:kotlin-icon',
  'scss': 'logos:sass',
  'sass': 'logos:sass',
  'shell': 'logos:bash-icon',
  'bash': 'logos:bash-icon',
  'markdown': 'logos:markdown',

  // Tools / Others
  'touchdesigner': 'file-icons:touchdesigner',
  'jupyter': 'logos:jupyter',
  'jupyter notebook': 'logos:jupyter',
  'unity': 'logos:unity',
  'electron': 'logos:electron',
  'docker': 'logos:docker-icon',
  
  // Default
  'generic': 'mdi:folder-outline',
  'github': 'mdi:github'
};

export const getProjectIcon = (type) => {
  if (!type) return PROJECT_ICON_MAP['github'];
  
  const key = type.toLowerCase();
  
  // Direct match
  if (PROJECT_ICON_MAP[key]) return PROJECT_ICON_MAP[key];

  // Fuzzy / Alias matching
  if (key === 'js') return PROJECT_ICON_MAP['javascript'];
  if (key === 'ts') return PROJECT_ICON_MAP['typescript'];
  if (key === 'py') return PROJECT_ICON_MAP['python'];
  if (key === 'cpp') return PROJECT_ICON_MAP['c++'];
  if (key === 'cs') return PROJECT_ICON_MAP['c#'];
  if (key === 'csharp') return PROJECT_ICON_MAP['c#'];
  if (key === 'golang') return PROJECT_ICON_MAP['go'];
  
  return PROJECT_ICON_MAP['github']; // Default fallback
};
