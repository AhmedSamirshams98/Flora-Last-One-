"use client";
import { useEffect, useState } from "react";

export default function ReelsSection() {
  const [reels, setReels] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    fetch("/api/reels")
      .then((res) => res.json())
      .then(setReels);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 font-gess container mx-auto">
      {reels.map((reel) => (
        <div key={reel.id} className="flex justify-center">
          <iframe
            src={`https://www.instagram.com/p/${extractInstagramId(
              reel.url
            )}/embed`}
            width="350"
            height="620"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
            frameBorder={0}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title="Instagram Reel"
          />
        </div>
      ))}
    </div>
  );
}

function extractInstagramId(url: string) {
  const match = url.match(/\/reel\/([^\/?]+)/) || url.match(/\/p\/([^\/?]+)/);
  return match ? match[1] : "";
}
