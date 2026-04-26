export function extractFilterOptions(restaurants) {
    const cities = new Set();
    const companies = new Set();
  
    restaurants.forEach(r => {
      if (r.city) cities.add(r.city);
      if (r.company) companies.add(r.company);
    });
  
    return {
      cities: Array.from(cities).sort(),
      companies: Array.from(companies).sort()
    };
  }

export function populateFilters(cities, companies) {
    const citySelect = document.getElementById("city-filter");
    const companySelect = document.getElementById("company-filter");
  
    cities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  
    companies.forEach(company => {
      const option = document.createElement("option");
      option.value = company;
      option.textContent = company;
      companySelect.appendChild(option);
    });
  }


export function setupFilterEvents({
    allRestaurants,
    map,
    state,
    deps,
    filterRestaurants,
    updateUI
}) {
    const citySelect = document.getElementById("city-filter");
    const companySelect = document.getElementById("company-filter");
    const searchInput = document.getElementById("restaurant-search");

    function applyFilters() {
        const filters = {
        city: citySelect.value,
        company: companySelect.value,
        search: searchInput.value.trim()
        };

        const filtered = filterRestaurants(allRestaurants, filters);
        updateUI({
            filteredRestaurants: filtered,
            searchQuery: filters.search,
            map,
            state,
            deps
          });
    }

    citySelect.addEventListener("change", applyFilters);
    companySelect.addEventListener("change", applyFilters);
    
    let timeout;
    searchInput.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(applyFilters, 200);
    });
}