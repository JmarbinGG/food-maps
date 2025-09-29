// Supabase Export and Migration Utilities
// Generates SQL schemas and migration scripts for Supabase

class SupabaseExporter {
  constructor() {
    this.schemas = this.generateSchemas();
  }

  generateSchemas() {
    return {
      users: `
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT CHECK (role IN ('donor', 'recipient', 'volunteer', 'dispatcher', 'admin')),
  phone TEXT,
  address TEXT,
  coordinates JSONB,
  preferences JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      food_listings: `
CREATE TABLE food_listings (
  id TEXT PRIMARY KEY,
  donor_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('produce', 'prepared', 'packaged', 'beverages', 'bakery', 'dairy')),
  quantity NUMERIC,
  unit TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  pickup_address TEXT,
  coordinates JSONB,
  status TEXT CHECK (status IN ('available', 'claimed', 'completed', 'expired')) DEFAULT 'available',
  priority_level TEXT CHECK (priority_level IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
  recipient_id TEXT REFERENCES users(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      schedules: `
CREATE TABLE schedules (
  id TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('pickup', 'delivery')),
  listing_id TEXT REFERENCES food_listings(id),
  driver_id TEXT REFERENCES users(id),
  recipient_id TEXT REFERENCES users(id),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  pickup_address TEXT,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      tasks: `
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('pickup_delivery', 'pickup_only', 'delivery_only', 'emergency_response', 'community_outreach')),
  pickup_schedule_id TEXT REFERENCES schedules(id),
  delivery_schedule_id TEXT REFERENCES schedules(id),
  driver_id TEXT REFERENCES users(id),
  route_data JSONB,
  estimated_time INTEGER,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'emergency')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'failed')) DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      ai_matches: `
CREATE TABLE ai_matches (
  id TEXT PRIMARY KEY,
  listing_id TEXT REFERENCES food_listings(id),
  recipient_id TEXT REFERENCES users(id),
  match_score NUMERIC CHECK (match_score >= 0 AND match_score <= 100),
  matching_factors JSONB,
  distance_km NUMERIC,
  agent_type TEXT CHECK (agent_type IN ('bundler_agent', 'triage_agent', 'optimizer_agent', 'coverage_guardian')),
  status TEXT CHECK (status IN ('suggested', 'accepted', 'declined', 'expired')) DEFAULT 'suggested',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,

      agent_logs: `
CREATE TABLE agent_logs (
  id TEXT PRIMARY KEY,
  agent_name TEXT CHECK (agent_name IN ('intake_agent', 'triage_agent', 'bundler_agent', 'optimizer_agent', 'coverage_guardian')),
  action TEXT,
  input_data JSONB,
  output_data JSONB,
  execution_time_ms INTEGER,
  status TEXT CHECK (status IN ('success', 'error', 'warning')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`
    };
  }

  async generateMigrationScript() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
    const filename = `${timestamp}_food_maps_migration.sql`;
    
    let script = `-- Food Maps Database Migration\n-- Generated on ${new Date().toISOString()}\n\n`;
    
    // Add schemas
    Object.entries(this.schemas).forEach(([tableName, schema]) => {
      script += `-- Create ${tableName} table\n${schema}\n\n`;
    });
    
    // Add indexes
    script += this.generateIndexes();
    
    // Add RLS policies
    script += this.generateRLSPolicies();
    
    return { script, filename };
  }

  generateIndexes() {
    return `-- Indexes for better performance
CREATE INDEX idx_food_listings_status ON food_listings(status);
CREATE INDEX idx_food_listings_category ON food_listings(category);
CREATE INDEX idx_food_listings_donor ON food_listings(donor_id);
CREATE INDEX idx_food_listings_location ON food_listings USING GIST ((coordinates::geometry));
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_time ON schedules(scheduled_time);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_driver ON tasks(driver_id);
CREATE INDEX idx_ai_matches_listing ON ai_matches(listing_id);
CREATE INDEX idx_ai_matches_recipient ON ai_matches(recipient_id);
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent_name);
CREATE INDEX idx_agent_logs_created ON agent_logs(created_at);

`;
  }

  generateRLSPolicies() {
    return `-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_matches ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Food listings policies
CREATE POLICY "Anyone can view available listings" ON food_listings
  FOR SELECT USING (status = 'available');

CREATE POLICY "Donors can manage their listings" ON food_listings
  FOR ALL USING (auth.uid()::text = donor_id);

-- Schedules policies
CREATE POLICY "Drivers can view their schedules" ON schedules
  FOR SELECT USING (auth.uid()::text = driver_id);

CREATE POLICY "Recipients can view their deliveries" ON schedules
  FOR SELECT USING (auth.uid()::text = recipient_id);

-- Tasks policies
CREATE POLICY "Drivers can view their tasks" ON tasks
  FOR SELECT USING (auth.uid()::text = driver_id);

CREATE POLICY "Drivers can update their task status" ON tasks
  FOR UPDATE USING (auth.uid()::text = driver_id);

`;
  }

  async exportData() {
    try {
      const exportData = await window.exportToSupabase.exportAllData();
      
      // Generate SQL insert statements
      let sqlInserts = '-- Data Export\n\n';
      
      Object.entries(exportData).forEach(([tableName, records]) => {
        if (Array.isArray(records) && records.length > 0) {
          sqlInserts += `-- Insert data for ${tableName}\n`;
          
          records.forEach(record => {
            const data = record.objectData || record;
            const columns = Object.keys(data).join(', ');
            const values = Object.values(data).map(v => 
              v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`
            ).join(', ');
            
            sqlInserts += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
          });
          
          sqlInserts += '\n';
        }
      });
      
      return sqlInserts;
    } catch (error) {
      console.error('Data export error:', error);
      throw error;
    }
  }

  async downloadSupabaseMigration() {
    try {
      const { script, filename } = await this.generateMigrationScript();
      const dataScript = await this.exportData();
      
      const fullScript = script + dataScript;
      
      const blob = new Blob([fullScript], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Migration download error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize Supabase exporter
window.supabaseExporter = new SupabaseExporter();