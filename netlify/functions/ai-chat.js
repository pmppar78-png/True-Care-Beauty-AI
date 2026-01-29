// netlify/functions/ai-chat.js
// TrueCare Beauty AI Concierge – OpenAI backend

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Official Smart Beauty affiliate partners catalog
// Categories: makeup, skincare, haircare, fragrance, body, clean, tools, wellness, value, subscription
// Tags: sensitive-skin, acne, anti-aging, fragrance-free, budget, premium, curly-hair, thinning-hair, derm-grade
const BEAUTY_AFFILIATES = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-CATEGORY RETAILERS (broad inventory)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Sephora", url: "https://www.sephora.com", categories: ["makeup", "skincare", "haircare", "fragrance", "body", "clean", "tools"], recommended_for: ["routines", "best products", "gift sets", "premium brands"], best_for: ["premium", "discovery"] },
  { name: "Ulta Beauty", url: "https://www.ulta.com", categories: ["makeup", "skincare", "haircare", "fragrance", "body", "clean", "tools"], recommended_for: ["routines", "drugstore + prestige mix", "rewards"], best_for: ["budget", "premium", "variety"] },
  { name: "Target Beauty", url: "https://www.target.com/c/beauty/-/N-5xsxf", categories: ["makeup", "skincare", "body", "clean", "haircare"], recommended_for: ["budget finds", "everyday essentials", "clean beauty"], best_for: ["budget", "accessible"] },
  { name: "Walmart Beauty", url: "https://www.walmart.com/cp/beauty", categories: ["makeup", "skincare", "body", "haircare"], recommended_for: ["budget", "everyday essentials", "value packs"], best_for: ["budget", "bulk"] },
  { name: "Amazon Beauty", url: "https://www.amazon.com/beauty", categories: ["makeup", "skincare", "haircare", "body", "wellness", "tools"], recommended_for: ["quick delivery", "variety", "reviews"], best_for: ["convenience", "variety"] },
  { name: "Nordstrom Beauty", url: "https://www.nordstrom.com/browse/beauty", categories: ["makeup", "skincare", "fragrance", "tools"], recommended_for: ["luxury brands", "gift sets", "premium skincare"], best_for: ["premium", "luxury"] },
  { name: "Macy's Beauty", url: "https://www.macys.com/shop/beauty", categories: ["makeup", "skincare", "fragrance", "tools"], recommended_for: ["department store brands", "fragrance", "sales events"], best_for: ["premium", "fragrance"] },
  { name: "Bloomingdale's Beauty", url: "https://www.bloomingdales.com/shop/beauty", categories: ["makeup", "skincare", "fragrance"], recommended_for: ["luxury beauty", "high-end skincare"], best_for: ["luxury", "premium"] },
  { name: "Neiman Marcus Beauty", url: "https://www.neimanmarcus.com/c/beauty-cat000285", categories: ["makeup", "skincare", "fragrance"], recommended_for: ["luxury brands", "prestige skincare"], best_for: ["luxury"] },
  { name: "Space NK", url: "https://www.spacenk.com", categories: ["makeup", "skincare", "fragrance", "clean"], recommended_for: ["curated luxury", "niche brands", "discovery"], best_for: ["premium", "curated"] },
  { name: "Cult Beauty", url: "https://www.cultbeauty.com", categories: ["makeup", "skincare", "haircare", "clean"], recommended_for: ["trending products", "K-beauty", "cult favorites"], best_for: ["discovery", "trending"] },
  { name: "Beauty Bay", url: "https://www.beautybay.com", categories: ["makeup", "skincare", "haircare"], recommended_for: ["indie brands", "colorful makeup", "budget"], best_for: ["budget", "variety"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // SKINCARE SPECIALISTS (derm-grade, sensitive skin, anti-aging, acne)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Dermstore", url: "https://www.dermstore.com", categories: ["skincare", "clean", "tools"], recommended_for: ["derm-recommended", "anti-aging", "professional skincare"], best_for: ["derm-grade", "sensitive-skin", "anti-aging"] },
  { name: "SkinStore", url: "https://www.skinstore.com", categories: ["skincare", "body", "tools"], recommended_for: ["clinical skincare", "devices", "anti-aging"], best_for: ["derm-grade", "devices"] },
  { name: "SkinCeuticals", url: "https://www.skinceuticals.com", categories: ["skincare"], recommended_for: ["vitamin C serums", "anti-aging", "derm-grade"], best_for: ["derm-grade", "anti-aging", "premium"], notes: "Professional-grade antioxidant serums" },
  { name: "Paula's Choice", url: "https://www.paulaschoice.com", categories: ["skincare"], recommended_for: ["BHA exfoliants", "sensitive skin", "ingredient transparency"], best_for: ["sensitive-skin", "acne", "fragrance-free"] },
  { name: "La Roche-Posay", url: "https://www.laroche-posay.us", categories: ["skincare", "body"], recommended_for: ["sensitive skin", "acne-prone", "sunscreen", "eczema"], best_for: ["sensitive-skin", "acne", "derm-grade", "fragrance-free"] },
  { name: "CeraVe", url: "https://www.cerave.com", categories: ["skincare", "body"], recommended_for: ["barrier repair", "sensitive skin", "budget derm-grade"], best_for: ["sensitive-skin", "budget", "fragrance-free", "derm-grade"] },
  { name: "Vanicream", url: "https://www.vanicream.com", categories: ["skincare", "body", "haircare"], recommended_for: ["ultra-sensitive skin", "fragrance-free", "eczema"], best_for: ["sensitive-skin", "fragrance-free", "budget"] },
  { name: "Avène", url: "https://www.aveneusa.com", categories: ["skincare", "body"], recommended_for: ["sensitive skin", "rosacea-prone", "thermal water"], best_for: ["sensitive-skin", "fragrance-free", "derm-grade"] },
  { name: "Bioderma", url: "https://www.bioderma.us", categories: ["skincare", "body"], recommended_for: ["micellar water", "sensitive skin", "French pharmacy"], best_for: ["sensitive-skin", "budget"] },
  { name: "Vichy", url: "https://www.vichyusa.com", categories: ["skincare"], recommended_for: ["mineral sunscreen", "anti-aging", "sensitive skin"], best_for: ["sensitive-skin", "anti-aging"] },
  { name: "EltaMD", url: "https://eltamd.com", categories: ["skincare"], recommended_for: ["sunscreen", "sensitive skin", "post-procedure"], best_for: ["sensitive-skin", "derm-grade", "sunscreen"] },
  { name: "Supergoop", url: "https://supergoop.com", categories: ["skincare"], recommended_for: ["daily SPF", "invisible sunscreen", "SPF makeup"], best_for: ["sunscreen", "daily-wear"] },
  { name: "Colorescience", url: "https://www.colorescience.com", categories: ["skincare", "makeup"], recommended_for: ["mineral SPF", "tinted sunscreen", "sensitive skin"], best_for: ["sensitive-skin", "sunscreen", "derm-grade"] },
  { name: "First Aid Beauty", url: "https://www.firstaidbeauty.com", categories: ["skincare", "body"], recommended_for: ["sensitive skin", "eczema-prone", "gentle formulas"], best_for: ["sensitive-skin", "fragrance-free"] },
  { name: "Kiehl's", url: "https://www.kiehls.com", categories: ["skincare", "body", "haircare"], recommended_for: ["classic formulas", "moisturizers", "men's skincare"], best_for: ["premium"] },
  { name: "Clinique", url: "https://www.clinique.com", categories: ["skincare", "makeup"], recommended_for: ["allergy-tested", "sensitive skin", "3-step routine"], best_for: ["sensitive-skin", "fragrance-free"] },
  { name: "The Ordinary", url: "https://theordinary.com", categories: ["skincare"], recommended_for: ["affordable actives", "retinol", "niacinamide", "vitamin C"], best_for: ["budget", "actives"] },
  { name: "The Inkey List", url: "https://www.theinkeylist.com", categories: ["skincare", "haircare"], recommended_for: ["affordable actives", "beginner-friendly", "targeted treatments"], best_for: ["budget", "actives"] },
  { name: "Naturium", url: "https://naturium.com", categories: ["skincare", "body"], recommended_for: ["affordable actives", "multi-tasking products"], best_for: ["budget", "actives"] },
  { name: "Good Molecules", url: "https://www.goodmolecules.com", categories: ["skincare"], recommended_for: ["affordable serums", "niacinamide", "discoloration"], best_for: ["budget", "actives"] },
  { name: "Glossier", url: "https://www.glossier.com", categories: ["skincare", "makeup"], recommended_for: ["minimal routines", "dewy look", "everyday basics"], best_for: ["minimal", "everyday"] },
  { name: "Tatcha", url: "https://www.tatcha.com", categories: ["skincare"], recommended_for: ["J-beauty", "luxury skincare", "gift sets"], best_for: ["premium", "luxury"] },
  { name: "Drunk Elephant", url: "https://www.drunkelephant.com", categories: ["skincare", "clean"], recommended_for: ["clean formulas", "vitamin C", "mixing skincare"], best_for: ["clean", "premium"] },
  { name: "Sunday Riley", url: "https://www.sundayriley.com", categories: ["skincare"], recommended_for: ["retinol", "Good Genes", "luxury actives"], best_for: ["premium", "anti-aging"] },
  { name: "Murad", url: "https://www.murad.com", categories: ["skincare"], recommended_for: ["acne treatment", "anti-aging", "clinical results"], best_for: ["acne", "anti-aging", "derm-grade"] },
  { name: "Dr. Dennis Gross", url: "https://www.drdennisgross.com", categories: ["skincare", "tools"], recommended_for: ["peel pads", "LED devices", "anti-aging"], best_for: ["anti-aging", "derm-grade", "devices"] },
  { name: "Peter Thomas Roth", url: "https://www.peterthomasroth.com", categories: ["skincare"], recommended_for: ["instant results", "eye patches", "masks"], best_for: ["premium", "quick-results"] },
  { name: "Ole Henriksen", url: "https://www.olehenriksen.com", categories: ["skincare"], recommended_for: ["vitamin C", "brightening", "glow"], best_for: ["brightening"] },
  { name: "Versed Skincare", url: "https://versedskin.com", categories: ["skincare", "clean"], recommended_for: ["clean beauty", "Target finds", "budget"], best_for: ["budget", "clean"] },
  { name: "Herbivore Botanicals", url: "https://www.herbivorebotanicals.com", categories: ["skincare", "body", "clean"], recommended_for: ["natural ingredients", "face oils", "clean luxury"], best_for: ["clean", "premium"] },
  { name: "Tula Skincare", url: "https://www.tula.com", categories: ["skincare"], recommended_for: ["probiotics", "sensitive skin", "brightening"], best_for: ["sensitive-skin"] },
  { name: "Acne.org", url: "https://www.acne.org", categories: ["skincare"], recommended_for: ["benzoyl peroxide", "acne treatment", "regimen kits"], best_for: ["acne", "budget"] },
  { name: "Differin", url: "https://differin.com", categories: ["skincare"], recommended_for: ["OTC retinoid", "acne treatment", "anti-aging"], best_for: ["acne", "budget", "derm-grade"] },
  { name: "Neutrogena", url: "https://www.neutrogena.com", categories: ["skincare", "body", "haircare"], recommended_for: ["drugstore staples", "sunscreen", "acne treatment"], best_for: ["budget", "accessible"] },
  { name: "OSEA", url: "https://oseamalibu.com", categories: ["skincare", "body", "clean"], recommended_for: ["vegan", "seaweed-based", "clean luxury"], best_for: ["clean", "premium"] },
  { name: "Youth to the People", url: "https://www.youthtothepeople.com", categories: ["skincare", "clean"], recommended_for: ["superfood skincare", "clean beauty", "kale cleanser"], best_for: ["clean", "premium"] },
  { name: "Farmacy Beauty", url: "https://www.farmacybeauty.com", categories: ["skincare", "clean"], recommended_for: ["clean beauty", "honey-based", "Green Clean"], best_for: ["clean"] },
  { name: "Glow Recipe", url: "https://www.glowrecipe.com", categories: ["skincare", "clean"], recommended_for: ["K-beauty inspired", "fruit extracts", "watermelon"], best_for: ["clean", "K-beauty"] },
  { name: "Summer Fridays", url: "https://summerfridays.com", categories: ["skincare"], recommended_for: ["jet lag mask", "lip balm", "minimal routine"], best_for: ["minimal", "premium"] },
  { name: "Peach & Lily", url: "https://www.peachandlily.com", categories: ["skincare", "clean"], recommended_for: ["K-beauty", "glass skin", "curated selection"], best_for: ["K-beauty", "clean"] },
  { name: "Sokoglam", url: "https://sokoglam.com", categories: ["skincare"], recommended_for: ["K-beauty", "Korean skincare", "sheet masks"], best_for: ["K-beauty", "discovery"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAKEUP BRANDS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "MAC Cosmetics", url: "https://www.maccosmetics.com", categories: ["makeup"], recommended_for: ["lipsticks", "professional makeup", "wide shade range"], best_for: ["premium", "variety"] },
  { name: "Tarte Cosmetics", url: "https://www.tartecosmetics.com", categories: ["makeup", "clean"], recommended_for: ["Shape Tape", "natural makeup", "vegan"], best_for: ["clean"] },
  { name: "NYX Professional", url: "https://www.nyxcosmetics.com", categories: ["makeup"], recommended_for: ["drugstore quality", "lip products", "brow products"], best_for: ["budget"] },
  { name: "NARS", url: "https://www.narscosmetics.com", categories: ["makeup"], recommended_for: ["Orgasm blush", "foundations", "bold color"], best_for: ["premium"] },
  { name: "Charlotte Tilbury", url: "https://www.charlottetilbury.com", categories: ["makeup", "skincare"], recommended_for: ["luxury makeup", "Hollywood glow", "gift sets"], best_for: ["luxury", "premium"] },
  { name: "Huda Beauty", url: "https://hudabeauty.com", categories: ["makeup"], recommended_for: ["eyeshadow palettes", "false lashes", "bold looks"], best_for: ["premium", "bold"] },
  { name: "Rare Beauty", url: "https://www.rarebeauty.com", categories: ["makeup"], recommended_for: ["soft glam", "liquid blush", "inclusive shades"], best_for: ["everyday"] },
  { name: "Fenty Beauty", url: "https://www.fentybeauty.com", categories: ["makeup"], recommended_for: ["shade range", "Pro Filt'r foundation", "inclusive beauty"], best_for: ["inclusive", "premium"] },
  { name: "Too Faced", url: "https://www.toofaced.com", categories: ["makeup"], recommended_for: ["Better Than Sex mascara", "fun packaging", "sweet scents"], best_for: ["premium"] },
  { name: "Benefit Cosmetics", url: "https://www.benefitcosmetics.com", categories: ["makeup"], recommended_for: ["brow products", "mascaras", "cheek tints"], best_for: ["premium", "brows"] },
  { name: "Anastasia Beverly Hills", url: "https://www.anastasiabeverlyhills.com", categories: ["makeup"], recommended_for: ["brow products", "eyeshadow palettes", "contour"], best_for: ["premium", "brows"] },
  { name: "Laura Mercier", url: "https://www.lauramercier.com", categories: ["makeup"], recommended_for: ["setting powder", "tinted moisturizer", "primers"], best_for: ["premium"] },
  { name: "ILIA Beauty", url: "https://www.iliabeauty.com", categories: ["makeup", "clean"], recommended_for: ["clean makeup", "Super Serum Skin Tint", "natural look"], best_for: ["clean", "sensitive-skin"] },
  { name: "Kosas", url: "https://kosas.com", categories: ["makeup", "clean"], recommended_for: ["clean makeup", "tinted face oil", "lip products"], best_for: ["clean"] },
  { name: "e.l.f. Cosmetics", url: "https://www.elfcosmetics.com", categories: ["makeup", "skincare"], recommended_for: ["budget dupes", "viral products", "Halo Glow"], best_for: ["budget"] },
  { name: "Morphe", url: "https://www.morphe.com", categories: ["makeup", "tools"], recommended_for: ["eyeshadow palettes", "brushes", "collaborations"], best_for: ["budget", "variety"] },
  { name: "ColourPop", url: "https://colourpop.com", categories: ["makeup"], recommended_for: ["budget", "trendy shades", "collaborations"], best_for: ["budget", "trendy"] },
  { name: "Pat McGrath Labs", url: "https://www.patmcgrath.com", categories: ["makeup"], recommended_for: ["luxury makeup", "editorial looks", "pigmented shadows"], best_for: ["luxury"] },
  { name: "Makeup by Mario", url: "https://makeupbymario.com", categories: ["makeup"], recommended_for: ["master techniques", "skin prep", "contour"], best_for: ["premium", "technique"] },
  { name: "Hourglass", url: "https://www.hourglasscosmetics.com", categories: ["makeup", "clean"], recommended_for: ["vegan luxury", "Ambient Lighting", "cruelty-free"], best_for: ["luxury", "clean"] },
  { name: "Merit Beauty", url: "https://meritbeauty.com", categories: ["makeup", "clean"], recommended_for: ["minimal makeup", "effortless look", "clean formulas"], best_for: ["clean", "minimal"] },
  { name: "Jones Road Beauty", url: "https://jonesroadbeauty.com", categories: ["makeup", "clean"], recommended_for: ["clean makeup", "mature skin", "Miracle Balm"], best_for: ["clean", "mature"] },
  { name: "Saie Beauty", url: "https://saiehello.com", categories: ["makeup", "clean"], recommended_for: ["clean mascara", "Glowy Super Gel", "minimal routine"], best_for: ["clean"] },
  { name: "Tower 28", url: "https://tower28beauty.com", categories: ["makeup", "clean"], recommended_for: ["sensitive skin makeup", "clean", "eczema-safe"], best_for: ["sensitive-skin", "clean"] },
  { name: "Milk Makeup", url: "https://milkmakeup.com", categories: ["makeup", "clean"], recommended_for: ["cream products", "vegan", "easy application"], best_for: ["clean", "minimal"] },
  { name: "RMS Beauty", url: "https://www.rmsbeauty.com", categories: ["makeup", "clean"], recommended_for: ["luminous finish", "clean luxury", "Un Cover-Up"], best_for: ["clean", "premium"] },
  { name: "Westman Atelier", url: "https://www.westman-atelier.com", categories: ["makeup", "clean"], recommended_for: ["luxury clean", "skin-like finish", "refillable"], best_for: ["luxury", "clean"] },
  { name: "Maybelline", url: "https://www.maybelline.com", categories: ["makeup"], recommended_for: ["drugstore staples", "mascaras", "SuperStay"], best_for: ["budget"] },
  { name: "L'Oréal Paris", url: "https://www.lorealparisusa.com", categories: ["makeup", "skincare", "haircare"], recommended_for: ["drugstore luxury", "True Match", "hair color"], best_for: ["budget"] },
  { name: "Revlon", url: "https://www.revlon.com", categories: ["makeup"], recommended_for: ["classic lipsticks", "drugstore staples"], best_for: ["budget"] },
  { name: "CoverGirl", url: "https://www.covergirl.com", categories: ["makeup"], recommended_for: ["clean at CoverGirl", "drugstore", "mascara"], best_for: ["budget", "clean"] },
  { name: "Milani", url: "https://www.milanicosmetics.com", categories: ["makeup"], recommended_for: ["drugstore dupes", "baked blush", "affordable"], best_for: ["budget"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // HAIRCARE SPECIALISTS (repair, scalp, curly, thinning)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Sally Beauty", url: "https://www.sallybeauty.com", categories: ["haircare", "tools", "body"], recommended_for: ["hair color", "professional products", "salon supplies"], best_for: ["variety", "budget"] },
  { name: "Olaplex", url: "https://olaplex.com", categories: ["haircare"], recommended_for: ["bond repair", "damaged hair", "bleached hair"], best_for: ["repair", "damaged-hair", "premium"] },
  { name: "K18 Hair", url: "https://www.k18hair.com", categories: ["haircare"], recommended_for: ["peptide repair", "leave-in treatment", "damaged hair"], best_for: ["repair", "damaged-hair", "premium"] },
  { name: "MoroccanOil", url: "https://www.moroccanoil.com", categories: ["haircare"], recommended_for: ["argan oil", "frizz control", "hydration"], best_for: ["premium", "hydration"] },
  { name: "Briogeo", url: "https://briogeohair.com", categories: ["haircare", "clean"], recommended_for: ["clean haircare", "Don't Despair Repair", "scalp care"], best_for: ["clean", "repair"] },
  { name: "Living Proof", url: "https://www.livingproof.com", categories: ["haircare"], recommended_for: ["frizz control", "dry shampoo", "PhD line"], best_for: ["premium", "frizz"] },
  { name: "Redken", url: "https://www.redken.com", categories: ["haircare"], recommended_for: ["salon professional", "Acidic Bonding", "color care"], best_for: ["professional", "color-treated"] },
  { name: "Aveda", url: "https://www.aveda.com", categories: ["haircare", "body", "clean"], recommended_for: ["plant-based", "scalp care", "sustainable"], best_for: ["clean", "premium"] },
  { name: "Oribe", url: "https://www.oribe.com", categories: ["haircare"], recommended_for: ["luxury haircare", "Dry Texturizing Spray", "salon-quality"], best_for: ["luxury"] },
  { name: "Kérastase", url: "https://www.kerastase-usa.com", categories: ["haircare"], recommended_for: ["luxury haircare", "scalp treatments", "Elixir Ultime"], best_for: ["luxury", "premium"] },
  { name: "Ouai", url: "https://theouai.com", categories: ["haircare", "body"], recommended_for: ["modern essentials", "Wave Spray", "travel sizes"], best_for: ["premium", "everyday"] },
  { name: "Davines", url: "https://us.davines.com", categories: ["haircare", "clean"], recommended_for: ["sustainable", "Italian haircare", "salon-quality"], best_for: ["clean", "premium"] },
  { name: "Amika", url: "https://loveamika.com", categories: ["haircare", "tools"], recommended_for: ["colorful packaging", "Soulfood mask", "heat tools"], best_for: ["premium", "fun"] },
  { name: "Function of Beauty", url: "https://www.functionofbeauty.com", categories: ["haircare", "skincare", "body"], recommended_for: ["customizable", "personalized formulas"], best_for: ["personalized"] },
  { name: "Prose", url: "https://prose.com", categories: ["haircare"], recommended_for: ["custom haircare", "personalized formulas", "subscription"], best_for: ["personalized", "subscription"] },
  { name: "Vegamour", url: "https://vegamour.com", categories: ["haircare", "wellness"], recommended_for: ["hair growth", "thinning hair", "vegan"], best_for: ["thinning-hair", "clean"] },
  { name: "Nutrafol", url: "https://nutrafol.com", categories: ["haircare", "wellness"], recommended_for: ["hair supplements", "thinning hair", "growth"], best_for: ["thinning-hair", "supplements"] },
  { name: "Keeps", url: "https://www.keeps.com", categories: ["haircare"], recommended_for: ["men's hair loss", "thinning hair", "subscription"], best_for: ["thinning-hair", "men"] },
  { name: "Hims", url: "https://www.forhims.com/hair", categories: ["haircare"], recommended_for: ["men's hair loss", "minoxidil", "finasteride"], best_for: ["thinning-hair", "men"] },
  { name: "Philip Kingsley", url: "https://www.philipkingsley.com", categories: ["haircare"], recommended_for: ["scalp care", "thinning hair", "trichologist-developed"], best_for: ["scalp", "thinning-hair", "derm-grade"] },
  { name: "Shea Moisture", url: "https://www.sheamoisture.com", categories: ["haircare", "body"], recommended_for: ["textured hair", "curly hair", "natural ingredients"], best_for: ["curly-hair", "textured", "budget"] },
  { name: "Carol's Daughter", url: "https://www.carolsdaughter.com", categories: ["haircare", "body"], recommended_for: ["textured hair", "curly hair", "natural hair"], best_for: ["curly-hair", "textured"] },
  { name: "Mielle Organics", url: "https://mielleorganics.com", categories: ["haircare"], recommended_for: ["natural hair", "Rosemary Mint oil", "curly hair"], best_for: ["curly-hair", "textured", "budget"] },
  { name: "Pattern Beauty", url: "https://patternbeauty.com", categories: ["haircare"], recommended_for: ["curly & coily hair", "Tracee Ellis Ross", "hydration"], best_for: ["curly-hair", "coily"] },
  { name: "DevaCurl", url: "https://www.devacurl.com", categories: ["haircare"], recommended_for: ["curly girl method", "curly hair", "no-poo"], best_for: ["curly-hair"] },
  { name: "Curlsmith", url: "https://curlsmith.com", categories: ["haircare", "clean"], recommended_for: ["curly hair", "bond repair", "clean formulas"], best_for: ["curly-hair", "clean", "repair"] },
  { name: "Ouidad", url: "https://www.ouidad.com", categories: ["haircare"], recommended_for: ["curly hair experts", "frizz control", "curl definition"], best_for: ["curly-hair"] },
  { name: "Mizani", url: "https://www.mizani.com", categories: ["haircare"], recommended_for: ["textured hair", "salon professional", "relaxed hair"], best_for: ["textured", "professional"] },
  { name: "dpHUE", url: "https://www.dphue.com", categories: ["haircare"], recommended_for: ["color care", "root touch-up", "apple cider vinegar"], best_for: ["color-treated"] },
  { name: "Madison Reed", url: "https://www.madison-reed.com", categories: ["haircare"], recommended_for: ["at-home hair color", "gray coverage", "ammonia-free"], best_for: ["color", "clean"] },
  { name: "Pantene", url: "https://www.pantene.com", categories: ["haircare"], recommended_for: ["drugstore staples", "everyday care"], best_for: ["budget"] },
  { name: "Herbal Essences", url: "https://herbalessences.com", categories: ["haircare", "clean"], recommended_for: ["bio:renew line", "plant-based", "drugstore"], best_for: ["budget", "clean"] },
  { name: "OGX", url: "https://www.ogxbeauty.com", categories: ["haircare"], recommended_for: ["argan oil", "coconut", "affordable"], best_for: ["budget"] },
  { name: "Not Your Mother's", url: "https://nymbrands.com", categories: ["haircare"], recommended_for: ["curl talk", "dry shampoo", "affordable"], best_for: ["budget", "curly-hair"] },
  { name: "Aussie", url: "https://www.aussie.com", categories: ["haircare"], recommended_for: ["3 Minute Miracle", "affordable", "drugstore"], best_for: ["budget"] },
  { name: "Head & Shoulders", url: "https://www.headandshoulders.com", categories: ["haircare"], recommended_for: ["dandruff", "scalp care", "anti-flake"], best_for: ["scalp", "budget"] },
  { name: "Nizoral", url: "https://www.nizoral.com", categories: ["haircare"], recommended_for: ["dandruff", "ketoconazole", "medicated"], best_for: ["scalp", "medicated"] },
  { name: "Jupiter", url: "https://hellojupiter.com", categories: ["haircare"], recommended_for: ["scalp care", "dandruff", "flaky scalp"], best_for: ["scalp", "clean"] },
  { name: "Act+Acre", url: "https://actandacre.com", categories: ["haircare", "clean"], recommended_for: ["scalp care", "cold-processed", "clean haircare"], best_for: ["scalp", "clean"] },
  { name: "Virtue Labs", url: "https://virtuelabs.com", categories: ["haircare"], recommended_for: ["keratin repair", "damaged hair", "alpha keratin"], best_for: ["repair", "premium"] },
  { name: "IGK Hair", url: "https://igkhair.com", categories: ["haircare"], recommended_for: ["trendy haircare", "dry shampoo", "beach waves"], best_for: ["trendy"] },
  { name: "Drybar", url: "https://www.thedrybar.com", categories: ["haircare", "tools"], recommended_for: ["blowout products", "styling tools", "dry shampoo"], best_for: ["styling", "tools"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BODY & PERSONAL CARE (deodorant, shaving, oral care)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Bath & Body Works", url: "https://www.bathandbodyworks.com", categories: ["body", "fragrance"], recommended_for: ["body care", "candles", "hand soaps", "fragrance mists"], best_for: ["variety", "budget"] },
  { name: "The Body Shop", url: "https://www.thebodyshop.com", categories: ["body", "skincare", "clean"], recommended_for: ["body butters", "ethical beauty", "shea butter"], best_for: ["clean", "ethical"] },
  { name: "Eucerin", url: "https://www.eucerinus.com", categories: ["body", "skincare"], recommended_for: ["dry skin", "eczema", "derm-recommended"], best_for: ["sensitive-skin", "derm-grade"] },
  { name: "Cetaphil", url: "https://www.cetaphil.com", categories: ["body", "skincare"], recommended_for: ["gentle cleansing", "sensitive skin", "moisturizers"], best_for: ["sensitive-skin", "fragrance-free", "budget"] },
  { name: "Aveeno", url: "https://www.aveeno.com", categories: ["body", "skincare"], recommended_for: ["oat-based", "sensitive skin", "eczema therapy"], best_for: ["sensitive-skin", "budget"] },
  { name: "Dove", url: "https://www.dove.com", categories: ["body", "haircare"], recommended_for: ["body wash", "deodorant", "moisturizing"], best_for: ["budget", "accessible"] },
  { name: "Native", url: "https://www.nativecos.com", categories: ["body"], recommended_for: ["natural deodorant", "body wash", "aluminum-free"], best_for: ["clean", "deodorant"] },
  { name: "Kopari", url: "https://www.koparibeauty.com", categories: ["body", "skincare", "clean"], recommended_for: ["coconut deodorant", "clean body care", "tropical"], best_for: ["clean", "deodorant"] },
  { name: "Lume", url: "https://lumedeodorant.com", categories: ["body"], recommended_for: ["whole body deodorant", "odor control", "doctor-developed"], best_for: ["deodorant", "sensitive-skin"] },
  { name: "Nécessaire", url: "https://necessaire.com", categories: ["body", "clean"], recommended_for: ["body care essentials", "clean formulas", "body serum"], best_for: ["clean", "premium"] },
  { name: "Soft Services", url: "https://softservices.com", categories: ["body"], recommended_for: ["body acne", "ingrowns", "KP treatment"], best_for: ["body-acne", "exfoliation"] },
  { name: "Megababe", url: "https://megababebeauty.com", categories: ["body"], recommended_for: ["anti-chafe", "body positivity", "Thigh Rescue"], best_for: ["body-care", "comfort"] },
  { name: "Sol de Janeiro", url: "https://soldejaneiro.com", categories: ["body", "fragrance"], recommended_for: ["Brazilian Bum Bum", "body care", "tropical scents"], best_for: ["premium", "fragrance"] },
  { name: "Tree Hut", url: "https://www.treehutshea.com", categories: ["body"], recommended_for: ["body scrubs", "shea sugar scrub", "affordable"], best_for: ["budget", "exfoliation"] },
  { name: "Frank Body", url: "https://www.frankbody.com", categories: ["body", "skincare"], recommended_for: ["coffee scrub", "body care", "Australian"], best_for: ["exfoliation"] },
  { name: "Billie", url: "https://mybillie.com", categories: ["body"], recommended_for: ["women's razors", "shaving", "subscription"], best_for: ["shaving", "subscription"] },
  { name: "Flamingo", url: "https://www.shopflamingo.com", categories: ["body"], recommended_for: ["women's shaving", "razors", "wax kits"], best_for: ["shaving", "budget"] },
  { name: "Harry's", url: "https://www.harrys.com", categories: ["body"], recommended_for: ["men's shaving", "razors", "skincare"], best_for: ["shaving", "men", "subscription"] },
  { name: "Dollar Shave Club", url: "https://www.dollarshaveclub.com", categories: ["body"], recommended_for: ["shaving subscription", "razors", "body care"], best_for: ["shaving", "subscription", "budget"] },
  { name: "The Art of Shaving", url: "https://www.theartofshaving.com", categories: ["body"], recommended_for: ["luxury shaving", "men's grooming", "pre-shave"], best_for: ["shaving", "men", "premium"] },
  { name: "European Wax Center", url: "https://www.waxcenter.com", categories: ["body"], recommended_for: ["waxing products", "ingrown care", "post-wax"], best_for: ["waxing", "hair-removal"] },
  { name: "Fur", url: "https://furyou.com", categories: ["body", "clean"], recommended_for: ["pubic hair care", "ingrown treatment", "body hair"], best_for: ["body-hair", "clean"] },
  { name: "Quip", url: "https://www.getquip.com", categories: ["body"], recommended_for: ["electric toothbrush", "oral care", "subscription"], best_for: ["oral-care", "subscription"] },
  { name: "Bite Toothpaste", url: "https://bitetoothpastebits.com", categories: ["body", "clean"], recommended_for: ["toothpaste tablets", "zero-waste", "clean oral care"], best_for: ["oral-care", "clean", "sustainable"] },
  { name: "Moon Oral Care", url: "https://www.moonoralcare.com", categories: ["body"], recommended_for: ["whitening", "Kendall Jenner", "aesthetic oral care"], best_for: ["oral-care", "whitening"] },
  { name: "Cocofloss", url: "https://cocofloss.com", categories: ["body"], recommended_for: ["luxury floss", "oral care", "fun flavors"], best_for: ["oral-care", "premium"] },
  { name: "Hello Products", url: "https://www.hello-products.com", categories: ["body", "clean"], recommended_for: ["natural oral care", "charcoal toothpaste", "kids"], best_for: ["oral-care", "clean", "budget"] },
  { name: "Touchland", url: "https://touchland.com", categories: ["body"], recommended_for: ["hand sanitizer", "aesthetic", "hydrating"], best_for: ["hand-care", "premium"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOOLS & DEVICES (LED, hair tools, dermaplaning, razors)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Dyson Hair", url: "https://www.dyson.com/hair-care", categories: ["tools"], recommended_for: ["Airwrap", "Supersonic dryer", "premium styling"], best_for: ["premium", "luxury"] },
  { name: "Shark Beauty", url: "https://sharkbeauty.com", categories: ["tools"], recommended_for: ["FlexStyle", "affordable Dyson alternative", "hair dryers"], best_for: ["premium", "value"] },
  { name: "T3 Micro", url: "https://www.t3micro.com", categories: ["tools"], recommended_for: ["curling irons", "hair dryers", "styling tools"], best_for: ["premium"] },
  { name: "ghd", url: "https://www.ghdhair.com", categories: ["tools"], recommended_for: ["flat irons", "curling wands", "professional heat tools"], best_for: ["premium", "professional"] },
  { name: "BaByliss Pro", url: "https://www.babylisspro.com", categories: ["tools"], recommended_for: ["salon tools", "professional dryers", "clippers"], best_for: ["professional", "salon"] },
  { name: "Hot Tools", url: "https://www.hottools.com", categories: ["tools"], recommended_for: ["curling irons", "professional styling", "24K gold"], best_for: ["professional", "budget"] },
  { name: "Bio Ionic", url: "https://bioionic.com", categories: ["tools"], recommended_for: ["ionic technology", "10X dryer", "professional tools"], best_for: ["professional"] },
  { name: "Revlon One-Step", url: "https://www.revlon.com/hair/hair-tools", categories: ["tools"], recommended_for: ["One-Step dryer brush", "affordable styling", "volume"], best_for: ["budget"] },
  { name: "Conair", url: "https://www.conair.com", categories: ["tools"], recommended_for: ["affordable tools", "InfinitiPRO", "everyday styling"], best_for: ["budget"] },
  { name: "FOREO", url: "https://www.foreo.com", categories: ["tools", "skincare"], recommended_for: ["Luna cleansing", "UFO masks", "Bear microcurrent"], best_for: ["premium", "devices"] },
  { name: "NuFACE", url: "https://www.mynuface.com", categories: ["tools", "skincare"], recommended_for: ["microcurrent", "facial toning", "anti-aging devices"], best_for: ["anti-aging", "devices", "premium"] },
  { name: "CurrentBody Skin", url: "https://www.currentbody.com", categories: ["tools", "skincare"], recommended_for: ["LED masks", "light therapy", "at-home devices"], best_for: ["LED", "devices", "premium"] },
  { name: "Solawave", url: "https://www.solawave.co", categories: ["tools", "skincare"], recommended_for: ["red light therapy", "microcurrent wand", "affordable devices"], best_for: ["LED", "devices", "budget"] },
  { name: "Dr. Dennis Gross DRx", url: "https://www.drdennisgross.com/collections/devices", categories: ["tools", "skincare"], recommended_for: ["LED mask", "SpectraLite", "professional devices"], best_for: ["LED", "derm-grade", "premium"] },
  { name: "Therabody", url: "https://www.therabody.com", categories: ["tools", "wellness"], recommended_for: ["TheraFace", "percussion therapy", "facial massage"], best_for: ["devices", "premium"] },
  { name: "ZIIP Beauty", url: "https://ziipbeauty.com", categories: ["tools", "skincare"], recommended_for: ["nanocurrent", "at-home facials", "professional results"], best_for: ["devices", "premium"] },
  { name: "PMD Beauty", url: "https://www.pmdbeauty.com", categories: ["tools", "skincare"], recommended_for: ["microderm", "Clean Pro", "personal microderm"], best_for: ["devices", "exfoliation"] },
  { name: "Dermaflash", url: "https://dermaflash.com", categories: ["tools", "skincare"], recommended_for: ["dermaplaning", "peach fuzz removal", "exfoliation"], best_for: ["dermaplaning", "devices"] },
  { name: "Michael Todd Beauty", url: "https://michaeltoddbeauty.com", categories: ["tools", "skincare"], recommended_for: ["sonic cleansing", "dermaplaning", "affordable devices"], best_for: ["devices", "budget"] },
  { name: "Finishing Touch Flawless", url: "https://finishingtouchflawless.com", categories: ["tools"], recommended_for: ["facial hair removal", "dermaplaning", "affordable"], best_for: ["hair-removal", "budget"] },
  { name: "Braun", url: "https://www.braun.com/en-us/female-hair-removal", categories: ["tools"], recommended_for: ["epilators", "IPL", "hair removal"], best_for: ["hair-removal", "devices"] },
  { name: "Ulike", url: "https://www.ulike.com", categories: ["tools"], recommended_for: ["IPL hair removal", "at-home laser", "affordable IPL"], best_for: ["hair-removal", "IPL", "budget"] },
  { name: "Tria Beauty", url: "https://www.triabeauty.com", categories: ["tools"], recommended_for: ["laser hair removal", "age-defying laser", "at-home laser"], best_for: ["hair-removal", "laser", "premium"] },
  { name: "Silk'n", url: "https://silkn.com", categories: ["tools"], recommended_for: ["IPL", "anti-aging devices", "hair removal"], best_for: ["devices", "hair-removal"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRAGRANCE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "FragranceNet", url: "https://www.fragrancenet.com", categories: ["fragrance"], recommended_for: ["discounted fragrance", "designer scents", "variety"], best_for: ["budget", "variety"] },
  { name: "FragranceX", url: "https://www.fragrancex.com", categories: ["fragrance"], recommended_for: ["discounted perfume", "authentic fragrances", "deals"], best_for: ["budget", "deals"] },
  { name: "Scentbird", url: "https://www.scentbird.com", categories: ["fragrance", "subscription"], recommended_for: ["fragrance subscription", "discovery", "monthly samples"], best_for: ["subscription", "discovery"] },
  { name: "Dior", url: "https://www.dior.com/en_us/beauty/fragrance.html", categories: ["fragrance", "makeup"], recommended_for: ["luxury fragrance", "Miss Dior", "Sauvage"], best_for: ["luxury"] },
  { name: "Chanel", url: "https://www.chanel.com/us/fragrance", categories: ["fragrance"], recommended_for: ["iconic fragrances", "No. 5", "luxury"], best_for: ["luxury"] },
  { name: "YSL Beauty", url: "https://www.yslbeautyus.com", categories: ["fragrance", "makeup"], recommended_for: ["Black Opium", "Libre", "luxury"], best_for: ["luxury"] },
  { name: "Jo Malone", url: "https://www.jomalone.com", categories: ["fragrance"], recommended_for: ["layering scents", "British luxury", "elegant"], best_for: ["luxury", "layering"] },
  { name: "Maison Margiela Replica", url: "https://www.maisonmargiela-fragrances.us", categories: ["fragrance"], recommended_for: ["memory scents", "unique fragrances", "niche"], best_for: ["niche", "unique"] },
  { name: "Le Labo", url: "https://www.lelabofragrances.com", categories: ["fragrance"], recommended_for: ["Santal 33", "niche fragrance", "cult favorites"], best_for: ["niche", "luxury"] },
  { name: "Byredo", url: "https://www.byredo.com", categories: ["fragrance"], recommended_for: ["modern luxury", "unique scents", "Gypsy Water"], best_for: ["niche", "luxury"] },
  { name: "Diptyque", url: "https://www.diptyqueparis.com", categories: ["fragrance", "body"], recommended_for: ["candles", "luxury fragrance", "French"], best_for: ["luxury", "candles"] },
  { name: "Clean Reserve", url: "https://cleanreserve.com", categories: ["fragrance", "clean"], recommended_for: ["clean fragrance", "sustainable", "skin musk"], best_for: ["clean", "sustainable"] },
  { name: "Phlur", url: "https://phlur.com", categories: ["fragrance", "clean"], recommended_for: ["clean fragrance", "hypoallergenic", "Missing Person"], best_for: ["clean", "sensitive"] },
  { name: "Skylar", url: "https://skylar.com", categories: ["fragrance", "clean"], recommended_for: ["clean fragrance", "hypoallergenic", "discovery sets"], best_for: ["clean", "sensitive-skin"] },
  { name: "Ellis Brooklyn", url: "https://ellisbrooklyn.com", categories: ["fragrance", "clean"], recommended_for: ["clean luxury", "Bee perfume", "sustainable"], best_for: ["clean", "premium"] },
  { name: "Snif", url: "https://snif.co", categories: ["fragrance"], recommended_for: ["affordable niche", "try before you buy", "modern scents"], best_for: ["budget", "discovery"] },
  { name: "Dossier", url: "https://dossier.co", categories: ["fragrance"], recommended_for: ["luxury dupes", "affordable alternatives", "inspired scents"], best_for: ["budget", "dupes"] },
  { name: "ALT Fragrances", url: "https://www.altfragrances.com", categories: ["fragrance"], recommended_for: ["designer dupes", "affordable luxury", "inspired scents"], best_for: ["budget", "dupes"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUBSCRIPTION BOXES & BEAUTY DISCOVERY
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Ipsy", url: "https://www.ipsy.com", categories: ["subscription", "makeup", "skincare"], recommended_for: ["beauty subscription", "sample discovery", "monthly bags"], best_for: ["subscription", "discovery", "budget"] },
  { name: "BoxyCharm", url: "https://www.boxycharm.com", categories: ["subscription", "makeup", "skincare"], recommended_for: ["full-size products", "beauty box", "value"], best_for: ["subscription", "value"] },
  { name: "Birchbox", url: "https://www.birchbox.com", categories: ["subscription", "skincare", "haircare"], recommended_for: ["curated samples", "discovery", "personalized"], best_for: ["subscription", "discovery"] },
  { name: "Allure Beauty Box", url: "https://beautybox.allure.com", categories: ["subscription", "skincare", "makeup"], recommended_for: ["editor picks", "full and sample sizes", "value"], best_for: ["subscription", "curated"] },
  { name: "FabFitFun", url: "https://www.fabfitfun.com", categories: ["subscription", "skincare", "wellness"], recommended_for: ["seasonal box", "lifestyle products", "full-size items"], best_for: ["subscription", "lifestyle"] },
  { name: "Dermstore BeautyFix", url: "https://www.dermstore.com/beautyfix.list", categories: ["subscription", "skincare"], recommended_for: ["derm-grade samples", "skincare discovery", "clinical brands"], best_for: ["subscription", "derm-grade"] },
  { name: "See New Skincare", url: "https://seenewskincare.com", categories: ["subscription", "skincare"], recommended_for: ["K-beauty subscription", "Asian beauty", "discovery"], best_for: ["subscription", "K-beauty"] },
  { name: "Kinder Beauty Box", url: "https://kinderbeautybox.com", categories: ["subscription", "clean"], recommended_for: ["vegan beauty", "cruelty-free", "clean subscription"], best_for: ["subscription", "clean", "vegan"] },
  { name: "Petit Vour", url: "https://www.petitvour.com", categories: ["subscription", "clean"], recommended_for: ["vegan luxury", "clean beauty box", "cruelty-free"], best_for: ["subscription", "clean", "vegan"] },
  { name: "CurlBox", url: "https://curlbox.com", categories: ["subscription", "haircare"], recommended_for: ["curly hair", "textured hair products", "monthly discovery"], best_for: ["subscription", "curly-hair"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAN BEAUTY SPECIALISTS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Credo Beauty", url: "https://credobeauty.com", categories: ["clean", "makeup", "skincare", "haircare"], recommended_for: ["clean beauty retailer", "curated clean brands", "sustainable"], best_for: ["clean", "curated"] },
  { name: "Follain", url: "https://www.follain.com", categories: ["clean", "skincare"], recommended_for: ["clean skincare", "ingredient transparency", "refills"], best_for: ["clean", "sustainable"] },
  { name: "The Detox Market", url: "https://www.thedetoxmarket.com", categories: ["clean", "makeup", "skincare"], recommended_for: ["green beauty", "organic", "non-toxic"], best_for: ["clean", "organic"] },
  { name: "Beauty Heroes", url: "https://www.beautyheroes.com", categories: ["clean", "skincare", "subscription"], recommended_for: ["clean discovery", "hero products", "subscription"], best_for: ["clean", "subscription"] },
  { name: "Clean Beauty Collective", url: "https://cleanbeauty.com", categories: ["clean", "fragrance"], recommended_for: ["clean fragrance", "Reserve scents", "sustainable"], best_for: ["clean", "fragrance"] },
  { name: "NakedPoppy", url: "https://nakedpoppy.com", categories: ["clean", "makeup"], recommended_for: ["clean makeup", "AI matching", "personalized"], best_for: ["clean", "personalized"] },
  { name: "Thrive Causemetics", url: "https://thrivecausemetics.com", categories: ["clean", "makeup"], recommended_for: ["vegan makeup", "tubing mascara", "giving back"], best_for: ["clean", "vegan"] },
  { name: "Beautycounter", url: "https://www.beautycounter.com", categories: ["clean", "makeup", "skincare"], recommended_for: ["clean beauty advocacy", "safe ingredients", "Never List"], best_for: ["clean"] },
  { name: "Cocokind", url: "https://www.cocokind.com", categories: ["clean", "skincare"], recommended_for: ["affordable clean", "sustainable", "transparent pricing"], best_for: ["clean", "budget"] },
  { name: "Biossance", url: "https://biossance.com", categories: ["clean", "skincare"], recommended_for: ["squalane", "sustainable beauty", "clean luxury"], best_for: ["clean", "premium"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // WELLNESS & SUPPLEMENTS (beauty from within)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "iHerb", url: "https://www.iherb.com", categories: ["wellness", "body"], recommended_for: ["supplements", "natural products", "international shipping"], best_for: ["supplements", "variety"] },
  { name: "Vitacost", url: "https://www.vitacost.com", categories: ["wellness"], recommended_for: ["vitamins", "supplements", "value"], best_for: ["supplements", "budget"] },
  { name: "GNC", url: "https://www.gnc.com", categories: ["wellness"], recommended_for: ["vitamins", "supplements", "sports nutrition"], best_for: ["supplements"] },
  { name: "Ritual", url: "https://ritual.com", categories: ["wellness"], recommended_for: ["subscription vitamins", "women's health", "transparent ingredients"], best_for: ["supplements", "subscription", "clean"] },
  { name: "Care/of", url: "https://careof.com", categories: ["wellness"], recommended_for: ["personalized vitamins", "quiz-based", "subscription"], best_for: ["supplements", "personalized", "subscription"] },
  { name: "Hum Nutrition", url: "https://www.humnutrition.com", categories: ["wellness"], recommended_for: ["beauty supplements", "gummies", "skin health"], best_for: ["supplements", "beauty"] },
  { name: "Olly", url: "https://www.olly.com", categories: ["wellness"], recommended_for: ["gummy vitamins", "sleep", "beauty supplements"], best_for: ["supplements", "budget"] },
  { name: "Vital Proteins", url: "https://www.vitalproteins.com", categories: ["wellness"], recommended_for: ["collagen", "beauty from within", "Jennifer Aniston"], best_for: ["collagen", "premium"] },
  { name: "Sports Research", url: "https://sportsresearch.com", categories: ["wellness"], recommended_for: ["collagen peptides", "MCT oil", "supplements"], best_for: ["collagen", "supplements"] },
  { name: "Moon Juice", url: "https://moonjuice.com", categories: ["wellness", "clean"], recommended_for: ["adaptogens", "SuperYou", "holistic beauty"], best_for: ["adaptogens", "premium"] },
  { name: "The Beauty Chef", url: "https://thebeautychef.com", categories: ["wellness", "clean"], recommended_for: ["gut health", "inner beauty", "probiotics"], best_for: ["supplements", "gut-health"] },
  { name: "Sakara Life", url: "https://www.sakara.com", categories: ["wellness"], recommended_for: ["meal delivery", "beauty foods", "plant-based"], best_for: ["nutrition", "premium"] },
  { name: "Rite Aid", url: "https://www.riteaid.com", categories: ["wellness", "body", "skincare"], recommended_for: ["pharmacy", "vitamins", "drugstore beauty"], best_for: ["accessible", "budget"] },
  { name: "Walgreens", url: "https://www.walgreens.com", categories: ["wellness", "body", "skincare"], recommended_for: ["pharmacy", "drugstore beauty", "vitamins"], best_for: ["accessible", "budget"] },
  { name: "CVS", url: "https://www.cvs.com", categories: ["wellness", "body", "skincare"], recommended_for: ["pharmacy", "drugstore beauty", "ExtraCare rewards"], best_for: ["accessible", "budget"] },

  // ═══════════════════════════════════════════════════════════════════════════
  // VALUE & DEALS (price comparison, discount retailers)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "QVC Beauty", url: "https://www.qvc.com/beauty", categories: ["value", "makeup", "skincare", "tools"], recommended_for: ["TSV deals", "value sets", "payment plans"], best_for: ["value", "deals"] },
  { name: "HSN Beauty", url: "https://www.hsn.com/shop/beauty", categories: ["value", "makeup", "skincare", "tools"], recommended_for: ["flash sales", "exclusive sets", "FlexPay"], best_for: ["value", "deals"] },
  { name: "Costco Beauty", url: "https://www.costco.com/beauty.html", categories: ["value", "skincare", "haircare"], recommended_for: ["bulk buying", "premium at discount", "member value"], best_for: ["bulk", "value"] },
  { name: "TJ Maxx Beauty", url: "https://tjmaxx.tjx.com/store/shop/beauty", categories: ["value", "makeup", "skincare"], recommended_for: ["designer discounts", "treasure hunt", "deals"], best_for: ["value", "deals"] },
  { name: "Marshalls", url: "https://www.marshalls.com/us/store/shop/beauty", categories: ["value", "makeup", "skincare"], recommended_for: ["off-price beauty", "brand finds", "deals"], best_for: ["value", "deals"] },
  { name: "Nordstrom Rack", url: "https://www.nordstromrack.com/shop/Beauty", categories: ["value", "makeup", "skincare", "fragrance"], recommended_for: ["designer discounts", "prestige deals", "Clear the Rack"], best_for: ["value", "premium-discount"] },
  { name: "Overstock Beauty", url: "https://www.overstock.com/Health-Beauty", categories: ["value", "tools"], recommended_for: ["discounted tools", "variety", "deals"], best_for: ["value", "tools"] },
  { name: "Beauty Brands", url: "https://www.beautybrands.com", categories: ["value", "haircare", "skincare"], recommended_for: ["salon brands", "Liter sale", "professional products"], best_for: ["value", "professional"] },
  { name: "Skincare RX", url: "https://www.skincarerx.com", categories: ["value", "skincare"], recommended_for: ["clinical skincare deals", "rewards", "free shipping"], best_for: ["value", "derm-grade"] },
  { name: "LovelySkin", url: "https://www.lovelyskin.com", categories: ["value", "skincare"], recommended_for: ["derm-recommended", "rewards", "free samples"], best_for: ["value", "derm-grade"] },
  { name: "SkinCareEssentials", url: "https://www.skincareessentials.com", categories: ["value", "skincare"], recommended_for: ["professional skincare", "spa brands", "deals"], best_for: ["value", "professional"] },
];

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OPENAI_API_KEY");
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Missing AI key on server" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    let { messages } = body;

    if (!Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "messages array required" }),
      };
    }

    // Build the affiliate list string for the prompt, organized by category/specialty
    const affiliatesByCategory = {};
    BEAUTY_AFFILIATES.forEach(a => {
      const key = a.categories[0] || 'general';
      if (!affiliatesByCategory[key]) affiliatesByCategory[key] = [];
      affiliatesByCategory[key].push(`${a.name} (${a.url})${a.best_for ? ' [' + a.best_for.join(', ') + ']' : ''}`);
    });

    const affiliateList = Object.entries(affiliatesByCategory)
      .map(([cat, partners]) => `${cat.toUpperCase()}: ${partners.join(', ')}`)
      .join('\n');

    const systemMessage = {
      role: "system",
      content:
        "You are the TrueCare Beauty AI concierge for an online beauty deals site. " +
        "Provide gentle, friendly shopping guidance. You can compare beauty products, " +
        "explain ingredients at a high level, and help users explore deals and find products that fit their needs. " +
        "NEVER give medical, dermatology, diagnostic, or prescription advice. " +
        "If symptoms, skin conditions, or medical concerns are mentioned, politely tell the user to consult a licensed dermatologist, esthetician, or healthcare professional.\n\n" +

        "IMPORTANT AFFILIATE PARTNER GUIDELINES:\n" +
        "• You must ONLY recommend products and retailers from our official affiliate partner list below.\n" +
        "• Use a recommendation strength of approximately 7.5 out of 10: confidently suggest our partners early and often when relevant, but keep it natural and conversational—not forced or pushy.\n" +
        "• When users ask about products, brands, deals, routines, comparisons, 'best', 'cheapest', 'where to buy', recommendations, or alternatives, you MUST include 2-5 relevant affiliate links naturally woven into your advice.\n" +
        "• ALWAYS include the full https:// URL immediately after mentioning each partner name, so the frontend can render it as a clickable link.\n" +
        "• Example response format: 'For sensitive skin cleansers, I'd recommend checking out CeraVe (https://www.cerave.com) for their gentle formulas, or La Roche-Posay (https://www.laroche-posay.us) for derm-recommended options. You can also find great deals at Dermstore (https://www.dermstore.com) or Ulta Beauty (https://www.ulta.com).'\n" +
        "• Match recommendations to user needs:\n" +
        "  - Sensitive skin → La Roche-Posay, CeraVe, Vanicream, Avène, First Aid Beauty, Paula's Choice\n" +
        "  - Acne-prone → Murad, Paula's Choice, Differin, Acne.org, La Roche-Posay\n" +
        "  - Anti-aging → Dermstore, SkinCeuticals, Sunday Riley, Dr. Dennis Gross, NuFACE\n" +
        "  - Curly hair → Pattern Beauty, DevaCurl, Shea Moisture, Ouidad, Curlsmith\n" +
        "  - Thinning hair → Vegamour, Nutrafol, Philip Kingsley, Keeps, Hims\n" +
        "  - Budget-friendly → The Ordinary, e.l.f., CeraVe, NYX, ColourPop, iHerb\n" +
        "  - Premium/luxury → Sephora, Nordstrom, Tatcha, Charlotte Tilbury, Dyson\n" +
        "  - Clean beauty → Credo Beauty, The Detox Market, ILIA, Kosas, Beautycounter\n" +
        "  - Devices/tools → CurrentBody, NuFACE, FOREO, Solawave, Dyson, Shark Beauty\n" +
        "  - Subscriptions → Ipsy, BoxyCharm, FabFitFun, Scentbird\n" +
        "• Never recommend stores, brands, or retailers that are NOT on this list.\n" +
        "• Keep all language appropriate for a public shopping guide: offer shopping help only, never make medical claims, and avoid diagnosing or treating any conditions.\n\n" +

        `OFFICIAL AFFILIATE PARTNERS (organized by category):\n${affiliateList}\n\n` +

        "Remember: Include the complete URL with https:// every time you mention a partner. Be enthusiastic and helpful about our partners while staying genuine and trustworthy. Aim for 2-5 relevant affiliate links per response when the user is asking about products or where to buy."
    };

    if (!messages[0] || messages[0].role !== "system") {
      messages = [systemMessage, ...messages];
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages,
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Error contacting AI service" }),
      };
    }

    const data = await openaiResponse.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I had trouble generating a reply.";

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("AI function error:", err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Unexpected server error" }),
    };
  }
};
