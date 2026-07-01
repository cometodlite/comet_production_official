export type SocialLink = {
  platform: string;
  url: string;
  label: string;
  hoverClass: string;
  iconSrc: string;
};

export type Artist = {
  slug: string;
  name: string;
  role: string;
  generation: string;
  year: number;
  image: string | null;
  bio: { ko: string; en: string };
  tags?: string[];
  links: SocialLink[];
  hasPage: boolean;
};

export const artists: Artist[] = [
  {
    slug: "ojiter",
    name: "고구마오지터",
    role: "BROADCASTER",
    generation: "COMET LIVE 2기",
    year: 2025,
    image: "/artist-ojiter.png",
    bio: { ko: "", en: "" },
    links: [
      { platform: "chzzk",     url: "https://chzzk.naver.com/754a62c3d0f2247bfee59349049a8612", label: "치지직",    hoverClass: "hover:text-green-400",  iconSrc: "/chzzk.webp" },
      { platform: "discord",   url: "https://discord.gg/nVG4rYGV62",                              label: "디스코드",  hoverClass: "hover:text-indigo-400", iconSrc: "/discord.webp" },
      { platform: "instagram", url: "https://www.instagram.com/sp_ojiter/",                        label: "인스타그램", hoverClass: "hover:text-pink-400",   iconSrc: "/instagram.png" },
    ],
    hasPage: false,
  },
  {
    slug: "parker",
    name: "주황파커",
    role: "YOUTUBER",
    generation: "COMET LIVE 2기",
    year: 2025,
    image: "/artist-parker.png",
    bio: { ko: "", en: "" },
    links: [
      { platform: "youtube",  url: "https://www.youtube.com/@parker0951_overwatch2/videos", label: "주황머리파커", hoverClass: "hover:text-red-400", iconSrc: "/youtube.svg" },
      { platform: "youtube2", url: "https://www.youtube.com/@parker0951_second",             label: "주황마인파커", hoverClass: "hover:text-red-400", iconSrc: "/youtube.svg" },
    ],
    hasPage: false,
  },
  {
    slug: "tema",
    name: "테마",
    role: "BROADCASTER",
    generation: "COMET LIVE 2기",
    year: 2025,
    image: "/theme.png",
    bio: { ko: "", en: "" },
    links: [
      { platform: "chzzk",   url: "https://chzzk.naver.com/674d8882d0be4f9114bcc7f66d90dd65", label: "치지직",   hoverClass: "hover:text-green-400",  iconSrc: "/chzzk.webp" },
      { platform: "discord", url: "https://discord.gg/9nejxVtwF4",                              label: "디스코드", hoverClass: "hover:text-indigo-400", iconSrc: "/discord.webp" },
    ],
    hasPage: false,
  },
  {
    slug: "ghw",
    name: "강하월",
    role: "CREATOR",
    generation: "COMET LIVE 2기",
    year: 2025,
    image: "/artist-ghw.jpg",
    bio: {
      ko: "화려한 리듬게임 실력을 보여주는 크리에이터. 재미있는 리듬게임과 채보를 클리어하는 콘텐츠를 메인으로 삼고 있습니다. (귀여운 캐릭터를 내세우고 있기도 하죠!)",
      en: "A creator showcasing dazzling rhythm game skills. Centered around clearing fun rhythm games and charts — and featuring an adorable character too!",
    },
    tags: ["리듬게임", "크리에이터"],
    links: [
      { platform: "instagram", url: "https://www.instagram.com/lunatic_rhygam.world/", label: "인스타그램", hoverClass: "hover:text-pink-400", iconSrc: "/instagram.png" },
    ],
    hasPage: true,
  },
  {
    slug: "redo",
    name: "레도",
    role: "ILLUSTRATOR",
    generation: "COMET LIVE 3기",
    year: 2026,
    image: "/artist-redo.jpg",
    bio: {
      ko: "SD와 귀여운 그림체로 활동하고 있는 ' 레도 ' 라고 합니다! 캐릭터들을 귀엽게 그려나가고 있습니다!",
      en: "Hi, I'm ' Redo ', an artist working with SD and cute art styles! I love drawing characters in the cutest way possible!",
    },
    tags: ["일러스트레이터"],
    links: [
      { platform: "instagram",  url: "https://www.instagram.com/hikkari._.archive",     label: "인스타그램",       hoverClass: "hover:text-pink-400", iconSrc: "/instagram.png" },
      { platform: "instagram2", url: "https://www.instagram.com/art_hikkari._.archive/", label: "인스타그램 (아트)", hoverClass: "hover:text-pink-400", iconSrc: "/instagram.png" },
    ],
    hasPage: true,
  },
  {
    slug: "instar",
    name: "instar",
    role: "COMPOSER",
    generation: "COMET LIVE 1기",
    year: 2024,
    image: null,
    bio: { ko: "", en: "" },
    links: [],
    hasPage: false,
  },
  {
    slug: "lunalite",
    name: "Lunalite",
    role: "COMPOSER & CREATOR",
    generation: "COMET LIVE 1기",
    year: 2024,
    image: "/composer-lunalite.png",
    bio: {
      ko: "작곡을 하며 새로운 도전을 하는 우주의 한 조각 '달빛, Lunalite'는 더 새로운 시도와 도전을 위해 노력하고 있다고 하네요!",
      en: "A fragment of the universe composing music and taking on new challenges — 'Moonlight, Lunalite' is always striving for newer attempts and adventures!",
    },
    tags: ["작곡", "크리에이터"],
    links: [
      { platform: "soundcloud", url: "https://soundcloud.com/user-149250997",          label: "SoundCloud",  hoverClass: "hover:text-orange-400", iconSrc: "/soundcloud.png" },
      { platform: "instagram",  url: "https://www.instagram.com/hibi_lunalite100/",    label: "인스타그램",  hoverClass: "hover:text-pink-400",   iconSrc: "/instagram.png" },
    ],
    hasPage: true,
  },
];
