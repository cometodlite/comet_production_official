export type StandardNewsArticle = {
  id: string;
  date: string;
  tag: string;
  accent: "amber" | "violet" | "blue" | "slate" | "emerald";
  title: string;
  englishTitle: string;
  summary: string;
  paragraphs: string[];
  facts?: { label: string; value: string }[];
  timeline?: { date: string; title: string; description: string }[];
};

export const standardNewsArticles: Record<string, StandardNewsArticle> = {
  "1": {
    id: "1",
    date: "2026.05.05",
    tag: "PRODUCTION",
    accent: "amber",
    title: "COMET PRODUCTION 공식 홈페이지 오픈",
    englishTitle: "COMET PRODUCTION Official Website Launch",
    summary: "COMET PRODUCTION의 공식 홈페이지가 오픈되었습니다.",
    paragraphs: [
      "COMET PRODUCTION은 브랜드의 비전과 소속 아티스트, 개발 프로젝트를 한눈에 확인할 수 있는 공식 홈페이지를 공개했습니다.",
      "홈페이지를 통해 그룹의 새 소식과 주요 프로젝트, 각 조직의 활동을 순차적으로 전달할 예정입니다.",
    ],
  },
  "2": {
    id: "2",
    date: "2026.05.05",
    tag: "ENTERTAINERS",
    accent: "violet",
    title: "COMET ENTERTAINERS 공식 출범",
    englishTitle: "COMET ENTERTAINERS Official Launch",
    summary: "COMET ENTERTAINERS가 공식 출범했습니다.",
    paragraphs: [
      "KE ENTERTAINMENT의 뒤를 이어 COMET ENTERTAINERS가 공식 출범했습니다. 아티스트 지원과 육성을 중심으로, 창작자가 자신만의 빛으로 성장할 수 있는 환경을 만들어갑니다.",
      "앞으로 소속 아티스트와 관련 활동 소식은 COMET PRODUCTION 공식 채널을 통해 안내됩니다.",
    ],
  },
  "3": {
    id: "3",
    date: "2026.05.05",
    tag: "DEVELOPS",
    accent: "blue",
    title: "COMET DEVELOPS 공식 출범",
    englishTitle: "COMET DEVELOPS Official Launch",
    summary: "게임 개발과 디지털 서비스를 담당하는 COMET DEVELOPS가 공식 출범했습니다.",
    paragraphs: [
      "COMET DEVELOPS는 게임 개발·배급과 웹 기반 디지털 경험을 담당하는 조직으로 공식 출범했습니다.",
      "HCSiG를 비롯한 웹게임과 다양한 독창적 프로젝트를 통해 새로운 디지털 경험을 선보일 계획입니다.",
    ],
  },
  "4": {
    id: "4",
    date: "2026.05.16",
    tag: "DEVELOPS",
    accent: "blue",
    title: "HCSiG II 개발 프로젝트 착수",
    englishTitle: "HCSiG II Development Project Begins",
    summary: "COMET DEVELOPS가 HCSiG의 후속 프로젝트인 HCSiG II 개발에 착수했습니다.",
    paragraphs: [
      "HCSiG II는 전작의 해킹 코드 시뮬레이션 콘셉트를 확장해, 더 깊어진 시스템 구조와 새로운 플레이 흐름을 목표로 개발을 시작했습니다.",
      "본 기사는 개발 착수 당시의 공식 기록입니다. HCSiG II는 이후 공식 폐기되어 현재 개발이 진행되지 않습니다.",
    ],
    facts: [
      { label: "현재 상태", value: "공식 폐기" },
      { label: "담당", value: "COMET DEVELOPS" },
    ],
  },
  "6": {
    id: "6",
    date: "2026.07.17",
    tag: "DEVELOPS",
    accent: "slate",
    title: "HCSiG II 및 일부 게임 프로젝트 공식 폐기",
    englishTitle: "HCSiG II and Selected Game Projects Officially Retired",
    summary: "COMET DEVELOPS는 HCSiG II를 포함한 일부 게임 프로젝트를 공식 폐기합니다.",
    paragraphs: [
      "COMET DEVELOPS는 HCSiG II, PROJECT: HW, UTOPIA SYNDROME, DREAM ON 프로젝트를 공식 폐기합니다. 이에 따라 각 프로젝트의 개발은 종료됩니다.",
      "앞으로의 개발 역량은 새로운 서비스와 후속 방향에 집중할 예정이며, COMET AI를 포함한 웹 기반 경험을 계속 발전시켜 나갑니다.",
    ],
    facts: [
      { label: "공식 폐기 프로젝트", value: "HCSiG II · PROJECT: HW · UTOPIA SYNDROME · DREAM ON" },
      { label: "담당", value: "COMET DEVELOPS" },
    ],
  },
  "7": {
    id: "7",
    date: "2026.07.17",
    tag: "COMET EDU",
    accent: "emerald",
    title: "COMET EDU 공식 해산 및 StudyLab 서비스 종료 안내",
    englishTitle: "COMET EDU Official Dissolution and StudyLab Service Closure",
    summary: "COMET DEVELOPS는 COMET EDU의 공식 해산과 StudyLab의 공식 서비스 종료 일정을 안내합니다.",
    paragraphs: [
      "COMET DEVELOPS 산하 교육 부서 COMET EDU는 2026년 7월 17일부로 공식 해산 및 부서 폐지되었습니다.",
      "StudyLab은 2026년 6월 17일 공식 운영을 시작했습니다. 운영 시작 한 달 뒤인 7월 17일, StudyLab의 공식 서비스 종료를 발표했으며 서비스는 2026년 8월 1일에 공식 종료됩니다.",
      "COMET EDU의 해산에 따라 해당 부서는 더 이상 운영되지 않습니다. StudyLab의 남은 서비스 운영 일정은 8월 1일 공식 종료일까지 유지됩니다.",
    ],
    facts: [
      { label: "COMET EDU 해산일", value: "2026년 7월 17일" },
      { label: "StudyLab 운영 시작일", value: "2026년 6월 17일" },
      { label: "StudyLab 종료 발표일", value: "2026년 7월 17일" },
      { label: "StudyLab 공식 종료일", value: "2026년 8월 1일" },
    ],
    timeline: [
      { date: "2026.06.17", title: "StudyLab 공식 운영 시작", description: "COMET EDU는 StudyLab을 통해 교육과 학습을 지원하는 공식 운영을 시작했습니다." },
      { date: "2026.07.17", title: "StudyLab 서비스 종료 발표 · COMET EDU 공식 해산", description: "StudyLab의 공식 서비스 종료를 발표했으며, 같은 날 COMET EDU는 공식 해산 및 부서 폐지되었습니다." },
      { date: "2026.08.01", title: "StudyLab 공식 서비스 종료", description: "StudyLab은 이 날짜를 기준으로 공식 서비스를 종료합니다." },
    ],
  },
};
