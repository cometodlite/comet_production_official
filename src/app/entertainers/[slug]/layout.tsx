import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { artists } from "@/data/artists";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return artists.filter((a) => a.hasPage).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = artists.find((a) => a.slug === slug);
  if (!artist) return { title: "아티스트" };
  return {
    title: artist.name,
    description:
      artist.bio.ko ||
      `${artist.name} — ${artist.role} · ${artist.generation}`,
    openGraph: {
      title: `${artist.name} | COMET ENTERTAINERS`,
      description: artist.bio.ko || `${artist.name} — ${artist.role}`,
      ...(artist.image ? { images: [artist.image] } : {}),
    },
  };
}

export default async function ArtistLayout({ children, params }: Props) {
  const { slug } = await params;
  const artist = artists.find((a) => a.slug === slug && a.hasPage);
  if (!artist) notFound();
  return <>{children}</>;
}
