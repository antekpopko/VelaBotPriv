const axios = require("axios");

const PW_API = "https://api.psychonautwiki.org/graphql";

const effectsTranslate = {
  "Auditory hallucination": "Halucynacje słuchowe",
  "Auditory distortion": "Zniekształcenia dźwięku",
  "Geometry": "Geometria (wizje geometryczne)",
  "Pattern recognition enhancement": "Wzmocnienie rozpoznawania wzorców",
  "Empathy, affection and sociability enhancement": "Wzrost empatii, uczucia i towarzyskości",
  "Motivation enhancement": "Wzrost motywacji",
  "Double vision": "Podwójne widzenie",
  "Vibrating vision": "Wibrujące widzenie",
  "Tracers": "Ślady po ruchu (tracery)",
  "Symmetrical texture repetition": "Symetryczne powtarzanie tekstur",
  "Dehydration": "Odwodnienie",
  "Nausea": "Nudności",
  "Headache": "Ból głowy",
  "Vasoconstriction": "Zwężenie naczyń krwionośnych",
  "Difficulty urinating": "Trudności w oddawaniu moczu",
  "Temporary erectile dysfunction": "Tymczasowa dysfunkcja erekcji",
  "Spontaneous bodily sensations": "Spontaniczne odczucia ciała",
  "Physical euphoria": "Fizyczna euforia",
  "Pupil dilation": "Rozszerzenie źrenic",
  "Bronchodilation": "Rozszerzenie oskrzeli",
  "Excessive yawning": "Nadmierne ziewanie",
  "Thought acceleration": "Przyspieszenie myśli",
  "Rejuvenation": "Odnowa",
  "Ego inflation": "Nadmierne poczucie ego",
  "Dream potentiation": "Wzmocnienie snów",
  "External hallucination": "Halucynacje zewnętrzne",
  "Internal hallucination": "Halucynacje wewnętrzne",
  "Autonomous entity": "Autonomiczny byt",
  "Settings, sceneries, and landscapes": "Ustawienia, scenerie i krajobrazy",
  "Time distortion": "Zniekształcenie czasu",
  "Mindfulness": "Uważność",
  "Scenarios and plots": "Scenariusze i fabuły",
  "Unity and interconnectedness": "Jedność i powiązania",
  "Cognitive euphoria": "Kognitywna euforia",
  "Depression": "Depresja",
  "Anxiety": "Lęk",
  "Irritability": "Drażliwość",
  "Thought deceleration": "Spowolnienie myśli",
  "Thought disorganization": "Dezorganizacja myśli",
  "Disinhibition": "Rozhamowanie",
  "Dream suppression": "Tłumienie snów",
  "Bodily control enhancement": "Wzmocnienie kontroli ciała",
  "Stimulation": "Stymulacja",
  "Wakefulness": "Czuwanie",
  "Temperature regulation suppression": "Zaburzenia regulacji temperatury",
  "Appetite suppression": "Tłumienie apetytu",
  "Pain relief": "Ulga w bólu",
  "Color enhancement": "Wzmocnienie kolorów",
  "Increased heart rate": "Przyspieszenie akcji serca",
  "Increased blood pressure": "Podwyższone ciśnienie krwi",
  "Muscle contractions": "Skurcze mięśni",
  "Increased perspiration": "Wzmożone pocenie się",
  "Peripheral information misinterpretation": "Błędna interpretacja informacji obwodowych",
  "Anxiety suppression": "Tłumienie lęku",
  "Increased music appreciation": "Zwiększona wrażliwość na muzykę",
  "Existential self-realization": "Egzystencjalne uświadomienie siebie",
  "Brain zaps": "Mózgowe „zapięcia”",
  "Seizure": "Napad padaczkowy",
  "Creativity enhancement": "Wzrost kreatywności",
  "Confusion": "Zamieszanie",
  "Abnormal heartbeat": "Nieprawidłowy rytm serca",
  "Dry mouth": "Suchość w ustach",
  "Teeth grinding": "Zgrzytanie zębami",
  "Compulsive redosing": "Przymus ponownego zażycia",
  "Cognitive fatigue": "Zmęczenie poznawcze",
  "Derealization": "Derealizacja",
  "Suicidal ideation": "Myśli samobójcze",
  "Increased bodily temperature": "Podwyższona temperatura ciała",
  "Neurotoxicity": "Neurotoksyczność",
  "Amnesia": "Amnezja",
  "Delirium": "Delirium",
  "Tinnitus": "Szumy uszne",
  "Emotion intensification": "Wzmocnienie emocji",
  "Decreased libido": "Obniżone libido",
  "Depression reduction": "Redukcja depresji",
  "8A Geometry - Perceived exposure to semantic concept network": "8A Geometria - Postrzeganie sieci semantycznych",
  "Perspective hallucination": "Halucynacje perspektywiczne",
  "Focus intensification": "Wzmocnienie koncentracji",
  "Immersion intensification": "Wzmocnienie zanurzenia",
  "Auditory acuity enhancement": "Wzrost ostrości słuchu",
  "Tactile intensification": "Wzmocnienie wrażeń dotykowych",
  "Stamina intensification": "Wzrost wytrzymałości",
  "Motivation depression": "Obniżenie motywacji",
  "Orgasm depression": "Obniżenie orgazmu",
  "Reinvigoration": "Ożywienie",
  "Emotion suppression": "Tłumienie emocji",
  "Dizziness": "Zawroty głowy",
  "Delusion": "Urojenia",
  "Memory suppression": "Tłumienie pamięci",
  "Perception of bodily heaviness": "Poczucie ciężkości ciała",
  "Sedation": "Sedacja",
  "Motor control loss": "Utrata kontroli ruchowej",
  "Respiratory depression": "Depresja oddechowa",
  "Muscle relaxation": "Rozluźnienie mięśni",
  "Confusion": "Dezorientacja",
  "Visual acuity suppression": "Obniżenie ostrości widzenia",
  "Sleepiness": "Senność",
  "Seizure suppression": "Tłumienie drgawek",
  "Euphoria": "Euforia",
  "Appetite intensification": "Wzmożony apetyt",
  "Analysis depression": "Obniżenie analizy",
  "Language depression": "Obniżenie zdolności językowych"
};

