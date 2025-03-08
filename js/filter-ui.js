// filter-ui.js
class FilterUI {
  constructor(containerId, app) {
    this.container = document.getElementById(containerId);
    this.app = app;
    this.filters = {
      priority: null,
      continent: null,
      tripType: null,
      visitStatus: null
    };
    
    // Bind methods
    this.render = this.render.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleClearFilters = this.handleClearFilters.bind(this);
    
    // Initial render
    this.render();
  }
  
  render() {
    this.container.innerHTML = '';
    
    // Create header with title and clear button
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `
      <h2>Filter Locations</h2>
      <button id="clear-filters-btn" class="btn">Clear Filters</button>
    `;
    this.container.appendChild(header);
    
    // Create filter sections
    const content = document.createElement('div');
    content.className = 'panel-content';
    
    // Priority filter
    const priorityFilter = document.createElement('div');
    priorityFilter.className = 'filter-group';
    priorityFilter.innerHTML = `
      <h3>Priority</h3>
      <div class="filter-options" data-filter-type="priority">
        <div class="filter-option ${this.filters.priority === 'Bucket List' ? 'active' : ''}" data-value="Bucket List">Bucket List</div>
        <div class="filter-option ${this.filters.priority === 'Soon' ? 'active' : ''}" data-value="Soon">Soon</div>
        <div class="filter-option ${this.filters.priority === 'Someday' ? 'active' : ''}" data-value="Someday">Someday</div>
      </div>
    `;
    content.appendChild(priorityFilter);
    
    // Continent filter
    const continentFilter = document.createElement('div');
    continentFilter.className = 'filter-group';
    continentFilter.innerHTML = `
      <h3>Continent</h3>
      <div class="filter-options" data-filter-type="continent">
        <div class="filter-option ${this.filters.continent === 'Africa' ? 'active' : ''}" data-value="Africa">Africa</div>
        <div class="filter-option ${this.filters.continent === 'Asia' ? 'active' : ''}" data-value="Asia">Asia</div>
        <div class="filter-option ${this.filters.continent === 'Europe' ? 'active' : ''}" data-value="Europe">Europe</div>
        <div class="filter-option ${this.filters.continent === 'North America' ? 'active' : ''}" data-value="North America">North America</div>
        <div class="filter-option ${this.filters.continent === 'South America' ? 'active' : ''}" data-value="South America">South America</div>
        <div class="filter-option ${this.filters.continent === 'Oceania' ? 'active' : ''}" data-value="Oceania">Oceania</div>
        <div class="filter-option ${this.filters.continent === 'Antarctica' ? 'active' : ''}" data-value="Antarctica">Antarctica</div>
      </div>
    `;
    content.appendChild(continentFilter);
    
    // Trip type filter
    const tripTypeFilter = document.createElement('div');
    tripTypeFilter.className = 'filter-group';
    tripTypeFilter.innerHTML = `
      <h3>Trip Type</h3>
      <div class="filter-options" data-filter-type="tripType">
        <div class="filter-option ${this.filters.tripType === 'beach' ? 'active' : ''}" data-value="beach">Beach</div>
        <div class="filter-option ${this.filters.tripType === 'city' ? 'active' : ''}" data-value="city">City</div>
        <div class="filter-option ${this.filters.tripType === 'cultural' ? 'active' : ''}" data-value="cultural">Cultural</div>
        <div class="filter-option ${this.filters.tripType === 'food' ? 'active' : ''}" data-value="food">Food</div>
        <div class="filter-option ${this.filters.tripType === 'historical' ? 'active' : ''}" data-value="historical">Historical</div>
        <div class="filter-option ${this.filters.tripType === 'mountains' ? 'active' : ''}" data-value="mountains">Mountains</div>
        <div class="filter-option ${this.filters.tripType === 'nature' ? 'active' : ''}" data-value="nature">Nature</div>
        <div class="filter-option ${this.filters.tripType === 'relaxation' ? 'active' : ''}" data-value="relaxation">Relaxation</div>
        <div class="filter-option ${this.filters.tripType === 'romantic' ? 'active' : ''}" data-value="romantic">Romantic</div>
        <div class="filter-option ${this.filters.tripType === 'adventure' ? 'active' : ''}" data-value="adventure">Adventure</div>
      </div>
    `;
    content.appendChild(tripTypeFilter);
    
    // Visit status filter
    const visitStatusFilter = document.createElement('div');
    visitStatusFilter.className = 'filter-group';
    visitStatusFilter.innerHTML = `
      <h3>Visit Status</h3>
      <div class="filter-options" data-filter-type="visitStatus">
        <div class="filter-option ${this.filters.visitStatus === 'not visited' ? 'active' : ''}" data-value="not visited">Not Visited</div>
        <div class="filter-option ${this.filters.visitStatus === 'planned' ? 'active' : ''}" data-value="planned">Planned</div>
        <div class="filter-option ${this.filters.visitStatus === 'visited' ? 'active' : ''}" data-value="visited">Visited</div>
      </div>
    `;
    content.appendChild(visitStatusFilter);
    
    // Filter stats
    const filterStats = document.createElement('div');
    filterStats.className = 'filter-stats';
    filterStats.innerHTML = `
      <p>Showing <span id="filtered-count">all</span> locations</p>
    `;
    content.appendChild(filterStats);
    
    this.container.appendChild(content);
    
    // Add event listeners
    document.getElementById('clear-filters-btn').addEventListener('click', this.handleClearFilters);
    
    // Add click event listeners to all filter options
    const filterOptions = this.container.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
      option.addEventListener('click', () => {
        const filterType = option.parentElement.dataset.filterType;
        const value = option.dataset.value;
        this.handleFilterChange(filterType, value);
      });
    });
    
    // Update filter stats
    this.updateFilterStats();
  }
  
  handleFilterChange(filterType, value) {
    // If the same filter value is clicked, toggle it off
    if (this.filters[filterType] === value) {
      this.filters[filterType] = null;
    } else {
      this.filters[filterType] = value;
    }
    
    // Apply filters
    const filteredLocations = this.app.filterLocations(this.filters);
    
    // Update UI
    this.render();
    
    // Update filter stats
    this.updateFilterStats(filteredLocations);
  }
  
  handleClearFilters() {
    // Reset all filters
    this.filters = {
      priority: null,
      continent: null,
      tripType: null,
      visitStatus: null
    };
    
    // Apply filters (show all)
    this.app.filterLocations(this.filters);
    
    // Update UI
    this.render();
    
    // Update filter stats
    this.updateFilterStats();
  }
  
  updateFilterStats(filteredLocations) {
    const filteredCount = document.getElementById('filtered-count');
    
    if (!filteredCount) return;
    
    if (!filteredLocations) {
      filteredLocations = this.app.locations;
    }
    
    // Update filter stats
    if (Object.values(this.filters).every(value => value === null)) {
      filteredCount.textContent = 'all';
    } else {
      filteredCount.textContent = `${filteredLocations.length} of ${this.app.locations.length}`;
    }
  }
}

export default FilterUI;