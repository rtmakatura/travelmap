// location-details.js
import LocationModel from './location-model.js';

class LocationDetailsUI {
  constructor(containerId, app) {
    this.container = document.getElementById(containerId);
    this.app = app;
    this.location = null;
    this.isEditing = false;
    
    // Bind methods
    this.render = this.render.bind(this);
    this.renderViewMode = this.renderViewMode.bind(this);
    this.renderEditMode = this.renderEditMode.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.collectFormData = this.collectFormData.bind(this);
  }
  
  show(location) {
    this.location = location;
    this.isEditing = !location.id; // If new location, start in edit mode
    this.render();
    this.container.classList.remove('hidden');
  }
  
  hide() {
    this.container.classList.add('hidden');
    this.location = null;
  }
  
  render() {
    if (!this.location) return;
    
    this.container.innerHTML = '';
    
    if (this.isEditing) {
      this.renderEditMode();
    } else {
      this.renderViewMode();
    }
  }
  
  renderViewMode() {
    const loc = this.location;
    
    // Create header with location name and buttons
    const header = document.createElement('div');
    header.className = 'details-header';
    header.innerHTML = `
      <h2>${loc.name}</h2>
      <div class="details-actions">
        <button id="edit-location-btn" class="btn">Edit</button>
        <button id="delete-location-btn" class="btn btn-danger">Delete</button>
      </div>
    `;
    this.container.appendChild(header);
    
    // Create details content with tabs
    const content = document.createElement('div');
    content.className = 'details-content';
    
    // Create tabs navigation
    const tabsNav = document.createElement('div');
    tabsNav.className = 'tabs-nav';
    tabsNav.innerHTML = `
      <button class="tab-btn active" data-tab="overview">Overview</button>
      <button class="tab-btn" data-tab="planning">Planning</button>
      <button class="tab-btn" data-tab="budget">Budget</button>
      <button class="tab-btn" data-tab="inspiration">Inspiration</button>
      ${loc.visitStatus === 'visited' ? '<button class="tab-btn" data-tab="memories">Memories</button>' : ''}
    `;
    content.appendChild(tabsNav);
    
    // Create tab content
    const tabsContent = document.createElement('div');
    tabsContent.className = 'tabs-content';
    
    // Overview tab
    const overviewTab = document.createElement('div');
    overviewTab.className = 'tab-content active';
    overviewTab.dataset.tab = 'overview';
    overviewTab.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${loc.country ? loc.country : ''} ${loc.continent ? `(${loc.continent})` : ''}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Priority:</span>
        <span class="detail-value priority-tag priority-${loc.priority.toLowerCase().replace(' ', '-')}">${loc.priority}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status:</span>
        <span class="detail-value status-tag status-${loc.visitStatus.replace(' ', '-')}">${loc.visitStatus}</span>
      </div>
      ${loc.visitDate ? `
        <div class="detail-item">
          <span class="detail-label">Visit Date:</span>
          <span class="detail-value">${loc.visitDate}</span>
        </div>
      ` : ''}
      <div class="detail-item">
        <span class="detail-label">Trip Type:</span>
        <span class="detail-value">${loc.tripType.map(type => `<span class="tag">${type}</span>`).join(' ')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Notes:</span>
        <div class="detail-value notes">${loc.notes}</div>
      </div>
    `;
    tabsContent.appendChild(overviewTab);
    
    // Planning tab
    const planningTab = document.createElement('div');
    planningTab.className = 'tab-content';
    planningTab.dataset.tab = 'planning';
    planningTab.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Best Time to Visit:</span>
        <span class="detail-value">${loc.bestTimeToVisit.join(', ') || 'Not specified'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Must-See Places:</span>
        <ul class="detail-list">
          ${loc.mustSee.map(place => `<li>${place}</li>`).join('') || '<li>No places added yet</li>'}
        </ul>
      </div>
      <div class="detail-item">
        <span class="detail-label">Restaurant Recommendations:</span>
        <ul class="detail-list">
          ${loc.restaurants.map(restaurant => `<li>${restaurant}</li>`).join('') || '<li>No restaurants added yet</li>'}
        </ul>
      </div>
    `;
    tabsContent.appendChild(planningTab);
    
    // Budget tab
    const budgetTab = document.createElement('div');
    budgetTab.className = 'tab-content';
    budgetTab.dataset.tab = 'budget';
    
    // Calculate total budget
    const budget = loc.budget;
    const totalEstimated = budget.total.estimated;
    const totalActual = budget.total.actual;
    
    budgetTab.innerHTML = `
      <div class="budget-summary">
        <h3>Budget Summary</h3>
        <div class="budget-total">
          <span class="budget-label">Total Estimated:</span>
          <span class="budget-value">$${totalEstimated.toLocaleString()}</span>
        </div>
        ${totalActual !== null ? `
          <div class="budget-total">
            <span class="budget-label">Total Actual:</span>
            <span class="budget-value">$${totalActual.toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="budget-details">
        <h3>Budget Breakdown</h3>
        <table class="budget-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Estimated</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            ${['flight', 'accommodation', 'activities', 'food', 'misc'].map(category => `
              <tr>
                <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                <td>$${budget[category].estimated.toLocaleString()}</td>
                <td>${budget[category].actual !== null ? '$' + budget[category].actual.toLocaleString() : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    tabsContent.appendChild(budgetTab);
    
    // Inspiration tab
    const inspirationTab = document.createElement('div');
    inspirationTab.className = 'tab-content';
    inspirationTab.dataset.tab = 'inspiration';
    inspirationTab.innerHTML = `
      <div class="inspiration-links">
        <h3>Inspiration Links</h3>
        ${loc.inspirationLinks.length > 0 ? `
          <ul class="links-list">
            ${loc.inspirationLinks.map(link => `
              <li><a href="${link}" target="_blank">${new URL(link).hostname}</a></li>
            `).join('')}
          </ul>
        ` : '<p>No inspiration links added yet</p>'}
      </div>
      
      <div class="inspiration-photos">
        <h3>Mood Board</h3>
        ${loc.photos.length > 0 ? `
          <div class="photo-grid">
            ${loc.photos.map(photo => `
              <div class="photo-item">
                <img src="${photo.url}" alt="${photo.caption || loc.name}" />
                ${photo.caption ? `<div class="photo-caption">${photo.caption}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p>No photos added yet</p>'}
      </div>
    `;
    tabsContent.appendChild(inspirationTab);
    
    // Memories tab (only if visited)
    if (loc.visitStatus === 'visited') {
      const memoriesTab = document.createElement('div');
      memoriesTab.className = 'tab-content';
      memoriesTab.dataset.tab = 'memories';
      memoriesTab.innerHTML = `
        <div class="memories-content">
          <h3>Visit Memories</h3>
          <div class="visit-details">
            <p><strong>Date Visited:</strong> ${loc.visitDate || 'Date not specified'}</p>
          </div>
          
          <div class="memory-photos">
            <h3>Photos</h3>
            ${loc.photos.length > 0 ? `
              <div class="photo-grid">
                ${loc.photos.map(photo => `
                  <div class="photo-item">
                    <img src="${photo.url}" alt="${photo.caption || loc.name}" />
                    ${photo.caption ? `<div class="photo-caption">${photo.caption}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : '<p>No photos added yet</p>'}
          </div>
        </div>
      `;
      tabsContent.appendChild(memoriesTab);
    }
    
    content.appendChild(tabsContent);
    this.container.appendChild(content);
    
    // Add event listeners
    document.getElementById('edit-location-btn').addEventListener('click', this.handleEditClick);
    document.getElementById('delete-location-btn').addEventListener('click', this.handleDeleteClick);
    
    // Tab navigation event listeners
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        this.container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        const tabName = btn.dataset.tab;
        this.container.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
      });
    });
  }
  
  renderEditMode() {
    const loc = this.location;
    
    // Create header with form title
    const header = document.createElement('div');
    header.className = 'details-header';
    header.innerHTML = `
      <h2>${loc.id ? 'Edit' : 'New'} Location</h2>
      <div class="details-actions">
        <button id="save-location-btn" class="btn btn-primary">Save</button>
        <button id="cancel-edit-btn" class="btn">Cancel</button>
      </div>
    `;
    this.container.appendChild(header);
    
    // Create form
    const form = document.createElement('form');
    form.id = 'location-form';
    form.className = 'location-form';
    
    // Basic Information
    form.innerHTML = `
      <div class="form-section">
        <h3>Basic Information</h3>
        
        <div class="form-group">
          <label for="location-name">Location Name</label>
          <input type="text" id="location-name" name="name" value="${loc.name || ''}" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="location-country">Country</label>
            <input type="text" id="location-country" name="country" value="${loc.country || ''}">
          </div>
          
          <div class="form-group">
            <label for="location-continent">Continent</label>
            <select id="location-continent" name="continent">
              <option value="">-- Select Continent --</option>
              <option value="Africa" ${loc.continent === 'Africa' ? 'selected' : ''}>Africa</option>
              <option value="Asia" ${loc.continent === 'Asia' ? 'selected' : ''}>Asia</option>
              <option value="Europe" ${loc.continent === 'Europe' ? 'selected' : ''}>Europe</option>
              <option value="North America" ${loc.continent === 'North America' ? 'selected' : ''}>North America</option>
              <option value="South America" ${loc.continent === 'South America' ? 'selected' : ''}>South America</option>
              <option value="Oceania" ${loc.continent === 'Oceania' ? 'selected' : ''}>Oceania</option>
              <option value="Antarctica" ${loc.continent === 'Antarctica' ? 'selected' : ''}>Antarctica</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="location-priority">Priority</label>
          <select id="location-priority" name="priority">
            <option value="Bucket List" ${loc.priority === 'Bucket List' ? 'selected' : ''}>Bucket List</option>
            <option value="Soon" ${loc.priority === 'Soon' ? 'selected' : ''}>Soon</option>
            <option value="Someday" ${loc.priority === 'Someday' ? 'selected' : ''}>Someday</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="location-status">Visit Status</label>
          <select id="location-status" name="visitStatus">
            <option value="not visited" ${loc.visitStatus === 'not visited' ? 'selected' : ''}>Not Visited</option>
            <option value="planned" ${loc.visitStatus === 'planned' ? 'selected' : ''}>Planned</option>
            <option value="visited" ${loc.visitStatus === 'visited' ? 'selected' : ''}>Visited</option>
          </select>
        </div>
        
        <div class="form-group ${loc.visitStatus !== 'visited' ? 'hidden' : ''}" id="visit-date-group">
          <label for="location-visit-date">Visit Date</label>
          <input type="date" id="location-visit-date" name="visitDate" value="${loc.visitDate || ''}">
        </div>
        
        <div class="form-group">
          <label for="location-trip-type">Trip Type (select multiple)</label>
          <select id="location-trip-type" name="tripType" multiple>
            <option value="beach" ${loc.tripType.includes('beach') ? 'selected' : ''}>Beach</option>
            <option value="city" ${loc.tripType.includes('city') ? 'selected' : ''}>City</option>
            <option value="cultural" ${loc.tripType.includes('cultural') ? 'selected' : ''}>Cultural</option>
            <option value="food" ${loc.tripType.includes('food') ? 'selected' : ''}>Food</option>
            <option value="historical" ${loc.tripType.includes('historical') ? 'selected' : ''}>Historical</option>
            <option value="mountains" ${loc.tripType.includes('mountains') ? 'selected' : ''}>Mountains</option>
            <option value="nature" ${loc.tripType.includes('nature') ? 'selected' : ''}>Nature</option>
            <option value="relaxation" ${loc.tripType.includes('relaxation') ? 'selected' : ''}>Relaxation</option>
            <option value="romantic" ${loc.tripType.includes('romantic') ? 'selected' : ''}>Romantic</option>
            <option value="adventure" ${loc.tripType.includes('adventure') ? 'selected' : ''}>Adventure</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="location-notes">Notes</label>
          <textarea id="location-notes" name="notes" rows="3">${loc.notes || ''}</textarea>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Trip Planning</h3>
        
        <div class="form-group">
          <label for="location-best-time">Best Time to Visit (comma separated)</label>
          <input type="text" id="location-best-time" name="bestTimeToVisit" value="${loc.bestTimeToVisit.join(', ')}">
        </div>
        
        <div class="form-group">
          <label for="location-must-see">Must-See Places (one per line)</label>
          <textarea id="location-must-see" name="mustSee" rows="3">${loc.mustSee.join('\n')}</textarea>
        </div>
        
        <div class="form-group">
          <label for="location-restaurants">Restaurant Recommendations (one per line)</label>
          <textarea id="location-restaurants" name="restaurants" rows="3">${loc.restaurants.join('\n')}</textarea>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Budget</h3>
        
        <div class="budget-form">
          <div class="form-row">
            <div class="form-group">
              <label for="budget-flight">Flight</label>
              <input type="number" id="budget-flight" name="budget.flight.estimated" min="0" value="${loc.budget.flight.estimated}">
            </div>
            <div class="form-group">
              <label for="budget-flight-actual">Actual (if known)</label>
              <input type="number" id="budget-flight-actual" name="budget.flight.actual" min="0" value="${loc.budget.flight.actual !== null ? loc.budget.flight.actual : ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="budget-accommodation">Accommodation</label>
              <input type="number" id="budget-accommodation" name="budget.accommodation.estimated" min="0" value="${loc.budget.accommodation.estimated}">
            </div>
            <div class="form-group">
              <label for="budget-accommodation-actual">Actual (if known)</label>
              <input type="number" id="budget-accommodation-actual" name="budget.accommodation.actual" min="0" value="${loc.budget.accommodation.actual !== null ? loc.budget.accommodation.actual : ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="budget-activities">Activities</label>
              <input type="number" id="budget-activities" name="budget.activities.estimated" min="0" value="${loc.budget.activities.estimated}">
            </div>
            <div class="form-group">
              <label for="budget-activities-actual">Actual (if known)</label>
              <input type="number" id="budget-activities-actual" name="budget.activities.actual" min="0" value="${loc.budget.activities.actual !== null ? loc.budget.activities.actual : ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="budget-food">Food</label>
              <input type="number" id="budget-food" name="budget.food.estimated" min="0" value="${loc.budget.food.estimated}">
            </div>
            <div class="form-group">
              <label for="budget-food-actual">Actual (if known)</label>
              <input type="number" id="budget-food-actual" name="budget.food.actual" min="0" value="${loc.budget.food.actual !== null ? loc.budget.food.actual : ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="budget-misc">Miscellaneous</label>
              <input type="number" id="budget-misc" name="budget.misc.estimated" min="0" value="${loc.budget.misc.estimated}">
            </div>
            <div class="form-group">
              <label for="budget-misc-actual">Actual (if known)</label>
              <input type="number" id="budget-misc-actual" name="budget.misc.actual" min="0" value="${loc.budget.misc.actual !== null ? loc.budget.misc.actual : ''}">
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Inspiration & Photos</h3>
        
        <div class="form-group">
          <label for="location-inspiration-links">Inspiration Links (one per line)</label>
          <textarea id="location-inspiration-links" name="inspirationLinks" rows="3">${loc.inspirationLinks.join('\n')}</textarea>
        </div>
        
        <div class="form-group">
          <p><strong>Photos</strong></p>
          <p class="form-note">Photo management will be added in a future version</p>
        </div>
      </div>
    `;
    
    this.container.appendChild(form);
    
    // Add event listeners
    document.getElementById('save-location-btn').addEventListener('click', this.handleSaveClick);
    document.getElementById('cancel-edit-btn').addEventListener('click', this.handleCancelClick);
    
    // Show/hide visit date field based on status
    const statusSelect = document.getElementById('location-status');
    const visitDateGroup = document.getElementById('visit-date-group');
    
    statusSelect.addEventListener('change', () => {
      if (statusSelect.value === 'visited') {
        visitDateGroup.classList.remove('hidden');
      } else {
        visitDateGroup.classList.add('hidden');
      }
    });
  }
  
  handleEditClick() {
    this.isEditing = true;
    this.render();
  }
  
  async handleSaveClick(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = this.collectFormData();
    
    // Update location
    const updatedLocation = new LocationModel({
      ...this.location,
      ...formData
    });
    
    // Save location
    await this.app.saveLocation(updatedLocation);
    
    // Update instance location and switch to view mode
    this.location = updatedLocation;
    this.isEditing = false;
    this.render();
  }
  
  handleCancelClick() {
    if (!this.location.id) {
      // If new location, hide panel
      this.hide();
    } else {
      // If existing location, switch to view mode
      this.isEditing = false;
      this.render();
    }
  }
  
  async handleDeleteClick() {
    if (confirm(`Are you sure you want to delete "${this.location.name}"?`)) {
      await this.app.deleteLocation(this.location.id);
      this.hide();
    }
  }
  
  collectFormData() {
    const form = document.getElementById('location-form');
    const formData = {};
    
    // Basic fields
    formData.name = form.querySelector('[name="name"]').value;
    formData.country = form.querySelector('[name="country"]').value;
    formData.continent = form.querySelector('[name="continent"]').value;
    formData.priority = form.querySelector('[name="priority"]').value;
    formData.visitStatus = form.querySelector('[name="visitStatus"]').value;
    formData.visitDate = form.querySelector('[name="visitDate"]').value || null;
    formData.notes = form.querySelector('[name="notes"]').value;
    
    // Trip type (multi-select)
    const tripTypeSelect = form.querySelector('[name="tripType"]');
    formData.tripType = Array.from(tripTypeSelect.selectedOptions).map(option => option.value);
    
    // Lists (split by line)
    formData.bestTimeToVisit = form.querySelector('[name="bestTimeToVisit"]').value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    
    formData.mustSee = form.querySelector('[name="mustSee"]').value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
    
    formData.restaurants = form.querySelector('[name="restaurants"]').value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
    
    formData.inspirationLinks = form.querySelector('[name="inspirationLinks"]').value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
    
    // Budget
    formData.budget = {
      flight: {
        estimated: parseInt(form.querySelector('[name="budget.flight.estimated"]').value) || 0,
        actual: form.querySelector('[name="budget.flight.actual"]').value ? 
          parseInt(form.querySelector('[name="budget.flight.actual"]').value) : null
      },
      accommodation: {
        estimated: parseInt(form.querySelector('[name="budget.accommodation.estimated"]').value) || 0,
        actual: form.querySelector('[name="budget.accommodation.actual"]').value ? 
          parseInt(form.querySelector('[name="budget.accommodation.actual"]').value) : null
      },
      activities: {
        estimated: parseInt(form.querySelector('[name="budget.activities.estimated"]').value) || 0,
        actual: form.querySelector('[name="budget.activities.actual"]').value ? 
          parseInt(form.querySelector('[name="budget.activities.actual"]').value) : null
      },
      food: {
        estimated: parseInt(form.querySelector('[name="budget.food.estimated"]').value) || 0,
        actual: form.querySelector('[name="budget.food.actual"]').value ? 
          parseInt(form.querySelector('[name="budget.food.actual"]').value) : null
      },
      misc: {
        estimated: parseInt(form.querySelector('[name="budget.misc.estimated"]').value) || 0,
        actual: form.querySelector('[name="budget.misc.actual"]').value ? 
          parseInt(form.querySelector('[name="budget.misc.actual"]').value) : null
      },
      total: {
        estimated: 0,
        actual: null
      }
    };
    
    return formData;
  }
}

export default LocationDetailsUI;