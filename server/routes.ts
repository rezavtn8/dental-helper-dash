import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side operations
// You'll need to add your Supabase service role key to environment variables
const supabaseUrl = 'https://jnbdhtlmdxtanwlubyis.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Dental Helper Dashboard API is running" });
  });

  // Clinic endpoints
  app.get("/api/clinics/:code", async (req, res) => {
    try {
      const code = req.params.code.toLowerCase().trim();
      console.log('🔍 Searching for clinic with code:', code);

      const { data: clinic, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('clinic_code', code)
        .eq('is_active', true)
        .single();

      if (error || !clinic) {
        console.log('❌ Clinic not found for code:', code, error);
        return res.status(404).json({ error: "Clinic not found" });
      }

      console.log('✅ Found clinic:', clinic.name);
      res.json(clinic);
    } catch (error) {
      console.error('❌ Database error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/clinics", async (req, res) => {
    try {
      const { name, clinic_code, address, phone, owner_email } = req.body;
      
      console.log('📝 Creating new clinic:', { name, clinic_code, owner_email });

      // Validate required fields
      if (!name || !clinic_code || !owner_email) {
        return res.status(400).json({ 
          error: "Missing required fields: name, clinic_code, owner_email" 
        });
      }

      const normalizedCode = clinic_code.toLowerCase().trim();

      // Check if clinic code already exists
      const { data: existingClinic } = await supabase
        .from('clinics')
        .select('id')
        .eq('clinic_code', normalizedCode)
        .single();

      if (existingClinic) {
        return res.status(409).json({ 
          error: "Clinic code already exists. Please choose a different code." 
        });
      }

      // Create the clinic
      const { data: newClinic, error } = await supabase
        .from('clinics')
        .insert({
          name: name.trim(),
          clinic_code: normalizedCode,
          address: address?.trim() || null,
          phone: phone?.trim() || null,
          email: owner_email.toLowerCase().trim(),
          is_active: true,
          subscription_status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating clinic:', error);
        return res.status(500).json({ error: "Failed to create clinic" });
      }

      console.log('✅ Clinic created successfully:', newClinic.id);
      res.status(201).json(newClinic);
    } catch (error) {
      console.error('❌ Error creating clinic:', error);
      res.status(500).json({ error: "Failed to create clinic" });
    }
  });

  // Get all active clinics (for admin purposes)
  app.get("/api/clinics", async (req, res) => {
    try {
      const { data: allClinics, error } = await supabase
        .from('clinics')
        .select('id, name, clinic_code, is_active, subscription_status, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching clinics:', error);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json(allClinics || []);
    } catch (error) {
      console.error('❌ Error fetching clinics:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Check if clinic code is available
  app.get("/api/clinics/check-code/:code", async (req, res) => {
    try {
      const code = req.params.code.toLowerCase().trim();
      
      const { data: existingClinic } = await supabase
        .from('clinics')
        .select('id')
        .eq('clinic_code', code)
        .single();

      res.json({ 
        available: !existingClinic,
        code: code
      });
    } catch (error) {
      console.error('❌ Error checking clinic code:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User management endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      console.log('📝 Creating new user:', { 
        email: userData.email, 
        role: userData.role,
        clinic_id: userData.clinic_id 
      });

      // Validate required fields
      if (!userData.email || !userData.role) {
        return res.status(400).json({ 
          error: "Missing required fields: email, role" 
        });
      }

      const user = await storage.createUser(userData);
      console.log('✅ User created successfully:', user.id);
      res.status(201).json(user);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Get users by clinic - using Supabase profiles table if it exists
  app.get("/api/clinics/:clinic_id/users", async (req, res) => {
    try {
      const clinic_id = req.params.clinic_id;
      
      // Assuming you have a profiles table or similar for user data
      const { data: clinicUsers, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, is_active, created_at')
        .eq('clinic_id', clinic_id)
        .eq('is_active', true)
        .order('created_at');

      if (error) {
        console.error('❌ Error fetching clinic users:', error);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json(clinicUsers || []);
    } catch (error) {
      console.error('❌ Error fetching clinic users:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Search clinics by name (for clinic finder)
  app.get("/api/search/clinics", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const searchTerm = q.toLowerCase().trim();
      
      // Search with ilike for case-insensitive partial matching
      const { data: results, error } = await supabase
        .from('clinics')
        .select('id, name, clinic_code, address')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,clinic_code.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error('❌ Error searching clinics:', error);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json(results || []);
    } catch (error) {
      console.error('❌ Error searching clinics:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API info endpoint
  app.get("/api", (_req, res) => {
    res.json({
      name: "Dental Helper Dashboard API",
      version: "1.0.0",
      endpoints: [
        "GET /api/health - Health check",
        "GET /api/clinics/:code - Get clinic by code",
        "POST /api/clinics - Create new clinic",
        "GET /api/clinics - Get all active clinics",
        "GET /api/clinics/check-code/:code - Check if clinic code is available",
        "GET /api/clinics/:clinic_id/users - Get users for a clinic",
        "GET /api/search/clinics?q=query - Search clinics by name",
        "GET /api/users/:id - Get user by ID",
        "POST /api/users - Create new user",
        "GET /api - This endpoint"
      ]
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}