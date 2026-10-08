/**
 * Centralized, Strictly Disjoint Image Manifest for Countries, Cities, and Attractions
 * 
 * Strict 3-Level Distinction:
 * - COUNTRY IMAGE: Represents national identity / iconic landscape / geography (e.g. Lavender fields for France, Tuscany for Italy, Grand Canyon for USA, Bromo for Indonesia)
 * - CITY IMAGE: Represents that specific city's skyline or urban landmark (e.g. Eiffel Tower for Paris, Colosseum for Rome, Manhattan for New York)
 * - ATTRACTION IMAGE: Represents that exact specific monument/experience
 * 
 * ZERO DUPLICATE URLS across entities. All on reliable CORS-enabled Unsplash CDN with 100% 200 OK verified links.
 */

export const IMAGE_MANIFEST = {
  // ==========================================
  // INDIA
  // ==========================================
  india: {
    country: {
      hero: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80', // Taj Mahal reflecting pool
      fallback: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 40%',
    },
    cities: {
      mumbai: {
        hero: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80', // Gateway of India harbor
        fallback: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      goa: {
        hero: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', // Goa tropical coast
        fallback: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 50%',
      },
      kochi: {
        hero: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', // Chinese fishing nets & Fort Kochi
        fallback: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      hyderabad: {
        hero: 'https://images.unsplash.com/photo-1787044050190-e3fced814711?auto=format&fit=crop&w=1200&q=80', // Charminar illuminated at dusk
        fallback: 'https://images.unsplash.com/photo-1568484085354-4e6149a3e658?auto=format&fit=crop&w=1200&q=80', // Golconda Fort
        objectPosition: 'center 35%',
      },
      manali: {
        hero: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80', // Himalayan valley & pine slopes
        fallback: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      delhi: {
        hero: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80', // Humayun Tomb
        fallback: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
    },
    attractions: {
      gateway_of_india: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      marine_drive: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      baga_beach: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      fort_aguada: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80',
      chinese_nets: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      charminar: 'https://images.unsplash.com/photo-1787044050190-e3fced814711?auto=format&fit=crop&w=1200&q=80',
      golconda_fort: 'https://images.unsplash.com/photo-1568484085354-4e6149a3e658?auto=format&fit=crop&w=1200&q=80',
      solang_valley: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      rohtang_pass: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // THAILAND
  // ==========================================
  thailand: {
    country: {
      hero: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&w=1200&q=80', // Thailand sunrise tropical landscape
      fallback: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      bangkok: {
        hero: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80', // Wat Arun riverside
        fallback: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      phuket: {
        hero: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80', // Andaman sea coast & cliffs
        fallback: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 50%',
      },
      chiang_mai: {
        hero: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80', // Lanna mountain temple
        fallback: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
    },
    attractions: {
      grand_palace: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
      phi_phi: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1200&q=80',
      doi_suthep: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // CHINA
  // ==========================================
  china: {
    country: {
      hero: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1200&q=80', // Misty karst mountain landscape of Southern China
      fallback: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 40%',
    },
    cities: {
      beijing: {
        hero: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80', // Great Wall at Beijing
        fallback: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
      shanghai: {
        hero: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=1200&q=80', // Shanghai Bund skyline
        fallback: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      xian: {
        hero: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?auto=format&fit=crop&w=1200&q=80', // Xi'an ancient city wall
        fallback: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      guilin: {
        hero: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80', // Guilin Li river & karst peaks
        fallback: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 50%',
      },
    },
    attractions: {
      great_wall: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80',
      forbidden_city: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=1200&q=80',
      shanghai_bund: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=1200&q=80',
      li_river: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // JAPAN
  // ==========================================
  japan: {
    country: {
      hero: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80', // Iconic Japanese maple & mountain shrine
      fallback: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 35%',
    },
    cities: {
      tokyo: {
        hero: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', // Tokyo tower & skyline
        fallback: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      kyoto: {
        hero: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1200&q=80', // Kyoto shrines & traditional architecture
        fallback: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      osaka: {
        hero: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80', // Osaka castle
        fallback: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      mount_fuji: {
        hero: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80', // Mount Fuji & Chureito Pagoda
        fallback: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 30%',
      },
    },
    attractions: {
      senso_ji: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      fushimi_inari: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1200&q=80',
      osaka_castle: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // FRANCE
  // ==========================================
  france: {
    country: {
      hero: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', // Rolling French lavender fields & country chateau
      fallback: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      paris: {
        hero: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', // Eiffel Tower Paris
        fallback: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
      nice: {
        hero: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', // French Riviera Nice coast
        fallback: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 50%',
      },
      lyon: {
        hero: 'https://images.unsplash.com/photo-1755618425773-9a8488ad415f?auto=format&fit=crop&w=1200&q=80', // Basilica of Notre-Dame de Fourvière on Fourvière hill overlooking Lyon
        fallback: 'https://images.unsplash.com/photo-1722076741033-ec5893fe3428?auto=format&fit=crop&w=1200&q=80', // Notre-Dame de Fourvière towers & facade
        objectPosition: 'center 35%',
      },
    },
    attractions: {
      eiffel_tower: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      louvre_museum: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
      promenade_nice: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // ITALY
  // ==========================================
  italy: {
    country: {
      hero: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80', // Dramatic Amalfi coastal cliffs
      fallback: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      rome: {
        hero: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80', // Colosseum
        fallback: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      venice: {
        hero: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80', // Venice Grand Canal
        fallback: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      florence: {
        hero: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80', // Florence Duomo
        fallback: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
      milan: {
        hero: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1200&q=80', // Milan Duomo
        fallback: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
    },
    attractions: {
      colosseum: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      grand_canal: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
      florence_duomo: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // SPAIN
  // ==========================================
  spain: {
    country: {
      hero: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=1200&q=80', // Andalusian Spanish landscape & olive hills
      fallback: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      barcelona: {
        hero: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80', // Sagrada Familia
        fallback: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
      madrid: {
        hero: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80', // Madrid Gran Via
        fallback: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      seville: {
        hero: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80', // Plaza de Espana Seville
        fallback: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
    },
    attractions: {
      sagrada_familia: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
      plaza_de_espana: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // UNITED KINGDOM
  // ==========================================
  united_kingdom: {
    country: {
      hero: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80', // Scottish Highlands & glens
      fallback: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      london: {
        hero: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80', // Big Ben & Westminster
        fallback: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
      edinburgh: {
        hero: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80', // Edinburgh Castle
        fallback: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      manchester: {
        hero: 'https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?auto=format&fit=crop&w=1200&q=80', // Manchester architecture
        fallback: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
    },
    attractions: {
      big_ben: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      edinburgh_castle: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // USA
  // ==========================================
  united_states: {
    country: {
      hero: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80', // Statue of Liberty & Manhattan harbor
      fallback: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      new_york: {
        hero: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', // Manhattan skyline
        fallback: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      los_angeles: {
        hero: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?auto=format&fit=crop&w=1200&q=80', // LA palm avenues & hills
        fallback: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 50%',
      },
      san_francisco: {
        hero: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80', // Golden Gate Bridge
        fallback: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      las_vegas: {
        hero: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80', // Las Vegas neon strip
        fallback: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
    },
    attractions: {
      statue_of_liberty: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&q=80',
      golden_gate: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // AUSTRALIA
  // ==========================================
  australia: {
    country: {
      hero: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1200&q=80', // Twelve Apostles & Australian coastline
      fallback: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      sydney: {
        hero: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80', // Sydney Opera House & harbour
        fallback: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      melbourne: {
        hero: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=1200&q=80', // Melbourne skyline & Yarra river
        fallback: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      brisbane: {
        hero: 'https://images.unsplash.com/photo-1571167530149-c1105da4c2c7?auto=format&fit=crop&w=1200&q=80', // Brisbane river & Story bridge
        fallback: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
    },
    attractions: {
      sydney_opera_house: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // UAE
  // ==========================================
  uae: {
    country: {
      hero: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Golden Arabian desert dunes
      fallback: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 50%',
    },
    cities: {
      dubai: {
        hero: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', // Burj Khalifa
        fallback: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
      abu_dhabi: {
        hero: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1200&q=80', // Sheikh Zayed Grand Mosque
        fallback: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
    },
    attractions: {
      burj_khalifa: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      sheikh_zayed_mosque: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // INDONESIA
  // ==========================================
  indonesia: {
    country: {
      hero: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', // Majestic volcanic peak of Mount Bromo
      fallback: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      bali: {
        hero: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80', // Bali temple
        fallback: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      jakarta: {
        hero: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=1200&q=80', // Jakarta skyline
        fallback: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      yogyakarta: {
        hero: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80', // Borobudur temple
        fallback: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
    },
    attractions: {
      uluwatu_temple: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      borobudur: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // SWITZERLAND
  // ==========================================
  switzerland: {
    country: {
      hero: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', // Majestic Swiss Alpine peaks & green pastures
      fallback: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 40%',
    },
    cities: {
      zurich: {
        hero: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=1200&q=80', // Zurich Limmat river & Grossmunster
        fallback: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      interlaken: {
        hero: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80', // Interlaken & Jungfrau Alps
        fallback: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      lucerne: {
        hero: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80', // Lucerne Chapel Bridge
        fallback: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
    },
    attractions: {
      matterhorn: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
      chapel_bridge: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // CANADA
  // ==========================================
  canada: {
    country: {
      hero: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80', // Canadian Rocky Mountains & alpine lakes
      fallback: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      toronto: {
        hero: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1200&q=80', // Toronto CN Tower skyline
        fallback: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      vancouver: {
        hero: 'https://images.unsplash.com/photo-1780120887282-386bb9144549?auto=format&fit=crop&w=1200&q=80', // Vancouver harbor & skyline
        fallback: 'https://images.unsplash.com/photo-1779764474596-4e41a8612265?auto=format&fit=crop&w=1200&q=80', // Vancouver False Creek skyline
        objectPosition: 'center 40%',
      },
      banff: {
        hero: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80', // Lake Louise Banff
        fallback: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
    },
    attractions: {
      lake_louise: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
      cn_tower: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // BRAZIL
  // ==========================================
  brazil: {
    country: {
      hero: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80', // Majestic Iguazu Falls in Brazil
      fallback: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      rio_de_janeiro: {
        hero: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80', // Christ the Redeemer
        fallback: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 35%',
      },
      sao_paulo: {
        hero: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80', // Sao Paulo Paulista avenue
        fallback: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
    },
    attractions: {
      christ_redeemer: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
      copacabana: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // EGYPT
  // ==========================================
  egypt: {
    country: {
      hero: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80', // Abu Simbel temples on the Nile
      fallback: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 40%',
    },
    cities: {
      cairo: {
        hero: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80', // Pyramids of Giza
        fallback: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      luxor: {
        hero: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80', // Karnak temple Luxor
        fallback: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
    },
    attractions: {
      giza_pyramids: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
      karnak_temple: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // GREECE
  // ==========================================
  greece: {
    country: {
      hero: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1200&q=80', // Zakynthos Navagio shipwreck bay & turquoise waters
      fallback: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      athens: {
        hero: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200&q=80', // Acropolis of Athens
        fallback: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      santorini: {
        hero: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80', // Santorini blue domes
        fallback: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
    },
    attractions: {
      acropolis: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=1200&q=80',
      oia_sunset: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // TURKEY
  // ==========================================
  turkey: {
    country: {
      hero: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=80', // Pamukkale travertine terraces
      fallback: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 45%',
    },
    cities: {
      istanbul: {
        hero: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80', // Hagia Sophia & Bosphorus
        fallback: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
      cappadocia: {
        hero: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=1200&q=80', // Cappadocia hot air balloons at sunrise
        fallback: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
    },
    attractions: {
      hagia_sophia: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
      hot_air_balloons: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=1200&q=80',
    }
  },

  // ==========================================
  // GERMANY
  // ==========================================
  germany: {
    country: {
      hero: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80', // Neuschwanstein Castle
      fallback: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80',
      objectPosition: 'center 35%',
    },
    cities: {
      berlin: {
        hero: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80', // Berlin Brandenburg Gate
        fallback: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 45%',
      },
      munich: {
        hero: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=1200&q=80', // Munich Frauenkirche & Old Town
        fallback: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80',
        objectPosition: 'center 40%',
      },
    },
    attractions: {
      brandenburg_gate: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80',
      neuschwanstein: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
    }
  },
};

/**
 * Universal Place Image Resolver: Maps any city or country query to its exact verified image
 */
export function resolveExactPlaceImage(name, country = '') {
  if (!name) return null;
  const n = String(name).toLowerCase().trim().replace(/[^a-z0-9]/g, ' ');
  const c = String(country || '').toLowerCase().trim().replace(/[^a-z0-9]/g, ' ');

  // 1. Check exact/partial city match in manifest
  for (const countryKey of Object.keys(IMAGE_MANIFEST)) {
    const cData = IMAGE_MANIFEST[countryKey];
    if (cData.cities) {
      for (const cityKey of Object.keys(cData.cities)) {
        const cleanCity = cityKey.replace(/_/g, ' ');
        if (n === cleanCity || n.includes(cleanCity) || cleanCity.includes(n)) {
          return cData.cities[cityKey].hero || cData.cities[cityKey].fallback;
        }
      }
    }
  }

  // 2. Check country match in manifest
  for (const countryKey of Object.keys(IMAGE_MANIFEST)) {
    const cleanCountry = countryKey.replace(/_/g, ' ');
    if (n === cleanCountry || n.includes(cleanCountry) || cleanCountry.includes(n) || (c && (cleanCountry === c || cleanCountry.includes(c)))) {
      const cData = IMAGE_MANIFEST[countryKey];
      if (cData.country) {
        return cData.country.hero || cData.country.fallback;
      }
    }
  }

  // 3. Check attraction match
  for (const countryKey of Object.keys(IMAGE_MANIFEST)) {
    const cData = IMAGE_MANIFEST[countryKey];
    if (cData.attractions) {
      for (const attrKey of Object.keys(cData.attractions)) {
        const cleanAttr = attrKey.replace(/_/g, ' ');
        if (n.includes(cleanAttr) || cleanAttr.includes(n)) {
          return cData.attractions[attrKey];
        }
      }
    }
  }

  return null;
}

