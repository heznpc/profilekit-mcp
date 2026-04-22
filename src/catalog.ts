export interface CardEntry {
  description: string;
  required: string[];
  common_params: string[];
}

export const CATALOG: Record<string, CardEntry> = {
  // Data
  stats: {
    description: "GitHub stats — commits, PRs, issues, stars, repos",
    required: ["username"],
    common_params: ["theme", "hide", "layout", "hide_border", "font"],
  },
  languages: {
    description: "Top languages with bars or donut",
    required: ["username"],
    common_params: ["theme", "langs_count", "hide", "layout", "hide_border"],
  },
  reviews: {
    description: "Code review stats",
    required: ["username"],
    common_params: ["theme", "hide_border"],
  },
  pin: {
    description: "Repository pin card",
    required: ["username", "repo"],
    common_params: ["theme", "description"],
  },
  leetcode: {
    description: "LeetCode stats",
    required: ["username"],
    common_params: ["theme"],
  },
  social: {
    description: "Social links card",
    required: [],
    common_params: ["github", "linkedin", "x", "email", "website", "youtube", "layout"],
  },
  quote: {
    description: "Random or daily dev quote",
    required: [],
    common_params: ["daily", "width", "theme"],
  },

  // Blog Layout
  hero: {
    description: "Wide hero banner with animated background",
    required: [],
    common_params: ["name", "subtitle", "bg", "theme", "color", "width", "height", "align", "font"],
  },
  section: {
    description: "Section header with underline animation",
    required: ["title"],
    common_params: ["subtitle", "align", "icon", "color", "width", "theme"],
  },
  divider: {
    description: "Decorative divider (line/wave/dots/dashed/gradient/double)",
    required: [],
    common_params: ["style", "color", "width", "height", "theme"],
  },
  now: {
    description: "'Currently' status card (coding/building/learning/reading/listening/watching/playing rows)",
    required: [],
    common_params: ["coding", "building", "learning", "reading", "listening", "watching", "playing", "theme"],
  },
  timeline: {
    description: "Vertical timeline. items=when;title;desc|when;title;desc",
    required: ["items"],
    common_params: ["theme", "width"],
  },
  tags: {
    description: "Tag cloud / skill pills. tags=React,TypeScript,Go:00add8,Python:3776ab",
    required: ["tags"],
    common_params: ["theme", "width"],
  },
  toc: {
    description: "Table of contents. items=text;anchor|text;anchor",
    required: ["items"],
    common_params: ["theme", "width"],
  },
  posts: {
    description: "Latest posts from devto/hashnode/medium/rss",
    required: ["source"],
    common_params: ["username", "url", "count", "theme"],
  },

  // Animations
  typing: {
    description: "Typewriter text. lines=first,second,third (comma-separated)",
    required: ["lines"],
    common_params: ["font", "size", "weight", "color", "speed", "pause", "cursor", "align", "width", "height", "frame"],
  },
  wave: {
    description: "Layered animated sin waves",
    required: [],
    common_params: ["text", "color", "waves", "width", "height"],
  },
  terminal: {
    description: "Terminal window with auto-typing commands. commands=cmd1,cmd2,cmd3",
    required: ["commands"],
    common_params: ["prompt", "window_title", "speed", "pause", "color", "width"],
  },
  neon: {
    description: "Neon glow with flicker effect",
    required: [],
    common_params: ["text", "color", "size", "width", "height"],
  },
  glitch: {
    description: "RGB-split glitch text",
    required: [],
    common_params: ["text", "color", "size", "width", "height"],
  },
  matrix: {
    description: "Matrix code rain",
    required: [],
    common_params: ["text", "color", "density", "speed", "seed", "width", "height"],
  },
  snake: {
    description: "Standalone snake eating a contribution grid (animated, no GitHub data)",
    required: [],
    common_params: ["color", "empty_color", "cols", "rows", "cell_size", "cell_gap", "duration", "seed"],
  },
  equalizer: {
    description: "Audio EQ bars",
    required: [],
    common_params: ["bars", "label", "color", "width", "height", "seed"],
  },
  heartbeat: {
    description: "EKG heartbeat line",
    required: [],
    common_params: ["text", "bpm", "color", "width", "height"],
  },
  constellation: {
    description: "Twinkling stars + connections",
    required: [],
    common_params: ["text", "color", "density", "seed", "width", "height"],
  },
  radar: {
    description: "Rotating radar sweep with blips",
    required: [],
    common_params: ["text", "color", "blips", "speed", "seed", "width", "height"],
  },

  // Composition
  stack: {
    description: "Compose multiple cards into one vertical SVG. cards=hero,section,divider,now",
    required: ["cards"],
    common_params: ["gap", "theme", "font"],
  },

  // Utility
  health: {
    description: "Service health check (diagnostics, version)",
    required: [],
    common_params: [],
  },
};

export const THEMES = [
  "dark",
  "dark_dimmed",
  "light",
  "tokyo_night",
  "nord",
  "gruvbox_dark",
  "catppuccin_mocha",
  "catppuccin_latte",
  "dracula",
  "monokai",
  "one_dark",
  "kanagawa",
  "synthwave",
  "solarized_dark",
  "solarized_light",
  "rose_pine",
  "rose_pine_dawn",
];
