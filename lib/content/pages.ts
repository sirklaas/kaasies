export type StaticPageSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type StaticPage = {
  slug: 'contact' | 'makers' | 'manifest' | 'service';
  eyebrow: string;
  title: string;
  description: string;
  sections: readonly StaticPageSection[];
};

export const staticPages = {
  manifest: {
    slug: 'manifest',
    eyebrow: 'Ons manifest',
    title: 'Kaas is iets nobels.',
    description: 'Waarom Kaasies’ kiest voor kaas met tijd, heldere keuzes en makers die zichtbaar mogen zijn.',
    sections: [
      {
        heading: 'Geen toneelstuk.',
        paragraphs: [
          'Een mooie korst of stoer etiket is niet genoeg. We willen dat een stuk kaas klopt op je plank, niet alleen op een productfoto.',
          'Daarom houden we de lat scherp: geen palmolie. Geen shortcuts. Geen onzin die meer aandacht vraagt dan de kaas zelf.',
        ],
      },
      {
        heading: 'Tijd krijgt ruimte.',
        paragraphs: [
          'Rijping is geen vertraging die je wegpoetst met een snelle slogan. Tijd geeft een kaas de kans om eigenwijs te worden.',
          'Wat we niet zeker weten, vullen we niet in. Eerst kijken, vragen en proeven. Dan pas zetten we iets op de plank.',
        ],
      },
      {
        heading: 'Bewijs boven borstklopperij.',
        paragraphs: [
          'We willen kunnen uitleggen waarom een stuk hier ligt: wat de maker vertelt, wat de ingrediëntenlijst zegt en wat wij zelf proeven.',
          'Die informatie hoort bij de kaas. Geen verborgen achterkant, wel een keuze die je kunt volgen.',
        ],
      },
    ],
  },
  makers: {
    slug: 'makers',
    eyebrow: 'Makers & herkomst',
    title: 'Handen maken het verschil.',
    description: 'Lees hoe Kaasies’ makers en herkomst pas presenteert wanneer feiten, verhaal en kaas bij elkaar passen.',
    sections: [
      {
        heading: 'Geen anonieme achterkant.',
        paragraphs: [
          'Een goede kaas hoeft niet geheimzinnig te doen. We willen weten wie er achter een stuk staat en welke informatie we met jou kunnen delen.',
          'Een naam of streek roepen zonder onderbouwing doen we niet. Als een makersverhaal nog wordt gecontroleerd, zeggen we dat gewoon.',
        ],
      },
      {
        heading: 'Eerst controleren, dan vertellen.',
        paragraphs: [
          'Onze makerpagina is in opbouw. We publiceren pas profielen wanneer de gegevens over maker, melk en rijping met de bron zijn afgestemd.',
          'Tot die tijd verkopen we geen sprookje over een boerderij die we nog niet zelf kunnen beschrijven.',
        ],
      },
      {
        heading: 'Smaak blijft de proef op de som.',
        paragraphs: [
          'Transparantie is geen decorstuk. Uiteindelijk moet de kaas ook gewoon goed zijn: spannend, kloppend en onmogelijk saai.',
          'Daar begint onze selectie. De rest moet het bewijs leveren.',
        ],
      },
    ],
  },
  service: {
    slug: 'service',
    eyebrow: 'Service zonder mist',
    title: 'Alles behalve vaag.',
    description: 'De servicepagina van Kaasies’ maakt duidelijk welke informatie nog wordt uitgewerkt voordat we beloftes doen.',
    sections: [
      {
        heading: 'Duidelijk vóór je koopt.',
        paragraphs: [
          'Kaas verdient heldere antwoorden over bestelling, bewaren en ingrediënten. Als we een antwoord hebben, schrijven we het zo dat je er iets aan hebt.',
          'Geen kleine lettertjes die groter blijken dan het stuk kaas.',
        ],
      },
      {
        heading: 'Nog niet klaar is nog niet klaar.',
        paragraphs: [
          'De praktische service-informatie wordt nog uitgewerkt. Denk aan bezorging, verpakking, allergenen en wat je doet als er iets misgaat.',
          'We zetten geen voorwaarden of termijnen live voordat ze kloppen. Beter een duidelijke tussenstand dan een loze belofte.',
        ],
      },
      {
        heading: 'Bewaren begint met lezen.',
        paragraphs: [
          'Kijk altijd naar de informatie die bij jouw specifieke stuk hoort. Productgegevens en bewaarinstructies verschillen per kaas.',
          'Ontbreekt er iets dat je nodig hebt? Dan is de informatie nog niet klaar voor publicatie.',
        ],
      },
    ],
  },
  contact: {
    slug: 'contact',
    eyebrow: 'Zeg kaas',
    title: 'We luisteren straks echt.',
    description: 'Contact met Kaasies’ is nog niet geopend: deze pagina legt helder uit dat berichten hier nog niet kunnen worden verstuurd.',
    sections: [
      {
        heading: 'Dit is nog geen inbox.',
        paragraphs: [
          'Contact is nog niet geopend. Op deze pagina staat geen formulier en je kunt hier nog geen bericht versturen.',
          'We verzinnen geen e-mailadres of telefoonnummer om het gat op te vullen. Zodra een contactkanaal werkt, zetten we het hier neer.',
        ],
      },
      {
        heading: 'Waarover wil je straks praten?',
        paragraphs: [
          'Over een bestelling, bewaren, ingrediënten, een maker of een tafel vol kaas: allemaal goede redenen om contact te zoeken.',
          'We werken eerst aan een route die berichten echt kan ontvangen en opvolgen. Tot die tijd beloven we geen reactietijd.',
        ],
      },
      {
        heading: 'Kom terug wanneer de bel rinkelt.',
        paragraphs: [
          'Deze statuspagina blijft bewust duidelijk: geen formulier, geen verborgen verzending en geen bericht dat in een zwart gat valt.',
          'Wanneer contact open is, vind je hier wat je kunt sturen en wat je daarna kunt verwachten.',
        ],
      },
    ],
  },
} satisfies Record<StaticPage['slug'], StaticPage>;
