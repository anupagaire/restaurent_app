
[#3B1C32]
[#513012]

[#f6a93c]



[#0f0a06]
Default Usage (Uses theme colors)
<SectionHeader
  title="Featured"
  highlight="Restaurants"
  linkText="View all"
  linkHref="/restaurants"
/>

Custom Colors (Specific page)

<SectionHeader
  title="Top Rated"
  highlight="by Cuisine"
  subtitle="Based on real reviews"
  linkText="Explore all"
  linkHref="/menusearch"
  // Custom colors
  titleColor="text-white"
  highlightColor="text-[#fde68a]"
  subtitleColor="text-white/70"
  badgeBgColor="bg-[#fde68a]/20"
  badgeTextColor="text-[#fde68a]"
  linkBgColor="bg-[#3B1C32]"
  linkTextColor="text-[#fde68a]"
  linkHoverBgColor="hover:bg-[#fde68a]"
  linkHoverTextColor="hover:text-[#3B1C32]"
  dividerColor="bg-white/20"
/>

Custom Classes (Override entire styles)
<SectionHeader
  title="Our"
  highlight="Services"
  subtitle="What we offer"
  // Custom classes
  titleClassName="font-serif text-center"
  subtitleClassName="text-center mx-auto"
  linkClassName="rounded-full px-6 py-3"
  badgeClassName="shadow-lg"
/>
4. Gradient Title (Special effect)

<SectionHeader
  title="Find the Right"
  highlight="Place"
  titleClassName="bg-gradient-to-r from-[#3B1C32] to-[#f6a93c] bg-clip-text text-transparent font-bold"
  linkText="View all"
  linkHref="/restaurants"
/>
5. No Animation, No Divider
<SectionHeader
  title="Simple"
  highlight="Header"
  withAnimation={false}
  withDivider={false}
/>