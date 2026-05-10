import ContactPageClient from "./ContactPageClient";

const subjectValues = new Set(["general", "entertainers", "develops", "partnership", "staff-code"]);

type ContactPageProps = {
  searchParams: Promise<{
    type?: string | string[];
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { type } = await searchParams;
  const requestedType = Array.isArray(type) ? type[0] : type;
  const initialSubject = requestedType && subjectValues.has(requestedType) ? requestedType : undefined;

  return <ContactPageClient initialSubject={initialSubject} />;
}
