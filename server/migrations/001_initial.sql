CREATE TABLE IF NOT EXISTS opportunities (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  place TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  duration TEXT NOT NULL,
  contribution TEXT NOT NULL,
  capacity TEXT NOT NULL,
  level TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_experiences (
  visitor_id TEXT NOT NULL,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (visitor_id, opportunity_id)
);

CREATE TABLE IF NOT EXISTS journey_items (
  visitor_id TEXT NOT NULL,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (visitor_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS saved_experiences_visitor_idx ON saved_experiences(visitor_id);
CREATE INDEX IF NOT EXISTS journey_items_visitor_idx ON journey_items(visitor_id);

INSERT INTO opportunities (id, title, place, region, category, duration, contribution, capacity, level, image, description, tag)
VALUES
  (1, 'Restore the mangrove coast', 'Gazi Bay, Kenya', 'Coast', 'Nature', '2.5 hours', 'Plant native seedlings', '4 spots left', 'Easy', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=85', 'Join local conservation stewards to support mangrove restoration and learn why these coastal forests matter.', 'Community favourite'),
  (2, 'A morning with local makers', 'Lamu Old Town, Kenya', 'Coast', 'Culture', '3 hours', 'Learn & exchange skills', '6 spots left', 'Easy', 'https://images.unsplash.com/photo-1513415277900-a62401e19be4?auto=format&fit=crop&w=1000&q=85', 'Spend time with local artisans in a community-approved workshop where cultural knowledge stays in local hands.', 'Culture-led'),
  (3, 'Keep the shoreline thriving', 'Watamu, Kenya', 'Coast', 'Nature', '90 minutes', 'Reduce coastal waste', '8 spots left', 'Easy', 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1000&q=85', 'Work alongside a local beach team to collect, sort and record waste to support better coastal decisions.', 'High local value'),
  (4, 'Community biodiversity walk', 'Arabuko-Sokoke, Kenya', 'Forest', 'Biodiversity', '2 hours', 'Record species observations', '3 spots left', 'Moderate', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=85', 'Observe local biodiversity with a community guide and submit sightings for review by a local expert.', 'Guided by locals')
ON CONFLICT (id) DO NOTHING;
