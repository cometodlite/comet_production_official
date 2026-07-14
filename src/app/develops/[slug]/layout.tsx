import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { developers } from "@/data/developers";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return developers.filter((d) => d.hasPage).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const developer = developers.find((d) => d.slug === slug);
  if (!developer) return { title: "개발자" };
  return {
    title: developer.name,
    description: developer.description.ko,
    openGraph: {
      title: `${developer.name} | COMET DEVELOPS`,
      description: developer.description.ko,
    },
  };
}

export default async function DeveloperLayout({ children, params }: Props) {
  const { slug } = await params;
  const developer = developers.find((d) => d.slug === slug && d.hasPage);
  if (!developer) notFound();
  return <>{children}</>;
}
