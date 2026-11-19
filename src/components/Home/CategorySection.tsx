import React from "react";
import Link from "next/link";
import {
  LuFlower2,
  LuHand,
  LuPalette,
  LuScissors,
  LuSparkles,
  LuWand,
  LuWaves,
} from "react-icons/lu";

interface CategoryMeta {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
}

// 7 Categories from requirements.txt (Dynamic Section 2: Salon Service Categories)
const CANONICAL_CATEGORIES: CategoryMeta[] = [
  {
    name: "Haircut & Styling",
    icon: LuScissors,
    tagline: "Cuts, trim & blowouts",
  },
  {
    name: "Hair Coloring",
    icon: LuPalette,
    tagline: "Highlights & balayage",
  },
  {
    name: "Hair Treatment",
    icon: LuSparkles,
    tagline: "Keratin & deep repair",
  },
  {
    name: "Facial & Skincare",
    icon: LuFlower2,
    tagline: "Cleansing & glow facial",
  },
  {
    name: "Makeup",
    icon: LuWand,
    tagline: "Party & bridal glam",
  },
  {
    name: "Manicure & Pedicure",
    icon: LuHand,
    tagline: "Gel nails & hand care",
  },
  {
    name: "Spa & Massage",
    icon: LuWaves,
    tagline: "Aromatherapy & stones",
  },
];

const CategorySection = () => {
  return (
    <section className="relative w-full py-16 sm:py-20 bg-brand-light/35 border-y border-brand-primary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900">
            Salon Service Categories
          </h2>

          <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-stone-600">
            Explore our specialized beauty treatments and find the exact care
            you need. Select any category to view available services.
          </p>
        </div>

        {/* 7 Categories: 4 in Row 1, 3 Centered in Row 2 */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
          {CANONICAL_CATEGORIES.map((cat) => {
            const Icon = cat.icon;

            return (
              <Link
                key={cat.name}
                href={`/services?category=${encodeURIComponent(cat.name)}`}
                className="group relative flex w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-col items-center justify-center rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-7 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/30 hover:shadow-xl focus:outline-none"
              >
                {/* Larger Icon Squircle Badge */}
                <div className="flex h-18 w-18 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-brand-light text-brand-primary shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-primary group-hover:text-white">
                  <Icon className="text-3xl sm:text-4xl" />
                </div>

                {/* Category Info */}
                <div className="mt-4 sm:mt-5 w-full">
                  <h3 className="font-fraunces text-base sm:text-lg font-semibold text-stone-900 transition-colors duration-200 group-hover:text-brand-primary line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="mt-1 sm:mt-1.5 text-xs leading-tight text-stone-500 line-clamp-1">
                    {cat.tagline}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
