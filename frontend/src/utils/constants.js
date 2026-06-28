export const SKILL_CATEGORIES = [
  'Technology','Design','Music','Language','Cooking',
  'Fitness','Art','Business','Writing','Photography',
  'Video & Film','Crafts','Sports','Academia','Finance',
  'Marketing','Teaching','Other',
];
export const SKILL_LEVELS = ['beginner','intermediate','advanced','expert'];
export const EXPERIENCE_LEVELS = ['student','beginner','intermediate','advanced','expert','professional'];
export const EXCHANGE_TYPES = ['online','in-person','both'];
export const CATEGORY_EMOJIS = {
  Technology:'💻',Design:'🎨',Music:'🎵',Language:'🌍',Cooking:'🍳',
  Fitness:'💪',Art:'🖼️',Business:'📊',Writing:'✍️',Photography:'📸',
  'Video & Film':'🎬',Crafts:'🧵',Sports:'⚽',Academia:'🎓',Finance:'💰',
  Marketing:'📣',Teaching:'👨‍🏫',Other:'🌟',
};
export const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';
