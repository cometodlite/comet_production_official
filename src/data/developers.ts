export type DevWorkStatus = "live" | "development" | "beta" | "ending" | "discontinued" | "abandoned";

export const STATUS_META: Record<DevWorkStatus, { ko: string; en: string; className: string }> = {
  live:         { ko: "운영 중",         en: "Live",              className: "text-green-300 border-green-500/30 bg-green-500/10" },
  development:  { ko: "개발 중",         en: "In Development",    className: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
  beta:         { ko: "베타 서비스 예정", en: "Beta Coming Soon",  className: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" },
  ending:       { ko: "서비스 종료 예정", en: "Service Ending",    className: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  discontinued: { ko: "개발 중단",       en: "Discontinued",      className: "text-orange-300 border-orange-500/30 bg-orange-500/10" },
  abandoned:    { ko: "폐기",           en: "Abandoned",         className: "text-white/40 border-white/15 bg-white/5" },
};

export type DevWork = {
  name: string;
  description?: { ko: string; en: string };
  status: DevWorkStatus;
  url?: string;
};

export type DevOtherGroup = {
  label: { ko: string; en: string };
  items: { name: string; description?: { ko: string; en: string } }[];
};

export type Developer = {
  slug: string;
  name: string;
  role: { ko: string; en: string };
  number: string;
  description: { ko: string; en: string };
  specialties: string[];
  games: DevWork[];
  web: DevWork[];
  other: DevOtherGroup[];
  hasPage: boolean;
};

export const developers: Developer[] = [
  {
    slug: "yure0211",
    name: "yure0211",
    role: { ko: "게임 개발자", en: "Game Developer" },
    number: "01",
    description: {
      ko: "개발·기획·총괄 디렉팅을 아우르며, 음성합성엔진 조교로도 활동합니다. Unity 기반 게임 개발과 시스템·시나리오 기획에 강점을 갖고 있습니다. 대표 작업물은 KE 활동 특성상 비공개입니다.",
      en: "Spans development, planning, and overall directing, and also serves as a voice-synthesis engine assistant. Strong in Unity-based game development and system/scenario planning. Representative works are kept confidential due to the nature of KE Group activities.",
    },
    specialties: ["UNITY / C# / C++", "KOTLIN · PYTHON · JS", "SYNTHESIZER V"],
    games: [],
    web: [],
    other: [],
    hasPage: false,
  },
  {
    slug: "luna-1o",
    name: "Luna-1o",
    role: { ko: "웹 개발자", en: "Web Developer" },
    number: "02",
    description: {
      ko: "HTML/CSS/JS와 React를 중심으로 웹사이트 및 관련 웹개발을 담당합니다. COMET PRODUCTION 웹사이트 전반과 Stutant 공부 보조 AI, StudyLab을 개발했으며, HCSiG 시리즈 등 웹게임도 개발했습니다.",
      en: "Builds websites and related web experiences with HTML/CSS/JS and React. Developed the COMET PRODUCTION website, Stutant study-assistant AI, StudyLab, and web games including the HCSiG series.",
    },
    specialties: ["HTML / CSS / JS", "REACT", "WEB GAMES"],
    games: [
      {
        name: "HCSiG",
        description: { ko: "해킹을 소재로 한 IDLE류 웹게임.", en: "An idle-style web game themed around hacking." },
        status: "live",
        url: "https://cometodlite.github.io/hacking-code-simulation-game/",
      },
      {
        name: "PULSE BLOOM",
        description: { ko: "꽃이 핀다라는 것을 모티브로 한 웹 기반 리듬게임.", en: "A web-based rhythm game motivated by blooming flowers." },
        status: "discontinued",
      },
      {
        name: "PROJECT: HW",
        description: { ko: "편안하게 플레이하기 좋은 힐링 게임.", en: "A healing game meant for comfortable, relaxing play." },
        status: "abandoned",
      },
      {
        name: "UTOPIA SYNDROME",
        description: { ko: "기괴한 괴생명체인 신드롬들을 피해 생존하는 생존게임.", en: "A survival game escaping bizarre creatures known as Syndromes." },
        status: "abandoned",
      },
      {
        name: "DREAM ON",
        description: { ko: "UNITED를 기반으로 만들어진 새로운 스토리의 MMORPG.", en: "An MMORPG with an original story, built on UNITED." },
        status: "abandoned",
      },
    ],
    web: [
      { name: "COMET PRODUCTION Co. 홈페이지", status: "live" },
      { name: "Study Lab", status: "ending" },
      { name: "Stutant", status: "beta" },
    ],
    other: [
      {
        label: { ko: "Minecraft 인게임 서버", en: "Minecraft In-Game Servers" },
        items: [
          { name: "CRAFTORIA: REALM QUEST", description: { ko: "26.1.2 자바 지원 + 최신 베드락 지원", en: "Java 26.1.2 support + latest Bedrock support" } },
          { name: "24/7 야생서버", description: { ko: "26.2 자바 지원", en: "Java 26.2 support" } },
        ],
      },
      {
        label: { ko: "Discord 보안 봇", en: "Discord Security Bot" },
        items: [
          { name: "하월아 도와줘" },
        ],
      },
    ],
    hasPage: true,
  },
];
