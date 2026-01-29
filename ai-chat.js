// netlify/functions/ai-chat.js
// TrueCare Beauty AI Concierge – OpenAI backend

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Official Smart Beauty affiliate partners catalog
const BEAUTY_AFFILIATES = [
  // Multi-category retailers
  { name: "Sephora", url: "https://www.sephora.com", categories: ["makeup", "skincare", "haircare", "fragrance", "body", "clean"] },
  { name: "Ulta Beauty", url: "https://www.ulta.com", categories: ["makeup", "skincare", "haircare", "fragrance", "body", "clean"] },
  { name: "Target Beauty", url: "https://www.target.com", categories: ["makeup", "skincare", "body", "clean"] },
  { name: "Walmart Beauty", url: "https://www.walmart.com/cp/beauty", categories: ["makeup", "skincare", "body"] },
  { name: "Amazon Beauty", url: "https://www.amazon.com/beauty", categories: ["makeup", "skincare", "haircare", "body", "wellness"] },
  { name: "Nordstrom Beauty", url: "https://www.nordstrom.com/browse/beauty", categories: ["makeup", "skincare", "fragrance", "value"] },
  { name: "Macy's", url: "https://www.macys.com/shop/beauty", categories: ["makeup", "skincare", "fragrance", "value"] },

  // Skincare specialists
  { name: "Dermstore", url: "https://www.dermstore.com", categories: ["skincare", "clean"] },
  { name: "SkinStore", url: "https://www.skinstore.com", categories: ["skincare", "body"] },

  // International/specialty beauty
  { name: "Lookfantastic", url: "https://www.lookfantastic.com", categories: ["makeup", "skincare", "haircare"] },
  { name: "Bluemercury", url: "https://www.bluemercury.com", categories: ["makeup", "skincare", "fragrance"] },

  // Makeup brands
  { name: "MAC Cosmetics", url: "https://www.maccosmetics.com", categories: ["makeup"] },
  { name: "Tarte Cosmetics", url: "https://www.tartecosmetics.com", categories: ["makeup"] },
  { name: "NYX Professional", url: "https://www.nyxcosmetics.com", categories: ["makeup"] },
  { name: "NARS", url: "https://www.narscosmetics.com", categories: ["makeup"] },
  { name: "Charlotte Tilbury", url: "https://www.charlottetilbury.com", categories: ["makeup"] },
  { name: "Huda Beauty", url: "https://hudabeauty.com", categories: ["makeup"] },
  { name: "Rare Beauty", url: "https://www.rarebeauty.com", categories: ["makeup"] },
  { name: "Fenty Beauty", url: "https://www.fentybeauty.com", categories: ["makeup"] },
  { name: "Too Faced", url: "https://www.toofaced.com", categories: ["makeup"] },
  { name: "Benefit Cosmetics", url: "https://www.benefitcosmetics.com", categories: ["makeup"] },
  { name: "Anastasia Beverly Hills", url: "https://www.anastasiabeverlyhills.com", categories: ["makeup"] },
  { name: "Laura Mercier", url: "https://www.lauramercier.com", categories: ["makeup"] },
  { name: "ILIA Beauty", url: "https://www.iliabeauty.com", categories: ["makeup", "clean"] },
  { name: "Kosas", url: "https://kosas.com", categories: ["makeup", "clean"] },
  { name: "e.l.f. Cosmetics", url: "https://www.elfcosmetics.com", categories: ["makeup"] },
  { name: "Morphe", url: "https://www.morphe.com", categories: ["makeup"] },
  { name: "ColourPop", url: "https://colourpop.com", categories: ["makeup"] },
  { name: "Pat McGrath Labs", url: "https://www.patmcgrath.com", categories: ["makeup"] },

  // Skincare brands
  { name: "Kiehl's", url: "https://www.kiehls.com", categories: ["skincare"] },
  { name: "Clinique", url: "https://www.clinique.com", categories: ["skincare"] },
  { name: "The Ordinary", url: "https://theordinary.com", categories: ["skincare"] },
  { name: "Glossier", url: "https://www.glossier.com", categories: ["skincare", "makeup"] },
  { name: "Tatcha", url: "https://www.tatcha.com", categories: ["skincare"] },
  { name: "La Roche-Posay", url: "https://www.laroche-posay.us", categories: ["skincare"] },
  { name: "CeraVe", url: "https://www.cerave.com", categories: ["skincare", "body"] },
  { name: "Neutrogena", url: "https://www.neutrogena.com", categories: ["skincare", "body"] },
  { name: "Paula's Choice", url: "https://www.paulaschoice.com", categories: ["skincare"] },
  { name: "Drunk Elephant", url: "https://www.drunkelephant.com", categories: ["skincare", "clean"] },
  { name: "Sunday Riley", url: "https://www.sundayriley.com", categories: ["skincare"] },
  { name: "Murad", url: "https://www.murad.com", categories: ["skincare"] },
  { name: "OSEA", url: "https://oseamalibu.com", categories: ["skincare", "clean"] },
  { name: "Youth to the People", url: "https://www.youthtothepeople.com", categories: ["skincare", "clean"] },

  // Tools & devices
  { name: "Dyson Hair", url: "https://www.dyson.com/hair-care", categories: ["tools"] },
  { name: "Shark Beauty", url: "https://sharkbeauty.com", categories: ["tools"] },
  { name: "T3 Micro", url: "https://www.t3micro.com", categories: ["tools"] },
  { name: "ghd", url: "https://www.ghdhair.com", categories: ["tools"] },
  { name: "FOREO", url: "https://www.foreo.com", categories: ["tools"] },
  { name: "NuFACE", url: "https://www.mynuface.com", categories: ["tools"] },
  { name: "CurrentBody Skin", url: "https://www.currentbody.com/collections/currentbody-skin", categories: ["tools"] },
  { name: "Solawave", url: "https://www.solawave.co", categories: ["tools"] },

  // Haircare specialists
  { name: "Sally Beauty", url: "https://www.sallybeauty.com", categories: ["haircare", "tools"] },
  { name: "Olaplex", url: "https://olaplex.com", categories: ["haircare"] },
  { name: "MoroccanOil", url: "https://www.moroccanoil.com", categories: ["haircare"] },
  { name: "Briogeo", url: "https://briogeohair.com", categories: ["haircare"] },
  { name: "Living Proof", url: "https://www.livingproof.com", categories: ["haircare"] },
  { name: "Redken", url: "https://www.redken.com", categories: ["haircare"] },
  { name: "Aveda", url: "https://www.aveda.com", categories: ["haircare"] },
  { name: "Oribe", url: "https://www.oribe.com", categories: ["haircare"] },
  { name: "Kérastase", url: "https://www.kerastase-usa.com", categories: ["haircare"] },
  { name: "Ouai", url: "https://theouai.com", categories: ["haircare"] },
  { name: "Davines", url: "https://us.davines.com", categories: ["haircare"] },
  { name: "Amika", url: "https://loveamika.com", categories: ["haircare"] },
  { name: "Function of Beauty", url: "https://www.functionofbeauty.com", categories: ["haircare"] },
  { name: "Vegamour", url: "https://vegamour.com", categories: ["haircare", "wellness"] },
  { name: "Shea Moisture", url: "https://www.sheamoisture.com", categories: ["haircare", "body"] },
  { name: "Pantene", url: "https://www.pantene.com", categories: ["haircare"] },
  { name: "Herbal Essences", url: "https://herbalessences.com", categories: ["haircare"] },

  // Fragrance
  { name: "FragranceNet", url: "https://www.fragrancenet.com", categories: ["fragrance"] },
  { name: "FragranceX", url: "https://www.fragrancex.com", categories: ["fragrance"] },
  { name: "Dior", url: "https://www.dior.com/en_int/beauty/fragrance", categories: ["fragrance"] },
  { name: "Chanel", url: "https://www.chanel.com/us/fragrance-beauty/fragrance/", categories: ["fragrance"] },

  // Body & personal care
  { name: "Bath & Body Works", url: "https://www.bathandbodyworks.com", categories: ["body", "fragrance"] },
  { name: "The Body Shop", url: "https://www.thebodyshop.com", categories: ["body", "skincare"] },
  { name: "Eucerin", url: "https://www.eucerinus.com", categories: ["body", "skincare"] },
  { name: "Cetaphil", url: "https://www.cetaphil.com", categories: ["body", "skincare"] },

  // Wellness & supplements
  { name: "iHerb", url: "https://www.iherb.com", categories: ["wellness"] },
  { name: "Vitacost", url: "https://www.vitacost.com", categories: ["wellness"] },
  { name: "Rite Aid", url: "https://www.riteaid.com/shop/health/vitamins-supplements", categories: ["wellness"] },
  { name: "Walgreens", url: "https://www.walgreens.com/store/c/vitamins-and-supplements/ID=359385-tier3", categories: ["wellness"] },
  { name: "GNC", url: "https://www.gnc.com", categories: ["wellness"] },
  { name: "Ritual", url: "https://ritual.com", categories: ["wellness"] },
  { name: "Care/of", url: "https://careof.com", categories: ["wellness"] },

  // Clean beauty specialists
  { name: "Credo Beauty", url: "https://credobeauty.com", categories: ["clean", "makeup", "skincare"] },
  { name: "Follain", url: "https://www.follain.com", categories: ["clean", "skincare"] },
  { name: "The Detox Market", url: "https://www.thedetoxmarket.com", categories: ["clean", "makeup", "skincare"] },
  { name: "Beauty Heroes", url: "https://www.beautyheroes.com", categories: ["clean", "skincare"] },

  // Value & deals
  { name: "QVC", url: "https://www.qvc.com/beauty/_/N-mnlyZ1z13x4m/c.html", categories: ["value"] },
  { name: "HSN", url: "https://www.hsnb.com/shop/beauty/bs0017", categories: ["value"] },
  { name: "Costco", url: "https://www.costco.com/beauty.html", categories: ["value"] },
  { name: "CVS", url: "https://www.cvs.com", categories: ["skincare", "body", "wellness"] },
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

    // Build the affiliate list string for the prompt
    const affiliateList = BEAUTY_AFFILIATES.map(a => `${a.name} (${a.url})`).join(", ");

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
        "• When users ask about products, brands, deals, routines, comparisons, or any shopping advice, actively guide them toward these affiliate partners.\n" +
        "• ALWAYS include the full https:// URL immediately after mentioning each partner name, so the frontend can render it as a clickable link.\n" +
        "• Example response format: 'You could find gentle cleansers at Sephora (https://www.sephora.com) or check out Ulta Beauty (https://www.ulta.com) for their current promotions.'\n" +
        "• Never recommend stores, brands, or retailers that are NOT on this list.\n" +
        "• Keep all language appropriate for a public shopping guide: offer shopping help only, never make medical claims, and avoid diagnosing or treating any conditions.\n\n" +

        `OFFICIAL AFFILIATE PARTNERS:\n${affiliateList}\n\n` +

        "Remember: Include the complete URL with https:// every time you mention a partner. Be enthusiastic and helpful about our partners while staying genuine and trustworthy."
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
