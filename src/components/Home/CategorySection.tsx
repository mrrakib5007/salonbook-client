import React from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  LuArrowRight,
  LuFlower2,
  LuHand,
  LuPalette,
  LuScissors,
  LuSparkles,
  LuWand,
  LuWaves,
} from "react-icons/lu";

export interface Category {
  _id: string;
  name: string;
  icon?: string;
  tagline?: string;
  order?: number;
}

// Icon mapping dictionary for dynamic categories from database
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LuScissors,
  LuPalette,
  LuSparkles,
  LuFlower2,
  LuWand,
  LuHand,
  LuWaves,
  "Haircut & Styling": LuScissors,
  "Hair Coloring": LuPalette,
  "Hair Treatment": LuSparkles,
  "Facial & Skincare": LuFlower2,
  Makeup: LuWand,
  "Manicure & Pedicure": LuHand,
  "Spa & Massage": LuWaves,
};

async function getCategories(): Promise<Category[]> {
  try {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
    const res = await fetch(`${serverUrl}/api/categories`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

const CategorySection = async () => {
  await connection();
  // Fetch dynamic categories from the database API
  const categories = await getCategories();
  const hasCategories = Array.isArray(categories) && categories.length > 0;

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

        {/* Empty State when no categories found or API error */}
        {!hasCategories ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-primary/20 bg-white/70 px-6 py-14 text-center shadow-xs">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand-primary shadow-xs">
              <LuSparkles className="text-3xl" />
            </span>
            <h3 className="mt-4 font-fraunces text-xl font-semibold text-stone-900">
              No Categories Available
            </h3>
            <p className="mt-2 max-w-md text-sm text-stone-500 leading-relaxed">
              We couldn&apos;t load the service categories right now. Please
              check back shortly or explore our full service catalog directly.
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-light px-6 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              <span>Browse All Services</span>
              <LuArrowRight className="text-base" />
            </Link>
          </div>
        ) : (
          /* Dynamic Categories Grid: 4 in Row 1, 3 Centered in Row 2 */
          <div className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
            {categories.map((cat) => {
              const Icon =
                (cat.icon && ICON_MAP[cat.icon]) ||
                ICON_MAP[cat.name] ||
                LuSparkles;

              return (
                <Link
                  key={cat._id || cat.name}
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
                    {cat.tagline && (
                      <p className="mt-1 sm:mt-1.5 text-xs leading-tight text-stone-500 line-clamp-1">
                        {cat.tagline}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
