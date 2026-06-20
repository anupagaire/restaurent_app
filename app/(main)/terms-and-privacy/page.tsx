"use client";

import { useState } from "react";
const sections = {
  terms: [
    {
      id: "1",
      title: "Acceptance of Terms",
      content: `By accessing or using FoodHub ("Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Platform. These terms apply to all users including restaurant owners, administrators, and end customers.`,
    },
    {
      id: "2",
      title: "Restaurant Registration & Onboarding",
      content: `Restaurants must provide accurate, complete, and up-to-date information during registration including business name, address, contact details, food license number, and bank/payment details. FoodHub reserves the right to approve or reject any restaurant registration at its sole discretion. False or misleading information will result in immediate account termination. Each restaurant is entitled to one account only.`,
    },
    {
      id: "3",
      title: "Restaurant Dashboard & Features",
      content: `Upon approval, restaurants gain access to a dedicated dashboard that includes: menu management, QR code generation for digital menus, order management, analytics and reports, and staff account management. FoodHub grants a non-exclusive, non-transferable license to use these features solely for your registered business. You may not resell, sublicense, or commercially exploit dashboard features.`,
    },
    {
      id: "4",
      title: "QR Code & Digital Menu",
      content: `Restaurants are solely responsible for the accuracy, legality, and quality of menu items, prices, descriptions, and images uploaded to the platform. QR codes generated are tied to your active subscription. If your account is suspended or subscription lapses, QR codes may become inactive. FoodHub is not liable for customer complaints arising from incorrect menu information.`,
    },
    {
      id: "5",
      title: "Fees, Subscription & Payments",
      content: `Use of the platform may be subject to subscription fees as outlined in your plan. All fees are non-refundable unless stated otherwise. FoodHub reserves the right to change pricing with 30 days' prior notice. Failure to pay may result in suspension of your account and deactivation of QR codes and menus.`,
    },
    {
      id: "6",
      title: "Content & Intellectual Property",
      content: `You retain ownership of content you upload (menus, images, logos). By uploading, you grant FoodHub a worldwide, royalty-free license to display and distribute your content on the platform. You must not upload content that is illegal, offensive, defamatory, or infringes third-party rights. FoodHub's branding, software, and platform design are protected by intellectual property laws and may not be copied or used without permission.`,
    },
    {
      id: "7",
      title: "Prohibited Activities",
      content: `You agree not to: upload false or fraudulent menu information; use the platform for any unlawful purpose; attempt to gain unauthorized access to other accounts; reverse-engineer or copy the platform's software; use automated bots or scrapers; interfere with platform security or stability; harass other users or FoodHub staff.`,
    },
    {
      id: "8",
      title: "Termination",
      content: `FoodHub may suspend or terminate your account at any time for violation of these terms, non-payment, or conduct deemed harmful to the platform or its users. You may close your account at any time by contacting support. Upon termination, your data may be retained for legal compliance purposes as outlined in our Privacy Policy.`,
    },
    {
      id: "9",
      title: "Limitation of Liability",
      content: `FoodHub is a technology platform connecting restaurants and customers. We are not liable for: food quality or safety issues; disputes between restaurants and customers; loss of business due to platform downtime; inaccurate menu information uploaded by restaurants; third-party service failures. Our total liability in any case shall not exceed the fees paid by you in the preceding 3 months.`,
    },
    {
      id: "10",
      title: "Governing Law",
      content: `These Terms are governed by the laws of Nepal. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal. If any provision of these terms is found invalid, the remaining provisions continue in full force.`,
    },
  ],
  privacy: [
    {
      id: "1",
      title: "Information We Collect",
      content: `We collect the following categories of information: (a) Restaurant Information: business name, address, owner name, phone, email, food license, and bank details provided during registration. (b) Usage Data: dashboard activity, menu updates, QR code scans, login times, and IP addresses. (c) Customer Data: if customers interact with your digital menu, we may collect anonymous analytics such as page views and item clicks. (d) Device & Technical Data: browser type, operating system, and device identifiers.`,
    },
    {
      id: "2",
      title: "How We Use Your Information",
      content: `We use collected data to: create and manage your restaurant account; generate and serve digital menus and QR codes; process payments and subscriptions; send service-related communications and updates; improve platform features and performance; comply with legal obligations; detect and prevent fraud or abuse.`,
    },
    {
      id: "3",
      title: "QR Code Scan Data",
      content: `When customers scan a restaurant's QR code, we may collect anonymous metadata including scan count, time of scan, and device type. This data is shared with the restaurant as part of their analytics dashboard. We do not collect personally identifiable information from customers who simply scan a menu QR code without creating an account.`,
    },
    {
      id: "4",
      title: "Data Sharing & Third Parties",
      content: `We do not sell your personal data. We may share data with: payment processors to handle subscriptions; cloud hosting providers for platform infrastructure; analytics services (anonymized data only); legal authorities when required by law. All third-party partners are bound by strict data processing agreements.`,
    },
    {
      id: "5",
      title: "Data Retention",
      content: `We retain your data for as long as your account is active. After account closure, we retain data for up to 2 years for legal and audit purposes, after which it is securely deleted. Menu content and QR code records may be anonymized and retained for analytics purposes.`,
    },
    {
      id: "6",
      title: "Your Rights",
      content: `You have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your data (subject to legal retention requirements); withdraw consent for marketing communications; request a copy of your data in a portable format. To exercise these rights, contact us at privacy@foodhub.com.np.`,
    },
    {
      id: "7",
      title: "Cookies & Tracking",
      content: `We use cookies and similar technologies to maintain your session, remember preferences, and analyze platform usage. You can control cookie settings through your browser. Disabling cookies may affect platform functionality. We use no third-party advertising cookies.`,
    },
    {
      id: "8",
      title: "Security",
      content: `We implement industry-standard security measures including HTTPS encryption, secure password hashing, role-based access control, and regular security audits. However, no system is 100% secure. You are responsible for maintaining the confidentiality of your dashboard login credentials.`,
    },
    {
      id: "9",
      title: "Children's Privacy",
      content: `FoodHub is not directed at children under 13. We do not knowingly collect data from minors. If you believe a minor has provided us data, please contact us and we will promptly delete it.`,
    },
    {
      id: "10",
      title: "Changes to This Policy",
      content: `We may update this Privacy Policy periodically. We will notify registered restaurants via email or dashboard notification at least 14 days before significant changes take effect. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
    },
  ],
};

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [openSection, setOpenSection] = useState<string | null>("1");

  const data = sections[activeTab];

  return (
    <>
    <div className="min-h-screen   text-secondary font-sans">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-primary/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
        
         
          <h1 className="text-gray-900 text-base max-w-xl mx-auto">
            Please read these documents carefully before using our restaurant
            management platform.
          </h1>
          <p className="text-secondary text-sm mt-3">
            Last updated: {new Date().toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
          {(["terms", "privacy"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setOpenSection("1"); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                  : "text-secondary hover:text-secondary"
              }`}
            >
              {tab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-3 pb-20">
        {/* Intro box */}
        <div className="bg-[#8c52ff]/30 border border-secondary/40 rounded-xl p-5 mb-6">
          <p className="text-secondary text-sm leading-relaxed">
            {activeTab === "terms"
              ? "These Terms & Conditions govern your use of FoodHub as a registered restaurant partner, including access to your dashboard, QR menu generation, and all platform features."
              : "This Privacy Policy explains how FoodHub collects, uses, and protects information from restaurant partners and their customers across our platform."}
          </p>
        </div>

        {data.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div
              key={section.id}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                isOpen
                  ? "border-primary/60 bg-white/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <button
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[#c97b3a] bg-secondary/30 px-2 py-1 rounded-md min-w-[2rem] text-center">
                    {section.id.padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-secondary text-base">
                    {section.title}
                  </span>
                </div>
                <span
                  className={`text-secondary text-xl transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              {isOpen && (
                <div className="px-6 pb-5">
                  <div className="w-full h-px bg-white/10 mb-4" />
                  <p className="text-gray-900 text-sm leading-7">
                    {section.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-10 bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-white mb-2">Have Questions?</h3>
          <p className="text-gray-000 text-sm mb-4">
            If you have any questions about our{" "}
            {activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"},
            please contact our legal team.
          </p>
          <a
            href="mailto:legal@foodhub.com.np"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-secondary via-primary to-primary text-white hover:opacity-90 transition"
          >
            legal@foodhub.com.np
          </a>
        </div>
      </div>
    </div>

     </>
  );
}