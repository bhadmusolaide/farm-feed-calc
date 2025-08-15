// Breed images data - using actual images from public folder

export const BREED_IMAGES = {
  broiler: {
    'Arbor Acres': {
      image: '/ArborAcres.png',
      description: 'Fast-growing white broiler, excellent feed conversion'
    },
    'Ross 308': {
      image: '/Ross 308.webp',
      description: 'Industry-leading genetics, superior meat yield'
    },
    'Cobb 500': {
      image: '/Cobb500.jpg',
      description: 'Balanced performance, excellent livability'
    }
  },
  layer: {
    'ISA Brown': {
      image: '/Isa brown.jpg',
      description: 'Excellent egg production, docile temperament'
    },
    'Lohmann Brown': {
      image: '/Lohmann-brown.png',
      description: 'High egg production, robust health'
    },
    'Hy-Line Brown': {
      image: '/hy-line-brown.jpg',
      description: 'Consistent performance, excellent feed efficiency'
    }
  }
};

// Helper function to get breed image
export const getBreedImage = (birdType, breed) => {
  return BREED_IMAGES[birdType]?.[breed]?.image || null;
};

// Helper function to get breed description
export const getBreedDescription = (birdType, breed) => {
  return BREED_IMAGES[birdType]?.[breed]?.description || '';
};

// Helper function to get all breeds with images for a bird type
export const getBreedsWithImages = (birdType) => {
  const breeds = BREED_IMAGES[birdType] || {};
  return Object.keys(breeds).map(breed => ({
    name: breed,
    image: breeds[breed].image,
    description: breeds[breed].description
  }));
};