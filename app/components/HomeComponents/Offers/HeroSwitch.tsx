"use client";

/* Temporary, for comparing the two home heroes: the 3D stage is the default; add ?hero=reel to the
   address to see the earlier row of pictures. Remove once one of them is chosen. */

import { useEffect, useState } from "react";
import ReelHero from "./ReelHero";
import StageHero from "./StageHero";
import type { HomeProduct } from "./types";

type Props = {
  lang: "ar" | "en";
  products: HomeProduct[];
  extra?: { id: string; image: string; alt: string; href: string }[];
};

export default function HeroSwitch(props: Props) {
  const [reel, setReel] = useState(false);
  useEffect(() => {
    setReel(new URLSearchParams(window.location.search).get("hero") === "reel");
  }, []);
  return reel ? <ReelHero {...props} /> : <StageHero {...props} />;
}
