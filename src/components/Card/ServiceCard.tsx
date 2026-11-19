import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuClock } from "react-icons/lu";

export interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image: string;
  status: "active" | "inactive";
  createdAt?: string;
}

interface ServiceCardProps {
  service: Service;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, className = "" }) => {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-primary/25 ${className}`}
    >
      {/* Service Image with Category Badge */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <Image
          src={service.image}
          alt={service.serviceName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Floating Category Badge (stays where it is on the image) */}
        <div className="absolute top-3.5 left-3.5">
          <span className="inline-flex items-center rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-medium text-brand-primary shadow-xs">
            {service.category}
          </span>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* 1st: Service Name */}
        <h3 className="font-fraunces text-xl font-semibold tracking-tight text-stone-900 transition-colors duration-200 group-hover:text-brand-primary line-clamp-1">
          {service.serviceName}
        </h3>

        {/* 2nd: Description */}
        <p className="mt-2 text-sm leading-relaxed text-stone-600 line-clamp-2">
          {service.description}
        </p>

        {/* 3rd: Left Side Price & Right Side Duration */}
        <div className="mt-auto pt-5 flex items-center justify-between border-t border-stone-100">
          {/* Left: Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-medium text-stone-400">Price:</span>
            <span className="text-xl font-bold text-brand-primary">
              ${service.price}
            </span>
          </div>

          {/* Right: Duration */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-brand-light px-2.5 py-1 rounded-full border border-brand-primary/15">
            <LuClock className="text-sm text-brand-secondary" />
            <span>{service.duration} mins</span>
          </div>
        </div>

        {/* 4th: View Details Button */}
        <div className="mt-3.5">
          <Link
            href={`/services/${service._id}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-primary/20 bg-brand-light/50 py-2.5 px-4 text-sm font-semibold text-brand-primary transition-all duration-200 hover:border-brand-primary hover:bg-brand-primary hover:text-white focus:outline-none"
          >
            <span>View Details</span>
            <LuArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
