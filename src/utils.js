export const createSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') 
      .replace(/\s+/g, '-');    
  };