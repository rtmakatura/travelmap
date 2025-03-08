// app.js
import LocationModel from './location-model.js';
import StorageServiceFactory from './storage-service.js';

class TravelWishlistApp {
  constructor(config = {}) {
    // Initialize configuration
    this.config = {
      mapId: 'map',
      storageType: 'localStorage',
      ...config
    };
    
    // Initialize storage
    this.storageService = StorageServiceFactory.getStorageService(
      this.config.storageType, 
      this.config.storageConfig
    );
    
    // Initialize state
    this.locations = [];
    this.map = null;
    this.markers = {};
    this.activeLocationId = null;
    
    // Bind methods
    this.initMap = this.initMap.bind(this);
    this.loadLocations = this.loadLocations.bind(this);
    this.renderMarkers = this.renderMarkers.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.saveLocation = this.saveLocation.bind(this);
    this.deleteLocation = this.deleteLocation.bind(this);
    this.showLocationDetails = this.showLocationDetails.bind(this);
    this.filterLocations = this.filterLocations.bind(this);
    this.handleImportExport = this.handleImportExport.bind(this);
  }
  
  async init() {
    // Initialize the map
    this.initMap();
    
    // Check if we need to migrate from old data format
    await this.migrateDataIfNeeded();
    
    // Load locations from storage
    await this.loadLocations();
    
    // Render markers on the map
    this.renderMarkers();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('Travel Wishlist Map initialized');
    return this;
  }
  
  initMap() {
    // Initialize Leaflet map
    this.map = L.map(this.config.mapId).setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Add map click event listener
    this.map.on('click', this.handleMapClick);
  }
  
  async migrateDataIfNeeded() {
    // Use storage service to check and migrate data if needed
    if (this.config.storageType === 'localStorage') {
      await this.storageService.migrateFromOldFormat();
    }
  }
  
  async loadLocations() {
    this.locations = await this.storageService.getAllLocations();
    return this.locations;
  }
  
  renderMarkers() {
    // Clear existing markers
    Object.values(this.markers).forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = {};
    
    // Create new markers for each location
    this.locations.forEach(location => {
      // Create marker with appropriate icon based on priority
      const marker = this.createMarker(location);
      
      // Add marker to the map and store in the markers object
      marker.addTo(this.map);
      this.markers[location.id] = marker;
    });
  }
  
  createMarker(location) {
    // Create icon based on priority
    const icon = this.getMarkerIcon(location.priority);
    
    // Create marker
    const marker = L.marker([location.lat, location.lng], { icon });
    
    // Add popup with basic info
    marker.bindPopup(`
      <strong>${location.name}</strong>
      <p>${location.country}</p>
      <p>Priority: ${location.priority}</p>
      <button class="popup-details-btn" data-id="${location.id}">View Details</button>
    `);
    
    // Add event listener for popup
    marker.on('popupopen', (e) => {
      // Find the details button in the popup
      const detailsBtn = document.querySelector(`.popup-details-btn[data-id="${location.id}"]`);
      if (detailsBtn) {
        detailsBtn.addEventListener('click', () => {
          this.showLocationDetails(location.id);
        });
      }
    });
    
    return marker;
  }
  
  getMarkerIcon(priority) {
    // Set icon color based on priority
    let iconColor;
    switch (priority) {
      case 'Bucket List':
        iconColor = 'red';
        break;
      case 'Soon':
        iconColor = 'orange';
        break;
      case 'Someday':
      default:
        iconColor = 'blue';
        break;
    }
    
    // Create Leaflet icon
    return L.divIcon({
      className: `marker-icon priority-${priority.toLowerCase().replace(' ', '-')}`,
      html: `<div style="background-color: ${iconColor}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }
  
  handleMapClick(e) {
    // Create a new location at click coordinates
    const newLocation = new LocationModel({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      name: 'New Location'
    });
    
    // Show edit form for new location
    this.showLocationDetails(newLocation);
  }
  
  async saveLocation(location) {
    // Ensure location is a LocationModel instance
    if (!(location instanceof LocationModel)) {
      location = new LocationModel(location);
    }
    
    // Calculate total budget
    location.calculateTotalBudget();
    
    // Save to storage
    await this.storageService.saveLocation(location);
    
    // Reload locations and render markers
    await this.loadLocations();
    this.renderMarkers();
    
    return location;
  }
  
  async deleteLocation(id) {
    // Delete from storage
    const deleted = await this.storageService.deleteLocation(id);
    
    if (deleted) {
      // Remove marker from map
      if (this.markers[id]) {
        this.map.removeLayer(this.markers[id]);
        delete this.markers[id];
      }
      
      // Reload locations
      await this.loadLocations();
      
      // Close details panel if the deleted location was active
      if (this.activeLocationId === id) {
        this.closeLocationDetails();
      }
    }
    
    return deleted;
  }
  
  showLocationDetails(locationOrId) {
    // Get location object
    let location;
    if (locationOrId instanceof LocationModel) {
      location = locationOrId;
    } else {
      location = this.locations.find(loc => loc.id == locationOrId);
      if (!location) return;
    }
    
    // Set active location
    this.activeLocationId = location.id;
    
    // Display location details UI (to be implemented)
    console.log('Show details for location:', location);
    
    // This is where you would show your details panel
    // For now just a placeholder
    alert(`Details for ${location.name} would be shown here`);
  }
  
  closeLocationDetails() {
    // Clear active location
    this.activeLocationId = null;
    
    // Hide location details UI (to be implemented)
    console.log('Close location details');
  }
  
  filterLocations(filters = {}) {
    // Apply filters to locations and update markers
    let filteredLocations = [...this.locations];
    
    // Filter by priority
    if (filters.priority) {
      filteredLocations = filteredLocations.filter(loc => 
        loc.priority === filters.priority
      );
    }
    
    // Filter by continent
    if (filters.continent) {
      filteredLocations = filteredLocations.filter(loc => 
        loc.continent === filters.continent
      );
    }
    
    // Filter by trip type
    if (filters.tripType) {
      filteredLocations = filteredLocations.filter(loc => 
        loc.tripType.includes(filters.tripType)
      );
    }
    
    // Filter by visit status
    if (filters.visitStatus) {
      filteredLocations = filteredLocations.filter(loc => 
        loc.visitStatus === filters.visitStatus
      );
    }
    
    // Update markers visibility
    this.locations.forEach(location => {
      const marker = this.markers[location.id];
      if (!marker) return;
      
      if (filteredLocations.some(loc => loc.id === location.id)) {
        // Show marker if it's in filtered locations
        if (!this.map.hasLayer(marker)) {
          marker.addTo(this.map);
        }
      } else {
        // Hide marker if it's not in filtered locations
        if (this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      }
    });
    
    return filteredLocations;
  }
  
  async handleImportExport(action, data) {
    if (action === 'export') {
      // Export all locations as JSON
      return await this.storageService.exportData();
    } else if (action === 'import') {
      // Import locations from JSON
      await this.storageService.importData(data);
      
      // Reload locations and render markers
      await this.loadLocations();
      this.renderMarkers();
      
      return this.locations;
    }
  }
  
  setupEventListeners() {
    // This method will set up all necessary event listeners
    // You'll implement this based on your specific UI elements
    console.log('Event listeners set up');
  }
}

export default TravelWishlistApp;