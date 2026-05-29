'use client';
import { useEffect, useState } from 'react';
import { QrCode, Menu, UtensilsCrossed, LucideIcon } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Step {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface HowItWorksData {
  how_it_works_section: {
    title: string;
    description: string;
    steps: Step[];
  };
}

const iconMap: Record<string, LucideIcon> = {
  qr_code: QrCode,
  menu: Menu,
  utensils_crossed: UtensilsCrossed,
};

export default function HowItWorks() {
  const [data, setData] = useState<HowItWorksData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${BASE_URL}/api/v1/website-content/how-it-works/`);
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, []);

  if (!data?.how_it_works_section) return null;

  const { title, description, steps } = data.how_it_works_section;

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-[#5D0565]">{title}</h2>
          <p className="text-gray-600 mt-3">{description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon] ?? QrCode;
            return (
              <div key={step.id} className="text-center relative">
                <div className="w-20 h-20 mx-auto bg-[#513012] text-white rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute w-20 h-0.5 bg-[#513012]/20 mt-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}