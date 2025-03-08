// storage-service.js
import LocationModel from './location-model.js';

// Base Storage class that defines the interface
class StorageBase {
  async getAllLocations() { throw new Error('Method not implemented'); }
  async getLocation(id) { throw new Error('Method not implemented'); }
  async saveLocation(location) { throw new Error('Method not implemented'); }
  async deleteLocation(id) { throw new Error('Method not implemented'); }
  async importData(jsonData) { throw new Error('Method not implemented'); }
  async exportData() { throw new Error('Method not implemented'); }
}

// Local Storage implementation
class LocalStorageService extends StorageBase {
  constructor() {
    super();
    this.STORAGE_KEY = 'travelWishlistLocations';
  }

  async getAllLocations() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    try {
      const parsed = JSON.parse(data);
      // Convert plain objects to LocationModel instances
      return parsed.map(item => new LocationModel(item));
    } catch (e) {
      console.error('Error parsing locations from localStorage', e);
      return [];
    }
  }

  async getLocation(id) {
    const locations = await this.getAllLocations();
    const location = locations.find(loc => loc.id == id);
    return location ? new LocationModel(location) : null;
  }

  async saveLocation(location) {
    if (!(location instanceof LocationModel)) {
      location = new LocationModel(location);
    }
    
    const locations = await this.getAllLocations();
    const index = locations.findIndex(loc => loc.id == location.id);
    
    if (index >= 0) {
      // Update existing location
      locations[index] = location;
    } else {
      // Add new location
      locations.push(location);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locations));
    return location;
  }

  async deleteLocation(id) {
    const locations = await this.getAllLocations();
    const filteredLocations = locations.filter(loc => loc.id != id);
    
    if (filteredLocations.length < locations.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredLocations));
      return true;
    }
    return false;
  }

  async importData(jsonData) {
    try {
      let data;
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }
      
      // Convert all items to LocationModel objects
      const locations = data.map(item => new LocationModel(item));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locations));
      return locations;
    } catch (e) {
      console.error('Error importing data', e);
      throw new Error('Invalid data format');
    }
  }

  async exportData() {
    const locations = await this.getAllLocations();
    return JSON.stringify(locations);
  }

  // Convert old data format to new format
  async migrateFromOldFormat() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    try {
      const oldLocations = JSON.parse(data);
      const newLocations = oldLocations.map(loc => 
        LocationModel.convertFromOldFormat(loc)
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newLocations));
      return newLocations;
    } catch (e) {
      console.error('Error migrating data', e);
      return [];
    }
  }
}

// Firebase implementation (placeholder - you'll need to implement this when ready)
class FirebaseStorageService extends StorageBase {
  constructor(firebaseConfig) {
    super();
    // Initialize Firebase when you're ready to implement this
    // this.firebase = initializeApp(firebaseConfig);
    // this.db = getFirestore(this.firebase);
    // this.locationsRef = collection(this.db, 'locations');
  }

  // Implement Firebase methods when you're ready to add collaboration features
  // These are just stubs for now
  async getAllLocations() {
    // const snapshot = await getDocs(this.locationsRef);
    // return snapshot.docs.map(doc => new LocationModel({id: doc.id, ...doc.data()}));
    throw new Error('Firebase storage not yet implemented');
  }

  async getLocation(id) {
    // const docRef = doc(this.db, 'locations', id);
    // const docSnap = await getDoc(docRef);
    // return docSnap.exists() ? new LocationModel({id: docSnap.id, ...docSnap.data()}) : null;
    throw new Error('Firebase storage not yet implemented');
  }

  async saveLocation(location) {
    // Implement when ready
    throw new Error('Firebase storage not yet implemented');
  }

  async deleteLocation(id) {
    // Implement when ready
    throw new Error('Firebase storage not yet implemented');
  }

  async importData(jsonData) {
    // Implement when ready
    throw new Error('Firebase storage not yet implemented');
  }

  async exportData() {
    // Implement when ready
    throw new Error('Firebase storage not yet implemented');
  }
}

// Factory to create the appropriate storage service
class StorageServiceFactory {
  static getStorageService(type = 'localStorage', config = {}) {
    switch (type.toLowerCase()) {
      case 'localstorage':
        return new LocalStorageService();
      case 'firebase':
        return new FirebaseStorageService(config);
      default:
        return new LocalStorageService();
    }
  }
}

export default StorageServiceFactory;