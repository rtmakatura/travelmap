// location-model.js
class LocationModel {
  constructor(data = {}) {
    // Required fields
    this.id = data.id || Date.now(); // Use timestamp as default ID
    this.name = data.name || '';
    this.lat = data.lat || 0;
    this.lng = data.lng || 0;
    
    // Basic info
    this.continent = data.continent || '';
    this.country = data.country || '';
    this.priority = data.priority || 'Someday'; // "Bucket List", "Soon", or "Someday"
    this.visitStatus = data.visitStatus || 'not visited'; // "not visited", "visited", "planned"
    this.visitDate = data.visitDate || null;
    this.notes = data.notes || '';
    this.tripType = data.tripType || []; // ["city", "beach", "mountains", "cultural", etc.]
    
    // Detailed info
    this.mustSee = data.mustSee || [];
    this.restaurants = data.restaurants || [];
    this.bestTimeToVisit = data.bestTimeToVisit || [];
    
    // Budget tracking
    this.budget = data.budget || {
      flight: { estimated: 0, actual: null },
      accommodation: { estimated: 0, actual: null },
      activities: { estimated: 0, actual: null },
      food: { estimated: 0, actual: null },
      misc: { estimated: 0, actual: null },
      total: { estimated: 0, actual: null }
    };
    
    // Visual content
    this.inspirationLinks = data.inspirationLinks || [];
    this.photos = data.photos || [];
    
    // Metadata
    this.createdBy = data.createdBy || 'me';
    this.lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];
  }
  
  // Calculate total budget
  calculateTotalBudget() {
    const categories = ['flight', 'accommodation', 'activities', 'food', 'misc'];
    
    // Calculate estimated total
    this.budget.total.estimated = categories.reduce((sum, category) => {
      return sum + (this.budget[category].estimated || 0);
    }, 0);
    
    // Calculate actual total if actuals exist
    const hasActuals = categories.some(category => this.budget[category].actual !== null);
    if (hasActuals) {
      this.budget.total.actual = categories.reduce((sum, category) => {
        return sum + (this.budget[category].actual || this.budget[category].estimated || 0);
      }, 0);
    }
    
    return this.budget.total;
  }
  
  // Utility method to convert old format to new format
  static convertFromOldFormat(oldData) {
    // Map old priority to new format
    const priorityMap = {
      'high': 'Bucket List',
      'medium': 'Soon',
      'low': 'Someday'
    };
    
    // Create new location object
    const newLocation = new LocationModel({
      id: oldData.id,
      name: oldData.name,
      lat: oldData.lat,
      lng: oldData.lng,
      notes: oldData.notes,
      priority: priorityMap[oldData.priority] || 'Someday'
    });
    
    // Map old "vibe" to tripType if it exists
    if (oldData.vibe) {
      newLocation.tripType = [oldData.vibe];
    }
    
    // Set up estimated budget based on old "cost" if it exists
    if (oldData.cost) {
      const costMap = {
        'low': 1000,
        'medium': 3000,
        'high': 5000
      };
      const estimatedTotal = costMap[oldData.cost] || 3000;
      
      // Distribute total across categories roughly
      newLocation.budget = {
        flight: { estimated: Math.round(estimatedTotal * 0.3), actual: null },
        accommodation: { estimated: Math.round(estimatedTotal * 0.3), actual: null },
        activities: { estimated: Math.round(estimatedTotal * 0.15), actual: null },
        food: { estimated: Math.round(estimatedTotal * 0.15), actual: null },
        misc: { estimated: Math.round(estimatedTotal * 0.1), actual: null },
        total: { estimated: estimatedTotal, actual: null }
      };
    }
    
    return newLocation;
  }
  
  // Convert to storage format (e.g., for JSON)
  toJSON() {
    return {
      ...this,
      lastUpdated: new Date().toISOString().split('T')[0] // Update the lastUpdated date
    };
  }
}

// Export for use in other files
export default LocationModel;