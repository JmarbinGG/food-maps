# AI-Powered Food Distribution Optimization

## Overview
Food Maps uses an advanced multi-agent AI system to automatically match food donations with recipients and optimize delivery routes for maximum efficiency and coverage.

## AI Agents

### 1. Intake Agent
- Processes new donations and help requests
- Validates and geocodes addresses
- Estimates food weights and nutritional values

### 2. Triage Agent  
- Assigns urgency scores based on:
  - Food perishability levels
  - Special needs (water, baby food, medical diets)
  - Household size and vulnerability
  - Time constraints and SLA requirements

### 3. Bundler Agent
- Matches donations with nearby recipients using AI scoring
- Considers category preferences, dietary restrictions
- Optimizes for proximity and household needs
- Creates efficient pickup-delivery pairs

### 4. Optimizer Agent
- Creates optimized multi-stop routes for volunteers
- Considers vehicle capacity and refrigeration needs
- Uses Mapbox Optimization API for small routes
- Falls back to heuristic algorithms for larger routes

### 5. Coverage Guardian
- Monitors all open requests for SLA compliance
- Identifies coverage gaps and unmatched needs
- Creates emergency tasks for critical situations
- Escalates to human dispatchers when needed

## Matching Algorithm

The AI matching system scores potential donation-recipient pairs based on:

- **Category Matching** (30 points): Exact category matches or "any" preference
- **Special Needs Priority** (50 points): Critical needs like water get highest priority  
- **Quantity Adequacy** (20 points): Sufficient food for household size
- **Proximity Bonus** (30 points): Closer donations score higher
- **Urgency Alignment** (25 points): High-perishable foods matched with urgent requests

Minimum match threshold: 50 points

## Route Optimization

Routes are optimized considering:
- Vehicle capacity constraints (weight limits)
- Refrigeration requirements for perishable foods
- Time windows for pickups and deliveries
- Maximum route duration (4 hours default)
- Volunteer availability and location

## SLA Guarantees

- **Water requests**: 4-6 hour delivery target
- **High-perishable food**: 6-8 hour delivery target  
- **Shelf-stable items**: 24 hour delivery target
- **Emergency escalation**: When 80%+ of SLA time elapsed

## Auto-Assignment Features

- Real-time matching runs every 60 seconds
- Automatic volunteer assignment based on proximity and capacity
- Dynamic re-routing when new urgent requests arrive
- Predictive delivery time estimates
- Coverage gap detection and emergency task creation

Last updated: January 2025