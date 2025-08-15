// Shared breed images data - using SVG for scalable, lightweight images
// This is the same data structure as the web version for consistency

export const BREED_IMAGES = {
  broiler: {
    'Arbor Acres': {
      image: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Arbor Acres - White broiler with robust build -->
        <defs>
          <radialGradient id="arborBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="70%" stop-color="#f8f8f8"/>
            <stop offset="100%" stop-color="#e8e8e8"/>
          </radialGradient>
          <radialGradient id="arborHead" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f0f0f0"/>
          </radialGradient>
        </defs>
        
        <!-- Body -->
        <ellipse cx="100" cy="120" rx="55" ry="45" fill="url(#arborBody)" stroke="#ddd" stroke-width="1"/>
        
        <!-- Head -->
        <circle cx="100" cy="70" r="25" fill="url(#arborHead)" stroke="#ddd" stroke-width="1"/>
        
        <!-- Comb -->
        <path d="M85 55 Q90 45 95 55 Q100 45 105 55 Q110 45 115 55" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
        
        <!-- Beak -->
        <path d="M85 75 L75 78 L85 81 Z" fill="#fbbf24"/>
        
        <!-- Eyes -->
        <circle cx="90" cy="68" r="3" fill="#1f2937"/>
        <circle cx="91" cy="67" r="1" fill="#ffffff"/>
        
        <!-- Wattles -->
        <ellipse cx="88" cy="82" rx="4" ry="6" fill="#dc2626"/>
        
        <!-- Legs -->
        <rect x="85" y="160" width="4" height="25" fill="#fbbf24"/>
        <rect x="111" y="160" width="4" height="25" fill="#fbbf24"/>
        
        <!-- Feet -->
        <path d="M80 185 L85 180 L90 185 M85 180 L85 190" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <path d="M106 185 L111 180 L116 185 M111 180 L111 190" stroke="#fbbf24" stroke-width="2" fill="none"/>
        
        <!-- Wing detail -->
        <path d="M65 110 Q80 100 95 110 Q80 120 65 110" fill="#f0f0f0" stroke="#ddd" stroke-width="1"/>
        
        <!-- Tail feathers -->
        <path d="M145 100 Q160 90 155 110 Q150 120 145 100" fill="#f8f8f8" stroke="#ddd" stroke-width="1"/>
      </svg>`,
      description: 'Fast-growing white broiler, excellent feed conversion'
    },
    'Ross 308': {
      image: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Ross 308 - Premium white broiler with compact build -->
        <defs>
          <radialGradient id="rossBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="70%" stop-color="#f9f9f9"/>
            <stop offset="100%" stop-color="#eeeeee"/>
          </radialGradient>
          <radialGradient id="rossHead" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f5f5f5"/>
          </radialGradient>
        </defs>
        
        <!-- Body - slightly more compact -->
        <ellipse cx="100" cy="125" rx="50" ry="42" fill="url(#rossBody)" stroke="#ddd" stroke-width="1"/>
        
        <!-- Head -->
        <circle cx="100" cy="75" r="23" fill="url(#rossHead)" stroke="#ddd" stroke-width="1"/>
        
        <!-- Comb - more prominent -->
        <path d="M83 58 Q88 48 93 58 Q98 48 103 58 Q108 48 113 58 Q118 48 123 58" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
        
        <!-- Beak -->
        <path d="M85 78 L75 81 L85 84 Z" fill="#fbbf24"/>
        
        <!-- Eyes -->
        <circle cx="90" cy="71" r="3" fill="#1f2937"/>
        <circle cx="91" cy="70" r="1" fill="#ffffff"/>
        
        <!-- Wattles - larger -->
        <ellipse cx="87" cy="85" rx="5" ry="7" fill="#dc2626"/>
        
        <!-- Legs -->
        <rect x="87" y="162" width="4" height="23" fill="#fbbf24"/>
        <rect x="109" y="162" width="4" height="23" fill="#fbbf24"/>
        
        <!-- Feet -->
        <path d="M82 185 L87 180 L92 185 M87 180 L87 190" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <path d="M104 185 L109 180 L114 185 M109 180 L109 190" stroke="#fbbf24" stroke-width="2" fill="none"/>
        
        <!-- Wing detail -->
        <path d="M68 115 Q83 105 98 115 Q83 125 68 115" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
        
        <!-- Tail feathers -->
        <path d="M142 105 Q157 95 152 115 Q147 125 142 105" fill="#f9f9f9" stroke="#ddd" stroke-width="1"/>
        
        <!-- Breast muscle definition -->
        <ellipse cx="100" cy="115" rx="25" ry="15" fill="none" stroke="#e5e5e5" stroke-width="1" opacity="0.7"/>
      </svg>`,
      description: 'Industry-leading genetics, superior meat yield'
    },
    'Cobb 500': {
      image: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Cobb 500 - Efficient white broiler with balanced build -->
        <defs>
          <radialGradient id="cobbBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="70%" stop-color="#f7f7f7"/>
            <stop offset="100%" stop-color="#e9e9e9"/>
          </radialGradient>
          <radialGradient id="cobbHead" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f2f2f2"/>
          </radialGradient>
        </defs>
        
        <!-- Body -->
        <ellipse cx="100" cy="122" rx="52" ry="43" fill="url(#cobbBody)" stroke="#ddd" stroke-width="1"/>
        
        <!-- Head -->
        <circle cx="100" cy="72" r="24" fill="url(#cobbHead)" stroke="#ddd" stroke-width="1"/>
        
        <!-- Comb -->
        <path d="M84 56 Q89 46 94 56 Q99 46 104 56 Q109 46 114 56 Q119 46 124 56" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
        
        <!-- Beak -->
        <path d="M85 76 L75 79 L85 82 Z" fill="#fbbf24"/>
        
        <!-- Eyes -->
        <circle cx="90" cy="69" r="3" fill="#1f2937"/>
        <circle cx="91" cy="68" r="1" fill="#ffffff"/>
        
        <!-- Wattles -->
        <ellipse cx="88" cy="83" rx="4.5" ry="6.5" fill="#dc2626"/>
        
        <!-- Legs -->
        <rect x="86" y="161" width="4" height="24" fill="#fbbf24"/>
        <rect x="110" y="161" width="4" height="24" fill="#fbbf24"/>
        
        <!-- Feet -->
        <path d="M81 185 L86 180 L91 185 M86 180 L86 190" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <path d="M105 185 L110 180 L115 185 M110 180 L110 190" stroke="#fbbf24" stroke-width="2" fill="none"/>
        
        <!-- Wing detail -->
        <path d="M66 112 Q81 102 96 112 Q81 122 66 112" fill="#f2f2f2" stroke="#ddd" stroke-width="1"/>
        
        <!-- Tail feathers -->
        <path d="M144 102 Q159 92 154 112 Q149 122 144 102" fill="#f7f7f7" stroke="#ddd" stroke-width="1"/>
      </svg>`,
      description: 'Balanced performance, excellent livability'
    }
  },
  layer: {
    'ISA Brown': {
      image: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- ISA Brown - Brown layer hen -->
        <defs>
          <radialGradient id="isaBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#d97706"/>
            <stop offset="70%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#92400e"/>
          </radialGradient>
          <radialGradient id="isaHead" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#b45309"/>
          </radialGradient>
        </defs>
        
        <!-- Body - more upright layer posture -->
        <ellipse cx="100" cy="115" rx="45" ry="40" fill="url(#isaBody)" stroke="#92400e" stroke-width="1"/>
        
        <!-- Head -->
        <circle cx="100" cy="65" r="22" fill="url(#isaHead)" stroke="#92400e" stroke-width="1"/>
        
        <!-- Comb - single comb -->
        <path d="M85 48 Q90 38 95 48 Q100 38 105 48 Q110 38 115 48" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
        
        <!-- Beak -->
        <path d="M85 68 L75 71 L85 74 Z" fill="#fbbf24"/>
        
        <!-- Eyes -->
        <circle cx="90" cy="61" r="3" fill="#1f2937"/>
        <circle cx="91" cy="60" r="1" fill="#ffffff"/>
        
        <!-- Wattles -->
        <ellipse cx="88" cy="75" rx="4" ry="6" fill="#dc2626"/>
        
        <!-- Legs -->
        <rect x="88" y="150" width="3" height="30" fill="#fbbf24"/>
        <rect x="109" y="150" width="3" height="30" fill="#fbbf24"/>
        
        <!-- Feet -->
        <path d="M83 180 L88 175 L93 180 M88 175 L88 185" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <path d="M104 180 L109 175 L114 180 M109 175 L109 185" stroke="#fbbf24" stroke-width="2" fill="none"/>
        
        <!-- Wing detail with feather pattern -->
        <path d="M70 105 Q85 95 100 105 Q85 115 70 105" fill="#b45309" stroke="#92400e" stroke-width="1"/>
        <path d="M75 100 Q85 98 95 100" stroke="#92400e" stroke-width="1" fill="none"/>
        
        <!-- Tail feathers - more upright -->
        <path d="M135 95 Q150 80 145 100 Q140 115 135 95" fill="#b45309" stroke="#92400e" stroke-width="1"/>
        <path d="M140 85 Q155 70 150 90 Q145 105 140 85" fill="#d97706" stroke="#b45309" stroke-width="1"/>
        
        <!-- Neck feathers -->
        <path d="M90 85 Q100 80 110 85 Q100 90 90 85" fill="#b45309" stroke="#92400e" stroke-width="1"/>
      </svg>`,
      description: 'Excellent egg production, docile temperament'
    },
    'Lohmann Brown': {
      image: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Lohmann Brown - Reddish-brown layer -->
        <defs>
          <radialGradient id="lohmannBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#dc2626"/>
            <stop offset="70%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#991b1b"/>
          </radialGradient>
          <radialGradient id="lohmannHead" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#dc2626"/>
            <stop offset="100%" stop-color="#b91c1c"/>
          </radialGradient>
        </defs>
        
        <!-- Body -->
        <ellipse cx="100" cy="118" rx="46" ry="41" fill="url(#lohmannBody)" stroke="#991b1b" stroke-width="1"/>
        
        <!-- Head -->
        <circle cx="100" cy="67" r="23" fill="url(#lohmannHead)" stroke="#991b1b" stroke-width="1"/>
        
        <!-- Comb -->
        <path d="M84 50 Q89 40 94 50 Q99 40 104 50 Q109 40 114 50 Q119 40 124 50" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
        
        <!-- Beak -->
        <path d="M85 70 L75 73 L85 76 Z" fill="#fbbf24"/>
        
        <!-- Eyes -->
        <circle cx="90" cy="63" r="3" fill="#1f2937"/>
        <circle cx="91" cy="62" r="1" fill="#ffffff"/>
        
        <!-- Wattles -->
        <ellipse cx="88" cy="77" rx="4" ry="6" fill="#dc2626"/>
        
        <!-- Legs -->
        <rect x="87" y="154" width="3" height="28" fill="#fbbf24"/>
        <rect x="110" y="154" width="3" height="28" fill="#fbbf24"/>
        
        <!-- Feet -->
        <path d="M82 182 L87 177 L92 182 M87 177 L87 187" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <path d="M105 182 L110 177 L115 182 M110 177 L110 187" stroke="#fbbf24" stroke-width="2" fill="none"/>
        
        <!-- Wing detail -->
        <path d="M68 108 Q83 98 98 108 Q83 118 68 108" fill="#b91c1c" stroke="#991b1b" stroke-width="1"/>
        <path d="M73 103 Q83 101 93 103" stroke="#991b1b" stroke-width="1" fill="none"/>
        
        <!-- Tail feathers -->
        <path d="M137 98 Q152 83 147 103 Q142 118 137 98" fill="#b91c1c" stroke="#991b1b" stroke-width="1"/>
        <path d="M142 88 Q157 73 152 93 Q147 108 142 88" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
        
        <!-- Neck detail -->
        <path d="M88 87 Q100 82 112 87 Q100 92 88 87" fill="#b91c1c" stroke="#991b1b" stroke-width="1"/>
      </svg>`,
      description: 'High egg production, robust health'
    },
    'Hy-Line Brown': {
      image: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <!-- Hy-Line Brown - Light brown layer -->
        <defs>
          <radialGradient id="hylineBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="70%" stop-color="#c2410c"/>
            <stop offset="100%" stop-color="#9a3412"/>
          </radialGradient>
          <radialGradient id="hylineHead" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stop-color="#ea580c"/>
            <stop offset="100%" stop-color="#c2410c"/>
          </radialGradient>
        </defs>
        
        <!-- Body -->
        <ellipse cx="100" cy="116" rx="44" ry="39" fill="url(#hylineBody)" stroke="#9a3412" stroke-width="1"/>
        
        <!-- Head -->
        <circle cx="100" cy="66" r="21" fill="url(#hylineHead)" stroke="#9a3412" stroke-width="1"/>
        
        <!-- Comb -->
        <path d="M86 49 Q91 39 96 49 Q101 39 106 49 Q111 39 116 49" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
        
        <!-- Beak -->
        <path d="M85 69 L75 72 L85 75 Z" fill="#fbbf24"/>
        
        <!-- Eyes -->
        <circle cx="90" cy="62" r="3" fill="#1f2937"/>
        <circle cx="91" cy="61" r="1" fill="#ffffff"/>
        
        <!-- Wattles -->
        <ellipse cx="88" cy="76" rx="3.5" ry="5.5" fill="#dc2626"/>
        
        <!-- Legs -->
        <rect x="89" y="151" width="3" height="29" fill="#fbbf24"/>
        <rect x="108" y="151" width="3" height="29" fill="#fbbf24"/>
        
        <!-- Feet -->
        <path d="M84 180 L89 175 L94 180 M89 175 L89 185" stroke="#fbbf24" stroke-width="2" fill="none"/>
        <path d="M103 180 L108 175 L113 180 M108 175 L108 185" stroke="#fbbf24" stroke-width="2" fill="none"/>
        
        <!-- Wing detail -->
        <path d="M71 106 Q86 96 101 106 Q86 116 71 106" fill="#c2410c" stroke="#9a3412" stroke-width="1"/>
        <path d="M76 101 Q86 99 96 101" stroke="#9a3412" stroke-width="1" fill="none"/>
        
        <!-- Tail feathers -->
        <path d="M136 96 Q151 81 146 101 Q141 116 136 96" fill="#c2410c" stroke="#9a3412" stroke-width="1"/>
        <path d="M141 86 Q156 71 151 91 Q146 106 141 86" fill="#ea580c" stroke="#c2410c" stroke-width="1"/>
        
        <!-- Neck feathers -->
        <path d="M90 86 Q100 81 110 86 Q100 91 90 86" fill="#c2410c" stroke="#9a3412" stroke-width="1"/>
      </svg>`,
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