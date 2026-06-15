import React from "react";
import { ArrowUpRight } from "lucide-react";

type InstagramFeedProps = {
  instagramPosts: any[];
};

const InstagramFeed = ({ instagramPosts }: InstagramFeedProps) => {
  if (instagramPosts.length === 0) return null;

  return (
    <section className=" bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 px-4">
          <h2 className="font-tangerine text-2xl sm:text-3xl md:text-4xl text-black font-bold">
            Instagram
          </h2>

          <p className="text-2xl sm:text-4xl md:text-5xl font-fraunces text-[#267C87]">
            Follow Us On Instagram For Inspiration!{" "}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-4">
          {instagramPosts.map((post) => (
            <a
              key={post._id}
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-zinc-200 bg-zinc-100"
            >
              <img
                src={post.image}
                alt={post.caption || "Instagram feed"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                <p className="text-[10px] line-clamp-2 leading-snug">
                  {post.caption || "View post"}
                </p>
                <span className="text-[8px] font-bold uppercase tracking-wider text-pink-400 mt-1 flex items-center gap-0.5">
                  Instagram <ArrowUpRight size={10} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