function translateEffects(effects) {
  if (!effects || effects.length === 0) return "Brak danych efektów.";
  return effects
    .map(e => effectsTranslate[e] || e)
    .join(", ");
}

async function fetchFromPsychonautWiki(substance) {
  const query = `
    query SubstanceInfo($name: String!) {
      substance(name: $name) {
        name
        description
        aliases
        administration {
          method
          dosage {
            threshold
            light
            common
            strong
            heavy
          }
          duration {
            onset
            peak
            offset
            afterglow
            total
          }
        }
        effects {
          common
          uncommon
          rare
        }
      }
    }
  `;

  try {
    const response = await axios.post(PW_API, {
      query,
      variables: { name: substance }
    });

    if (response.data.errors) {
      throw new Error("PsychonautWiki API error");
    }

    return response.data.data.substance || null;
  } catch (e) {
    return null;
  }
}

async function fetchFromWikipedia(substance) {
  try {
    const { data } = await axios.get(
      `https://pl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(substance)}`
    );
    return data.extract || null;
  } catch {
    return null;
  }
}

function formatDosage(dosage) {
  if (!dosage) return "Brak danych o dawkowaniu.";
  const parts = [];
  if (dosage.threshold) parts.push(`Próg: ${dosage.threshold}`);
  if (dosage.light) parts.push(`Lekka: ${dosage.light}`);
  if (dosage.common) parts.push(`Typowa: ${dosage.common}`);
  if (dosage.strong) parts.push(`Silna: ${dosage.strong}`);
  if (dosage.heavy) parts.push(`Duża: ${dosage.heavy}`);
  return parts.join(", ");
}

function formatDuration(duration) {
  if (!duration) return "Brak danych o czasie działania.";
  const parts = [];
  if (duration.onset) parts.push(`Początek: ${duration.onset}`);
  if (duration.peak) parts.push(`Szczyt: ${duration.peak}`);
  if (duration.offset) parts.push(`Spadek: ${duration.offset}`);
  if (duration.afterglow) parts.push(`Afterglow: ${duration.afterglow}`);
  if (duration.total) parts.push(`Całkowity czas: ${duration.total}`);
  return parts.join(" • ");
}

function formatAdministration(admin) {
  if (!admin || admin.length === 0) return "Brak danych o drodze podania.";
  return admin.map(a => {
    return `📍 *Droga podania:* ${a.method}\n🧮 *Dawkowanie:* ${formatDosage(a.dosage)}\n⏱️ *Czas działania:* ${formatDuration(a.duration)}`;
  }).join("\n\n");
}

module.exports.config = {
  name: "drgs",
  version: "1.0",
  credits: "Ullash + PsychonautWiki",
  hasPermssion: 0,
  description: "Info o substancjach psychoaktywnych z PsychonautWiki + Wikipedia",
  commandCategory: "informacje",
};

module.exports.run = async function ({ args, event, api }) {
  if (!args[0]) return api.sendMessage("Podaj nazwę substancji!", event.threadID, event.messageID);

  const query = args.join(" ").toLowerCase();

  const substanceData = await fetchFromPsychonautWiki(query);

  if (substanceData) {
    let msg = `🧪 Informacje o substancji: *${substanceData.name}*\n`;

    if (substanceData.aliases && substanceData.aliases.length)
      msg += `\n📝 Nazwy potoczne: ${substanceData.aliases.join(", ")}\n`;

    if (substanceData.description)
      msg += `\n📖 Opis:\n${substanceData.description}\n`;

    // Drogi podania + dawkowanie + czas działania
    msg += `\n${formatAdministration(substanceData.administration)}\n`;

    // Efekty
    const allEffects = [
      ...(substanceData.effects.common || []),
      ...(substanceData.effects.uncommon || []),
      ...(substanceData.effects.rare || []),
    ];
    msg += `\n✨ Efekty:\n${translateEffects(allEffects)}\n`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  } else {
    // Brak w PW, spróbuj Wikipedia PL
    const wikiSummary = await fetchFromWikipedia(query);
    if (wikiSummary) {
      return api.sendMessage(`📚 Nie znaleziono w PsychonautWiki. Oto opis z Wikipedii:\n\n${wikiSummary}`, event.threadID, event.messageID);
    } else {
      return api.sendMessage("Nie znaleziono informacji o tej substancji.", event.threadID, event.messageID);
    }
  }
};