"use client";

import dynamic from "next/dynamic";

const SequenceGame = dynamic(() => import("../components/SequenceGame"), {
  ssr: false,
});

export default function Home() {
  return <SequenceGame />;
}
