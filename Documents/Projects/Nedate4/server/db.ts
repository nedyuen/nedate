import fs from 'fs';
import path from 'path';
import { Activity, Venue, MeetupRequest, RequestComment, TrustedEmail, AvailabilityRule, SystemSettings, AppStateData } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Thorpe Park',
    description: 'An exhilarating day exploring top-tier roller coasters silhouetted against a beautiful evening sky.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWJs7S_wKT4am7YsnjcTo18_ReWGOdjlrBTu0qtu6vsCP-zbYVlgBfxcWx_B-S9Qs7GW4VZVasavNLtOi1ok6wk8dRiIvQPkNzPjD4pdS4sC6no9P8pJczsUUuvWgZ3eR3wPuSFJuUmQ8UlJUZOU6RHgONxwemD1ZSBvig7eM9FaLnAOpszhYxmthAcX3NN-wV0TOhnsduu2JmyiOBY2opKSkHZNl8CqTa_oPsbdGC7DQdSt5GGeAiVeJXuLT38mtSWs1-22H8Ok4j',
    category: "ned's bucket list",
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-2',
    title: 'Japanese BBQ',
    description: 'Sizzling high-quality wagyu beef on a traditional charcoal desktop grill in an intimate atmosphere.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4jNF_UdVW1efIVsk5vVVGyaB6FuMtn8OGUQHbTYX3byCHGOEH9JJLYWfPqsAeBrB-3WMHcpGwPBAsFuef1ZVL-AJmQFLlQz4v1ZQwZJ7ypVSnfo3YKrVbqXSPRm7fTseYbD3S3Zsjq3E9xnY8D7OphK5gcX_qThMcZ1ISBzBxrueKw5evMn4xojokN86uoIFnh9Rw0Ks1GuFYfBZgb4Mq91toQorMv1M76ynnJYs5k9dbDSjW_giEq-4SPnPXLQog5hPkbLIdbjga',
    category: "ned's bucket list",
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-3',
    title: 'Board Games',
    description: 'A cozy, relaxing evening centering strategic games, wood textures, warm table lamps, and friendly banter.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlR-3POO97tT3MddWmc6jHabuylYEzzkAHtqfH4-hXoSq4t7tuOJX3Nxu62QHTbE0aXUFFwbRFFBF_Ho6-O720zhYGVGO4JPS6xKZDgpEHrohxCXZPmqoDIcIIZ4iFHbOKGf05dXDaQ5tUzIQsP7IZDvtlanafyodHurxto6v35cG7AziukYks2ae5r4baHCu1rNHdpj5hW9EZebjmK9IOQQOKbQNzEIyBdY1zZBF6kYNddLHyugkRdA8cwSDR72DOgNYU5zb7NnhS',
    category: "ned's bucket list",
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-4',
    title: 'Richmond Park Walk',
    description: 'An expansive morning stroll among misty hills, ancient oak trees, and wandering deer herds.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiblu8G94fi02SJCZzOk3swyJCQ4E9eyQ0CMAz2bK-KO72RsSrr4UQ0jQBYWH4pryB-WCvaIWcHZf0utS4GkCMoPXTKlNu3F3TPhQ2LfVmKeCvolK3h63zMNbkFtb6-kvW02haV5Vj7K8PgsIYwdAc_ydOakFurnxfJKbmQUAuJG-mAHCWuOAGMWcI_6aYLfUsm5_devoWqn3bWBW8v80xitIORDkKyGym_j72Y3i1_aHuUTcolWdR0YvtE4jgHRcvpOskdw0C2F5U',
    category: "ned's bucket list",
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-5',
    title: 'Escape Room',
    description: 'Unlock mysteries and decipher cryptic codes under pressure — a test of pure teamwork and wits.',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    category: "other activities",
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'act-6',
    title: 'New Restaurant Exploration',
    description: 'A culinary quest into London\'s newest, most innovative food spots and pop-up dining experiences.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX66sv1dsp7LRYwjZfT3-rqcbInMdPgxQlf9gJJ6l6sU_Mc2A7a9a2RzNcg8P0xG6K7Dv1t7yszfNWRrnNqNhkisc2sreSwnhVzmCK976Os8KhuaMFX1gsyrvj3ZkqJ6H67hhCSpEmHXAnhCs7mtMqtZDhiYw0oNtwgnEJoC4TmLlPhrfQXD8tc1jqEFOAq1fyrz9QLtvy9wndeFcydU9b6KNMfirpRBjJLl-hoT4lYZ9NRaHOGA9xGQDbY6iSaLrs7lNc3PH7NQq-',
    category: "other activities",
    active: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_VENUES: Venue[] = [
  {
    id: 'ven-1',
    name: 'Dishoom',
    category: 'dinner',
    address: 'Bombay Cafe Style • Shoreditch / King\'s Cross',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcWCcSulddzhn2xObTpoeUnKXhpszf_57CEcZ0KiyxYI5DPW9khXRonV5OxGePqYAY4sVsjTvQbkswjYLQ7gP3mWhUjNkKiA7RQGcUNxEQPYzwxqW5YwcuK-BEaNGkc3LOWOwHYWrzkshYBNPeGUIu82cn8JhuTTmQUKJhjwtG_T6Zqu9sEibUDdrTrE-ds6uviD0vSLF20id9vyGlan7U9sOlW1SwvYIDmoAMkEqEFejD-0-wZQNJ1bo9NtJIAX-wDJMTfWYnTXW4',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-2',
    name: 'Flat Iron',
    category: 'dinner',
    address: 'Remarkable Steakhouse • Soho / Covent Garden',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAw3AnfbuBbEC_wlfxPJ2GWwhNaxICa0oA3b6qGDQDyV9Ny6q8fJS3mk4kHjdEoXtSvu5uWL4iH3zOrq2-iA8jmzAyDpvpYz-OKtWJWf_FCGJpP--OOPeenusNp5EFLfBD4IMKE6LEFzF6RBFWDxRyhzTwFSJnLkoibzub1iwdkU2gTuEZ5JlMTaCn0mFbnrmvgkZDNzGndmtfITBDZqL0odnQkh5WgrtEXOHJpyFsVH0anQ1MLS4UGZpKtcfpEZ8mzvGZ0sSbuzmtj',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-3',
    name: 'Blacklock',
    category: 'dinner',
    address: 'Modern Chophouse • City / Soho',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCowgAyXLJCZhJYnJ5gj0vGoMgMFBn5lVRbosnUPYlNA9vloqk0Fi5svVfbOqF7BTBhlmU5-SHIprEyB2pQIgUv-uJEOWffO70JTQLXNoRtQwgjC9yGU2UQ-6IQ4AHVYrxSyTGHkrHJmOO0ivUhUzyybO0az8c82myglfFOoLBQxU29zrAs_I5JDRfNNYifCeStdjIMP6bJll83DYEG9yNnwM1wisp2oqmrTgklxp0X2ch-uyZX6q3JhrohguPnsSGHX4bUp0b5TSsh',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-4',
    name: 'Rosslyn Coffee',
    category: 'coffee',
    address: 'City of London cafe with legendary specialty items',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-5',
    name: 'WatchHouse',
    category: 'coffee',
    address: 'Beautiful architectural cafe in Bermondsey / Somerset House',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-7',
    name: 'Richmond Park',
    category: 'walk',
    address: 'Richmond Hill, London TW10 Choose Pembroke Lodge entrance',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiblu8G94fi02SJCZzOk3swyJCQ4E9eyQ0CMAz2bK-KO72RsSrr4UQ0jQBYWH4pryB-WCvaIWcHZf0utS4GkCMoPXTKlNu3F3TPhQ2LfVmKeCvolK3h63zMNbkFtb6-kvW02haV5Vj7K8PgsIYwdAc_ydOakFurnxfJKbmQUAuJG-mAHCWuOAGMWcI_6aYLfUsm5_devoWqn3bWBW8v80xitIORDkKyGym_j72Y3i1_aHuUTcolWdR0YvtE4jgHRcvpOskdw0C2F5U',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-8',
    name: 'Caravan Fitzrovia',
    category: 'breakfast',
    address: 'Yalding House, 152 Great Portland St, London W1W 6AJ',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-9',
    name: 'The Wolseley',
    category: 'breakfast',
    address: '160 Piccadilly, London W1J 9EB',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-10',
    name: 'Borough Market',
    category: 'lunch',
    address: '8 Southwark St, London SE1 1TL',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-11',
    name: 'Ottolenghi Spitalfields',
    category: 'lunch',
    address: '50 Artillery Ln, London E1 7LJ',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-12',
    name: 'The British Museum Court Café',
    category: 'chat',
    address: 'Great Russell St, London WC1B 3DG',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-13',
    name: 'Royal Botanic Gardens, Kew',
    category: 'day trip',
    address: 'Kew, Richmond, London TW9 3AB',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ven-14',
    name: 'ClueQuest Escape Room',
    category: 'other activities',
    address: '169-171 Caledonian Rd, London N1 0SL',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_RULES: AvailabilityRule[] = [
  {
    id: 'rule-1',
    dayOfWeek: 'Saturday',
    startTime: '14:00',
    endTime: '18:00',
    slotDuration: 120,
    active: true
  },
  {
    id: 'rule-2',
    dayOfWeek: 'Sunday',
    startTime: '13:00',
    endTime: '17:00',
    slotDuration: 120,
    active: true
  },
  {
    id: 'rule-3',
    dayOfWeek: 'Wednesday',
    startTime: '18:00',
    endTime: '21:00',
    slotDuration: 90,
    active: true
  }
];

const DEFAULT_EMAILS: TrustedEmail[] = [
  {
    id: 'trust-1',
    email: 'friend@gmail.com',
    notes: 'Primary school best friend',
    createdAt: new Date().toISOString()
  },
  {
    id: 'trust-2',
    email: 'sibling@example.com',
    notes: 'My brother John',
    createdAt: new Date().toISOString()
  },
  {
    id: 'trust-3',
    email: 'nedyuen@gmail.com',
    notes: 'Private testing email format',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  adminPassword: 'nedatepassword2026',
  slotDuration: '120',
  bufferTime: '15',
  futureWindow: '30',
  currentlyIn: 'London, UK',
  profilePhoto: 'https://media.licdn.com/dms/image/v2/D4E03AQGdnQW1KbHd3g/profile-displayphoto-scale_400_400/B4EZ2254gLKYAk-/0/1776890123502?e=1782345600&v=beta&t=wgq2XRTdlQl0lAIQFBX_VNjaBRqmGpZBYOWO6b_P0nk'
};

const INITIAL_REQUESTS: MeetupRequest[] = [
  {
    id: 'req-init-1',
    referenceCode: 'NED-0012',
    name: 'Julian Alexander',
    email: 'julian.a@curated.com',
    phone: '+44 7123 456789',
    activityType: 'Dinner',
    activityId: 'act-2',
    venueId: 'ven-1',
    notes: 'Celebrating a 10th anniversary. We would love a quiet booth if possible. Prefer the King\'s Cross location for its specific vintage aesthetic.',
    requestedTime: 'Saturday 7:00 PM',
    status: 'Alternative Proposed',
    publicToken: 'tok-julian-0012',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // yesterday
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    alternativeTime: 'Sunday 7:00 PM',
    alternativeComment: 'Hey! Sat is a bit busy, would you be open to Sunday instead?'
  }
];

const INITIAL_COMMENTS: RequestComment[] = [
  {
    id: 'com-1',
    requestId: 'req-init-1',
    authorType: 'System',
    message: 'Request Created',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'com-2',
    requestId: 'req-init-1',
    authorType: 'Admin',
    message: 'Can we move this to Sunday?',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  },
  {
    id: 'com-3',
    requestId: 'req-init-1',
    authorType: 'User',
    message: 'Sunday works for me!',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

export function readDb(): AppStateData {
  if (!fs.existsSync(DB_FILE)) {
    const data: AppStateData = {
      activities: DEFAULT_ACTIVITIES,
      venues: DEFAULT_VENUES,
      requests: INITIAL_REQUESTS,
      comments: INITIAL_COMMENTS,
      trustedEmails: DEFAULT_EMAILS,
      availabilityRules: DEFAULT_RULES,
      settings: DEFAULT_SETTINGS
    };
    writeDb(data);
    return data;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    // Ensure all required fields exist
    if (!parsed.comments) parsed.comments = [];
    if (!parsed.requests) parsed.requests = [];
    if (!parsed.trustedEmails) parsed.trustedEmails = [];
    if (!parsed.activities) parsed.activities = DEFAULT_ACTIVITIES;
    if (!parsed.venues) parsed.venues = DEFAULT_VENUES;
    if (!parsed.availabilityRules) parsed.availabilityRules = DEFAULT_RULES;
    if (!parsed.settings) parsed.settings = DEFAULT_SETTINGS;

    // Migrate categories
    const migrateCategory = (cat: string): string => {
      const lower = (cat || '').toLowerCase();
      if (lower === 'adventure' || lower === 'chill' || lower === 'outdoors') {
        return "ned's bucket list";
      }
      if (lower === 'food') {
        return 'other activities';
      }
      if (lower === 'theme park') {
        return "ned's bucket list";
      }
      if (lower === 'walk') {
        return 'walk';
      }
      if (lower === 'dinner') return 'dinner';
      if (lower === 'coffee') return 'coffee';
      if (lower === 'lunch') return 'lunch';
      return lower || 'other activities';
    };

    let needsWrite = false;
    parsed.activities = parsed.activities.map((act: any) => {
      const newCat = migrateCategory(act.category);
      if (act.category !== newCat) {
        needsWrite = true;
        return { ...act, category: newCat };
      }
      return act;
    });
    parsed.venues = parsed.venues.map((ven: any) => {
      const newCat = migrateCategory(ven.category);
      if (ven.category !== newCat) {
        needsWrite = true;
        return { ...ven, category: newCat };
      }
      return ven;
    });

    if (needsWrite) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed as AppStateData;
  } catch (err) {
    console.error('Error reading JSON DB, resetting to default', err);
    const data: AppStateData = {
      activities: DEFAULT_ACTIVITIES,
      venues: DEFAULT_VENUES,
      requests: INITIAL_REQUESTS,
      comments: INITIAL_COMMENTS,
      trustedEmails: DEFAULT_EMAILS,
      availabilityRules: DEFAULT_RULES,
      settings: DEFAULT_SETTINGS
    };
    writeDb(data);
    return data;
  }
}

export function writeDb(data: AppStateData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to JSON DB', err);
  }
}
