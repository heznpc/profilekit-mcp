export interface CardEntry {
  description: string;
  required: string[];
  commonParams: string[];
}

export const CATALOG: Record<string, CardEntry> = {
  // Data
  stats: {
    description: "GitHub stats — commits, PRs, issues, stars, repos",
    required: ["username"],
    commonParams: ["theme", "hide", "layout", "hide_border", "font"],
  },
  languages: {
    description: "Top languages with bars or donut",
    required: ["username"],
    commonParams: ["theme", "langs_count", "hide", "layout", "hide_border"],
  },
  reviews: {
    description: "Code review stats",
    required: ["username"],
    commonParams: ["theme", "hide_border"],
  },
  pin: {
    description: "Repository pin card",
    required: ["username", "repo"],
    commonParams: ["theme", "description"],
  },
  leetcode: {
    description: "LeetCode stats",
    required: ["username"],
    commonParams: ["theme"],
  },
  social: {
    description: "Social links card",
    required: [],
    commonParams: ["github", "linkedin", "x", "email", "website", "youtube", "layout"],
  },
  quote: {
    description: "Random or daily dev quote",
    required: [],
    commonParams: ["daily", "width", "theme"],
  },

  // Blog Layout
  hero: {
    description: "Wide hero banner with animated background",
    required: [],
    commonParams: ["name", "subtitle", "bg", "theme", "color", "width", "height", "align", "font"],
  },
  section: {
    description: "Section header with underline animation",
    required: ["title"],
    commonParams: ["subtitle", "align", "icon", "color", "width", "theme"],
  },
  divider: {
    description: "Decorative divider (line/wave/dots/dashed/gradient/double)",
    required: [],
    commonParams: ["style", "color", "width", "height", "theme"],
  },
  now: {
    description: "'Currently' status card (coding/building/learning/reading/listening/watching/playing rows)",
    required: [],
    commonParams: ["coding", "building", "learning", "reading", "listening", "watching", "playing", "theme"],
  },
  timeline: {
    description: "Vertical timeline. items=when;title;desc|when;title;desc",
    required: ["items"],
    commonParams: ["theme", "width"],
  },
  tags: {
    description: "Tag cloud / skill pills. tags=React,TypeScript,Go:00add8,Python:3776ab",
    required: ["tags"],
    commonParams: ["theme", "width"],
  },
  toc: {
    description: "Table of contents. items=text;anchor|text;anchor",
    required: ["items"],
    commonParams: ["theme", "width"],
  },
  posts: {
    description: "Latest posts from devto/hashnode/medium/rss",
    required: ["source"],
    commonParams: ["username", "url", "count", "theme"],
  },

  // Animations
  typing: {
    description: "Typewriter text. lines=first,second,third (comma-separated)",
    required: ["lines"],
    commonParams: ["font", "size", "weight", "color", "speed", "pause", "cursor", "align", "width", "height", "frame"],
  },
  wave: {
    description: "Layered animated sin waves",
    required: [],
    commonParams: ["text", "color", "waves", "width", "height"],
  },
  terminal: {
    description: "Terminal window with auto-typing commands. commands=cmd1,cmd2,cmd3",
    required: ["commands"],
    commonParams: ["prompt", "window_title", "speed", "pause", "color", "width"],
  },
  neon: {
    description: "Neon glow with flicker effect",
    required: [],
    commonParams: ["text", "color", "size", "width", "height"],
  },
  glitch: {
    description: "RGB-split glitch text",
    required: [],
    commonParams: ["text", "color", "size", "width", "height"],
  },
  matrix: {
    description: "Matrix code rain",
    required: [],
    commonParams: ["text", "color", "density", "speed", "seed", "width", "height"],
  },
  snake: {
    description: "Standalone snake eating a contribution grid (animated, no GitHub data)",
    required: [],
    commonParams: ["color", "empty_color", "cols", "rows", "cell_size", "cell_gap", "duration", "seed"],
  },
  equalizer: {
    description: "Audio EQ bars",
    required: [],
    commonParams: ["bars", "label", "color", "width", "height", "seed"],
  },
  heartbeat: {
    description: "EKG heartbeat line",
    required: [],
    commonParams: ["text", "bpm", "color", "width", "height"],
  },
  constellation: {
    description: "Twinkling stars + connections",
    required: [],
    commonParams: ["text", "color", "density", "seed", "width", "height"],
  },
  radar: {
    description: "Rotating radar sweep with blips",
    required: [],
    commonParams: ["text", "color", "blips", "speed", "seed", "width", "height"],
  },

  // Composition
  stack: {
    description: "Compose multiple cards into one vertical SVG. cards=hero,section,divider,now",
    required: ["cards"],
    commonParams: ["gap", "theme", "font"],
  },

  // Utility
  health: {
    description: "Service health check (diagnostics, version)",
    required: [],
    commonParams: [],
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
