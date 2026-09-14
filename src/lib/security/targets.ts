export type SecurityTarget = {
  id: string;
  label: string;
  hostname: string;
  baseUrl: string;
};

export const SECURITY_TARGETS: SecurityTarget[] = [
  { id: "cometprod", label: "cometprod.com", hostname: "cometprod.com", baseUrl: "https://cometprod.com" },
  { id: "comet-kenet", label: "comet.kenet.co.kr", hostname: "comet.kenet.co.kr", baseUrl: "https://comet.kenet.co.kr" },
  { id: "stutant-kenet", label: "stutant.kenet.co.kr", hostname: "stutant.kenet.co.kr", baseUrl: "https://stutant.kenet.co.kr" },
  { id: "minit-cometprod", label: "minit.cometprod.com", hostname: "minit.cometprod.com", baseUrl: "https://minit.cometprod.com" },
];
