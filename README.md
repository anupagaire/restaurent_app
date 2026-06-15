
[#3B1C32]primary
secondaryprimary

[#f6a93c]secondary



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
  highlightColor="text-accent"
  subtitleColor="text-white/70"
  badgeBgColor="bg-accent/20"
  badgeTextColor="text-accent"
  linkBgColor="bg-primary"
  linkTextColor="text-accent"
  linkHoverBgColor="hover:bg-accent"
  linkHoverTextColor="hover:text-primary"
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
  titleClassName="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold"
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