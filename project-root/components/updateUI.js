export async function updateUI({
    filteredRestaurants,
    searchQuery = "",
    map,
    state,
    deps
  }) {
  
    if (state.isUpdating) return;
    state.isUpdating = true;
  
    try {
      const user = deps.getUser();
  
      // Fade out existing markers
      await Promise.all(
        state.restaurantMarkers.map(m => deps.fadeOutMarker(m))
      );
  
      // Remove from map
      state.restaurantMarkers.forEach(m => {
        if (m && map.hasLayer(m)) {
          map.removeLayer(m);
        }
      });
  
      state.restaurantMarkers = [];
  
      if (!filteredRestaurants.length) {
        deps.renderRestaurantList([], map, null, searchQuery);
        return;
      }
  
      const nearest = deps.getNearest(filteredRestaurants);
  
      filteredRestaurants.forEach(r => {
        const icon = deps.getRestaurantIcon(
          r,
          user,
          nearest,
          deps.icons
        );
  
        const marker = deps.addRestaurantMarker(
          map,
          r,
          icon,
          (restaurant, latlng) => {
            // still handled in initMap (openRestaurant stays there)
            deps.onRestaurantClick(restaurant, latlng, nearest);
          },
          user,
          nearest
        );
  
        if (marker?._icon) {
          marker._icon.classList.add("marker-fade-in");
        }
  
        if (marker) {
          state.restaurantMarkers.push(marker);
        }
      });
  
      deps.renderRestaurantList(filteredRestaurants, map, nearest, searchQuery);
  
    } catch (err) {
      console.error("updateUI failed:", err);
      deps.showToast("Failed to update restaurants", "error");
    } finally {
      state.isUpdating = false;
    }
  }
  

  
export function fadeOutMarker(marker) {
return new Promise(resolve => {
    if (!marker?._icon) return resolve();

    const el = marker._icon;
    el.style.transition = "opacity 150ms ease";
    el.style.opacity = "0";

    setTimeout(resolve, 150);
});
}    



    // let allRestaurants = enriched;
    // let restaurantMarkers = [];
    // let isUpdating = false;

    /*

    async function updateUI(filteredRestaurants, searchQuery = "") {
        if (isUpdating) return;
        isUpdating = true; 

        try {

            const user = getUser();

            await Promise.all(
                restaurantMarkers.map(m => fadeOutMarker(m))
            );

            restaurantMarkers.forEach(m => {
                if (m && map.hasLayer(m)) {
                    map.removeLayer(m);
                }
            });

            restaurantMarkers = [];

            if (!filteredRestaurants.length) {
                renderRestaurantList([], map, null, searchQuery);
                return;
            }

            const nearest = getNearest(filteredRestaurants);
        
            filteredRestaurants.forEach(r => {
            const icon = getRestaurantIcon(r, user, nearest, {
                favourite: favouriteIcon,
                nearest: greenIcon
            });
        
            const marker = addRestaurantMarker(
                map,
                r,
                icon,
                (restaurant, latlng) => {
                openRestaurant(restaurant, latlng, map, nearest);
                },
                user,
                nearest
            );

            if (marker?._icon) {
                marker._icon.classList.add("marker-fade-in");
              }              
        
            if (marker) {
                restaurantMarkers.push(marker);
            }
            }); 
            renderRestaurantList(filteredRestaurants, map, nearest, searchQuery);
        } catch {
            console.error("updateUI failed: ", err)
            showToast("Failed to update restaurants", "error");
        } finally {
            isUpdating = false;
        }
    
      }
    
      
    function fadeOutMarker(marker) {
    return new Promise(resolve => {
        if (!marker?._icon) return resolve();
    
        const el = marker._icon;
        el.style.transition = "opacity 150ms ease";
        el.style.opacity = "0";
    
        setTimeout(resolve, 150);
    });
    }      
    */