"use client";

import {
  BookOpenText,
  CalendarDots,
  ChartLineUp,
  Compass,
  DotsThreeOutline,
  HouseLine,
  Scroll,
  SquaresFour,
  UsersThree,
  X,
  type Icon,
} from "@phosphor-icons/react";

// Navigation icons from Phosphor (phosphoricons.com). A tab shows the regular
// outline, and the duotone version, with its soft fill, once it's open. Close
// stays an outline: its duotone draws a filled square behind the X.
const NAV_ICONS = {
  home: HouseLine,
  content: BookOpenText,
  activities: Compass,
  verse: Scroll,
  calendar: CalendarDots,
  grades: ChartLineUp,
  people: UsersThree,
  more: DotsThreeOutline,
  menu: SquaresFour,
  close: X,
} satisfies Record<string, Icon>;

export type NavIconName = keyof typeof NAV_ICONS;

export function NavIcon({
  name,
  active = false,
  className = "size-6",
}: {
  name: NavIconName;
  active?: boolean;
  className?: string;
}) {
  const Glyph = NAV_ICONS[name];
  const weight = active && name !== "close" ? "duotone" : "regular";
  return <Glyph weight={weight} className={className} aria-hidden />;
}
