"use client";

import { useLang } from "@/context/LanguageContext";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/Motion";

export default function PrivacyPage() {
  const { t } = useLang();

  const sections = [
    {
      titleKo: "1. 수집하는 개인정보 항목",
      titleEn: "1. Personal Information Collected",
      contentKo: "COMET PRODUCTION은 문의 접수를 위해 다음 정보를 수집합니다: 이름, 이메일 주소, 문의 내용. 그 외 별도의 개인정보는 수집하지 않습니다.",
      contentEn: "COMET PRODUCTION collects the following information for inquiry processing: name, email address, and inquiry content. No other personal information is collected.",
    },
    {
      titleKo: "2. 개인정보 수집 및 이용 목적",
      titleEn: "2. Purpose of Collection and Use",
      contentKo: "수집된 개인정보는 문의에 대한 답변 및 관련 안내를 제공하기 위해서만 사용됩니다. 수집된 정보는 동의 없이 제3자에게 제공되지 않습니다.",
      contentEn: "Collected personal information is used solely to respond to inquiries and provide related guidance. Information is not provided to third parties without consent.",
    },
    {
      titleKo: "3. 개인정보 보유 및 이용 기간",
      titleEn: "3. Retention Period",
      contentKo: "개인정보는 문의 처리 완료 후 6개월간 보관 후 파기됩니다. 단, 관련 법령에 의해 보존이 필요한 경우에는 해당 기간 동안 보관됩니다.",
      contentEn: "Personal information is retained for 6 months after inquiry processing is complete, then destroyed. However, if retention is required by applicable law, it will be kept for the required period.",
    },
    {
      titleKo: "4. 개인정보 제3자 제공",
      titleEn: "4. Third-Party Disclosure",
      contentKo: "COMET PRODUCTION은 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우에는 예외로 합니다.",
      contentEn: "COMET PRODUCTION does not provide users' personal information to third parties in principle. Exceptions apply when required by law or at the request of investigative agencies following legally prescribed procedures.",
    },
    {
      titleKo: "5. 이용자의 권리",
      titleEn: "5. User Rights",
      contentKo: "이용자는 언제든지 자신의 개인정보에 대한 열람, 수정, 삭제를 요청할 수 있습니다. 관련 문의는 아래 연락처를 통해 요청하실 수 있습니다.",
      contentEn: "Users may request access, correction, or deletion of their personal information at any time. Please contact us via the information below.",
    },
    {
      titleKo: "6. 문의처",
      titleEn: "6. Contact",
      contentKo: "개인정보 관련 문의: cometodlite@kenet.co.kr\n담당: COMET PRODUCTION 운영팀",
      contentEn: "Privacy inquiries: cometodlite@kenet.co.kr\nResponsible: COMET PRODUCTION Operations Team",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <FadeUp className="text-center mb-16">
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-4">
          {t("법적 고지", "LEGAL")}
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
          {t("개인정보처리방침", "Privacy Policy")}
        </h1>
        <p className="text-white/40 text-sm">
          {t("최종 업데이트: 2026년 5월", "Last updated: May 2026")}
        </p>
      </FadeUp>

      <StaggerContainer className="space-y-6">
        {sections.map((s, i) => (
          <StaggerItem key={i}>
            <div className="glass-card p-7 border border-white/8">
              <h2 className="text-base font-bold text-white mb-3">
                {t(s.titleKo, s.titleEn)}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">
                {t(s.contentKo, s.contentEn)}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeUp className="mt-10 text-center">
        <p className="text-white/20 text-xs">
          © {new Date().getFullYear()} COMET PRODUCTION. {t("본 방침은 사전 고지 없이 변경될 수 있습니다.", "This policy may be updated without prior notice.")}
        </p>
      </FadeUp>
    </div>
  );
}
