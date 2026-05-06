"use client";

import Link from "next/link";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/Motion";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <FadeUp className="text-center mb-16">
        <p className="text-indigo-400 text-xs tracking-[0.5em] uppercase mb-4">LEGAL</p>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
          개인정보처리방침
        </h1>
        <p className="text-white/40 text-sm mb-1">시행일자: 2026년 5월 7일</p>
        <p className="text-white/40 text-sm">최종 개정일: 2026년 5월 7일</p>
      </FadeUp>

      {/* 전문 */}
      <FadeUp className="glass-card p-7 border border-indigo-500/20 bg-gradient-to-br from-indigo-900/10 to-transparent mb-8">
        <p className="text-white/60 text-sm leading-relaxed mb-4">
          COMET PRODUCTION은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>
        <p className="text-white/50 text-sm leading-relaxed">
          본 개인정보처리방침은 COMET PRODUCTION이 운영하는 웹사이트, 지원 시스템, 문의 채널, 커뮤니티, 프로젝트 참여 신청 및 기타 서비스에 적용됩니다.
        </p>
      </FadeUp>

      <StaggerContainer className="space-y-6">

        {/* 1. 처리 목적 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">1. 개인정보의 처리 목적</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 다음의 목적을 위해 개인정보를 처리합니다. 처리한 개인정보는 아래 목적 외의 용도로 이용하지 않으며, 이용 목적이 변경되는 경우 관련 법령에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/3">구분</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">처리 목적</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["지원자 관리", "입사지원, 팀 지원, 프로젝트 참여 신청, 지원자 확인, 면접 및 결과 안내"],
                  ["구성원 관리", "내부 인원 확인, 업무 배정, 권한 관리, 공지 전달"],
                  ["문의 응대", "문의 접수, 본인 확인, 답변 제공, 민원 처리"],
                  ["서비스 운영", "웹사이트 및 커뮤니티 운영, 서비스 개선, 부정 이용 방지"],
                  ["이벤트 운영", "이벤트 참여 확인, 보상 지급, 당첨자 안내"],
                  ["보안 관리", "비정상 접근 탐지, 서비스 악용 방지, 기록 보존"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 align-top font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5 leading-relaxed">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StaggerItem>

        {/* 2. 처리 항목 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">2. 처리하는 개인정보 항목</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              COMET PRODUCTION은 서비스 제공에 필요한 범위에서 최소한의 개인정보를 처리합니다.
            </p>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-3">1) 지원 및 문의 과정에서 처리하는 항목</p>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/3">구분</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">처리 항목</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["필수 항목", "이름 또는 활동명, 연락처, 이메일, 지원 분야, 자기소개, 포트폴리오 또는 작업물 링크"],
                  ["선택 항목", "SNS 계정, 디스코드 ID, 활동 경력, 희망 부서, 기타 사용자가 직접 제출한 정보"],
                  ["자동 수집 항목", "IP 주소, 접속 기록, 브라우저 정보, 기기 정보, 쿠키, 서비스 이용 기록"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 align-top font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5 leading-relaxed">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-3">2) 구성원 또는 프로젝트 참여자 관리 항목</p>
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/3">구분</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">처리 항목</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["기본 정보", "이름 또는 활동명, 이메일, 연락처, 소속 부서, 역할, 권한 정보"],
                  ["업무 정보", "참여 프로젝트, 담당 업무, 작업 이력, 협업 기록"],
                  ["정산 또는 보상 필요 시", "계좌 관련 정보, 지급 기록 등 별도 동의를 받은 정보"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 align-top font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5 leading-relaxed">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-3">3) 민감정보 및 고유식별정보</p>
            <p className="text-white/50 text-xs leading-relaxed">
              COMET PRODUCTION은 원칙적으로 주민등록번호, 여권번호, 운전면허번호 등 고유식별정보와 건강정보, 종교, 정치적 견해 등 민감정보를 수집하지 않습니다. 다만 법령상 의무 이행 또는 정산·계약 등 특정 목적상 필요한 경우에는 별도의 고지 및 동의를 받은 후 처리합니다.
            </p>
          </div>
        </StaggerItem>

        {/* 3. 보유 기간 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">3. 개인정보의 처리 및 보유 기간</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만 관계 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관할 수 있습니다.
            </p>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/2">구분</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">보유 기간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["지원자 정보", "지원 절차 종료 후 1년 이내"],
                  ["문의 및 민원 기록", "처리 완료 후 3년 이내"],
                  ["프로젝트 참여 기록", "프로젝트 종료 후 3년 이내"],
                  ["계약 및 정산 관련 기록", "관련 법령에 따른 보존 기간"],
                  ["서비스 이용 기록", "수집일로부터 1년 이내"],
                  ["부정 이용 및 보안 기록", "부정 이용 방지 목적 달성 시까지, 최대 3년"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 align-top font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-white/40 text-xs leading-relaxed">
              단, 이용자가 개인정보 삭제를 요청하는 경우 법령상 보관이 필요한 정보를 제외하고 지체 없이 삭제합니다.
            </p>
          </div>
        </StaggerItem>

        {/* 4. 파기 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">4. 개인정보의 파기 절차 및 방법</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 해당 개인정보를 지체 없이 파기합니다.
            </p>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-2">1) 파기 절차</p>
            <p className="text-white/50 text-xs leading-relaxed mb-4">
              이용자의 개인정보는 목적 달성 후 내부 방침 및 관계 법령에 따라 일정 기간 저장된 후 파기됩니다.
            </p>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-3">2) 파기 방법</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/3">형태</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">파기 방법</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["전자 파일", "복구 및 재생이 불가능한 방식으로 삭제"],
                  ["종이 문서", "분쇄 또는 소각"],
                  ["클라우드 저장 정보", "접근 권한 제거 및 영구 삭제 처리"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StaggerItem>

        {/* 5. 제3자 제공 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">5. 개인정보의 제3자 제공</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 다음의 경우에는 개인정보를 제3자에게 제공할 수 있습니다.
            </p>
            <ol className="space-y-1.5">
              {[
                "이용자가 사전에 동의한 경우",
                "법령에 특별한 규정이 있는 경우",
                "수사기관, 법원 등 관계기관의 적법한 요청이 있는 경우",
                "이용자 또는 제3자의 생명, 신체, 재산 보호를 위해 필요한 경우",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed">
                  <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </StaggerItem>

        {/* 6. 위탁 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">6. 개인정보 처리업무의 위탁</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 원활한 서비스 제공을 위해 일부 개인정보 처리 업무를 외부 서비스에 위탁할 수 있습니다.
            </p>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/3">수탁자</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">위탁 업무</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Google", "이메일, 문서 관리, 지원서 접수, 협업 도구 운영"],
                  ["Discord", "커뮤니티 및 내부 연락 채널 운영"],
                  ["GitHub", "개발 프로젝트 관리, 저장소 협업"],
                  ["Firebase / Google Cloud", "서비스 데이터 저장, 인증, 서버 운영"],
                  ["기타 클라우드·협업 도구", "프로젝트 운영 및 보안 관리"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 align-top font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5 leading-relaxed">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-white/40 text-xs leading-relaxed">
              COMET PRODUCTION은 위탁 계약 또는 서비스 이용 조건에 따라 개인정보가 안전하게 처리될 수 있도록 관리·감독합니다.
            </p>
          </div>
        </StaggerItem>

        {/* 7. 국외 이전 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">7. 개인정보의 국외 이전</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION이 Google, Discord, GitHub, Firebase 등 해외 기반 서비스를 이용하는 경우 개인정보가 국외 서버에 저장 또는 이전될 수 있습니다.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-3">이전받는 자</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-3">이전 국가</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-3">이전 항목</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">이전 목적</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["Google", "미국 등", "이메일, 문서, 계정 정보", "이메일 및 협업 도구 운영"],
                  ["Discord", "미국 등", "활동명, 메시지, 커뮤니티 이용 정보", "커뮤니티 운영"],
                  ["GitHub", "미국 등", "계정명, 개발 기록", "개발 협업"],
                  ["Firebase / Google Cloud", "미국 등", "서비스 이용 기록, 인증 정보", "서비스 운영 및 데이터 저장"],
                ].map(([a, b, c, d]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-3 font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5 pr-3">{b}</td>
                    <td className="text-white/40 text-xs py-2.5 pr-3 leading-relaxed">{c}</td>
                    <td className="text-white/40 text-xs py-2.5 leading-relaxed">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StaggerItem>

        {/* 8. 안전성 확보 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">8. 개인정보의 안전성 확보 조치</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 시행합니다.
            </p>
            <ol className="space-y-1.5">
              {[
                "개인정보 접근 권한의 최소화",
                "관리자 계정 및 접근 권한 관리",
                "비밀번호 및 인증 정보 보호",
                "개인정보 보관 자료의 암호화 또는 접근 제한",
                "보안 프로그램 및 클라우드 보안 설정 관리",
                "개인정보 처리 기록 관리",
                "내부 구성원 대상 개인정보 보호 안내",
                "불필요한 개인정보 수집 제한",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed">
                  <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </StaggerItem>

        {/* 9. 권리 행사 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">9. 이용자와 법정대리인의 권리 및 행사 방법</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              이용자는 언제든지 COMET PRODUCTION에 대해 다음 권리를 행사할 수 있습니다.
            </p>
            <ol className="space-y-1.5 mb-4">
              {[
                "개인정보 열람 요청",
                "개인정보 정정 요청",
                "개인정보 삭제 요청",
                "개인정보 처리정지 요청",
                "동의 철회 요청",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-white/40 text-xs leading-relaxed">
                  <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="text-white/40 text-xs leading-relaxed">
              권리 행사는 이메일 또는 공식 문의 채널을 통해 요청할 수 있으며, COMET PRODUCTION은 관련 법령에 따라 지체 없이 조치합니다. 만 14세 미만 아동의 개인정보를 처리해야 하는 경우, 법정대리인의 동의를 받은 후 처리합니다.
            </p>
          </div>
        </StaggerItem>

        {/* 10. 쿠키 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">10. 자동 수집 장치의 설치·운영 및 거부</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 웹사이트 이용 과정에서 쿠키 또는 유사 기술을 사용할 수 있습니다.
            </p>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-2">1) 사용 목적</p>
            <ol className="space-y-1 mb-4">
              {["접속 상태 유지", "이용자 환경 설정 저장", "서비스 이용 통계 분석", "비정상 이용 탐지", "서비스 개선"].map((item, i) => (
                <li key={i} className="flex gap-2 text-white/40 text-xs">
                  <span className="text-indigo-400 shrink-0">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="text-white/70 text-xs font-semibold tracking-wider mb-2">2) 쿠키 거부 방법</p>
            <p className="text-white/40 text-xs leading-relaxed">
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다. 단, 쿠키 저장을 거부할 경우 일부 서비스 이용에 제한이 발생할 수 있습니다.
            </p>
          </div>
        </StaggerItem>

        {/* 11. 보호책임자 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">11. 개인정보 보호책임자 및 문의처</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              COMET PRODUCTION은 개인정보 처리와 관련한 문의, 불만 처리, 피해 구제 등을 위해 아래와 같이 개인정보 보호책임자를 지정합니다.
            </p>
            <table className="w-full text-sm mb-4">
              <tbody className="divide-y divide-white/5">
                {[
                  ["개인정보 보호책임자", "COMET PRODUCTION 운영책임자"],
                  ["담당 부서", "COMET PRODUCTION 운영관리팀"],
                  ["이메일", "cometodlite@kenet.co.kr"],
                  ["문의 채널", "홈페이지 문의 페이지 (/contact)"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 font-medium w-1/3">{a}</td>
                    <td className="text-white/40 text-xs py-2.5">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              문의 페이지로 이동 →
            </Link>
          </div>
        </StaggerItem>

        {/* 12. 권익침해 구제 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">12. 권익침해 구제 방법</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              이용자는 개인정보 침해에 대한 구제를 받기 위해 아래 기관에 문의할 수 있습니다.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/2">기관</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">역할</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ["개인정보침해신고센터", "개인정보 침해 신고 및 상담"],
                  ["개인정보분쟁조정위원회", "개인정보 분쟁 조정"],
                  ["경찰청 사이버수사국", "사이버 범죄 신고"],
                  ["대검찰청 사이버수사과", "사이버 범죄 수사 관련 문의"],
                ].map(([a, b]) => (
                  <tr key={a}>
                    <td className="text-white/60 text-xs py-2.5 pr-4 font-medium">{a}</td>
                    <td className="text-white/40 text-xs py-2.5">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StaggerItem>

        {/* 13. 변경 사항 */}
        <StaggerItem>
          <div className="glass-card p-7 border border-white/8">
            <h2 className="text-base font-bold text-white mb-4">13. 개인정보처리방침의 변경</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              본 개인정보처리방침은 법령, 내부 정책, 서비스 변경에 따라 개정될 수 있습니다. 변경 시 COMET PRODUCTION은 웹사이트 또는 공식 공지 채널을 통해 안내합니다.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/5">버전</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2 pr-4 w-1/4">시행일</th>
                  <th className="text-left text-white/40 text-xs tracking-wider pb-2">주요 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-white/60 text-xs py-2.5 pr-4 font-medium">v1.0</td>
                  <td className="text-white/40 text-xs py-2.5 pr-4">2026.05.07</td>
                  <td className="text-white/40 text-xs py-2.5">개인정보처리방침 최초 제정</td>
                </tr>
              </tbody>
            </table>
          </div>
        </StaggerItem>

        {/* 14. 부칙 */}
        <StaggerItem>
          <div className="glass-card p-6 border border-indigo-500/20 bg-gradient-to-br from-indigo-900/10 to-transparent text-center">
            <p className="text-white/50 text-sm font-medium">부칙</p>
            <p className="text-white/30 text-xs mt-1">본 개인정보처리방침은 2026년 5월 7일부터 시행됩니다.</p>
          </div>
        </StaggerItem>

      </StaggerContainer>

      <FadeUp className="mt-10 text-center">
        <p className="text-white/20 text-xs">
          © {new Date().getFullYear()} COMET PRODUCTION. 본 방침은 사전 고지 후 변경될 수 있습니다.
        </p>
      </FadeUp>
    </div>
  );
}
