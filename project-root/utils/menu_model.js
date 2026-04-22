export function parseCourses(menuResponse) {
    if (!menuResponse?.courses) return [];
  
    return Object.entries(menuResponse.courses).map(([, course]) => ({
      name: course.name,
      price: course.price,
      diets: course.diets || []
    }));
  }
  

  export function parseWeeklyCourses(data) {
    if (!data || !Array.isArray(data.days)) return [];
  
    return data.days.map((day) => {
      return {
        date: day.date || "Unknown date",
        courses: (day.courses || []).map((course) => ({
          name: course.name || "No name",
          price: course.price || "",
          diets: course.diets || "",
        })),
      };
    });
  }
  