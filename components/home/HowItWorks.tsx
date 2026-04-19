import { QrCode, Menu, UtensilsCrossed } from 'lucide-react';

const steps = [
  {
    icon: QrCode,
    title: "Scan QR Code",
    desc: "Scan the QR code placed on your table",
  },
  {
    icon: Menu,
    title: "Browse Menu",
    desc: "Explore our delicious menu items",
  },
  {
    icon: UtensilsCrossed,
    title: "Order & Enjoy",
    desc: "Call the waiter or order directly",
  },
];

export default function HowItWorks() {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-[#5D0565]">How It Works</h2>
          <p className="text-gray-600 mt-3">Just 3 simple steps to enjoy your meal</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 mx-auto bg-[#513012] text-white rounded-2xl flex items-center justify-center mb-6">
                <step.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
              {index < 2 && (
                <div className="hidden md:block absolute w-20 h-0.5 bg-[#513012]/20 mt-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}