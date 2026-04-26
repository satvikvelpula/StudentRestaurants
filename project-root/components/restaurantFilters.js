export function filterRestaurants(allRestaurants, filters) { // filters is filter input box values (citySelect.value, companySelect.value)
    if (!Array.isArray(allRestaurants)) return [];
    return allRestaurants.filter(r => {
        if (!r) return false;
        const matchCity =
            !filters.city || r.city === filters.city;
    
        const matchCompany =
            !filters.company || r.company === filters.company;

        const matchSearch = !filters.search || r.name.toLowerCase().includes(filters.search.toLowerCase());
    
        return matchCity && matchCompany && matchSearch;
    });
  }