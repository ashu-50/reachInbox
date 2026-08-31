import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(children: ReactNode, props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={18}
      height={18}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconClock = (props: IconProps) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>,
    props
  );

export const IconSend = (props: IconProps) =>
  base(
    <>
      <path d="M21 3 3 10.5l7.5 2.5L13 21l8-18Z" />
      <path d="M10.5 13 21 3" />
    </>,
    props
  );

export const IconSearch = (props: IconProps) =>
  base(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>,
    props
  );

export const IconFilter = (props: IconProps) =>
  base(<path d="M4 5h16M7 12h10M10 19h4" />, props);

export const IconRefresh = (props: IconProps) =>
  base(
    <>
      <path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </>,
    props
  );

export const IconStar = (props: IconProps) =>
  base(
    <path d="m12 3 2.6 5.7 6.2.6-4.7 4.2 1.4 6.1L12 16.7 6.5 19.6l1.4-6.1L3.2 9.3l6.2-.6L12 3Z" />,
    props
  );

export const IconChevronDown = (props: IconProps) => base(<path d="m6 9 6 6 6-6" />, props);

export const IconPaperclip = (props: IconProps) =>
  base(
    <path d="M21 12.5 12.5 21a4.5 4.5 0 0 1-6.4-6.4L15 5.7a3 3 0 0 1 4.2 4.2l-8.9 8.9a1.5 1.5 0 0 1-2.1-2.1l8-8" />,
    props
  );

export const IconUpload = (props: IconProps) =>
  base(
    <>
      <path d="M12 16V4" />
      <path d="m6 9 6-6 6 6" />
      <path d="M4 20h16" />
    </>,
    props
  );

export const IconPlus = (props: IconProps) => base(<path d="M12 5v14M5 12h14" />, props);

export const IconTrash = (props: IconProps) =>
  base(
    <>
      <path d="M4 7h16" />
      <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </>,
    props
  );

export const IconX = (props: IconProps) => base(<path d="M18 6 6 18M6 6l12 12" />, props);

export const IconArrowLeft = (props: IconProps) => base(<path d="M19 12H5m6-7-7 7 7 7" />, props);

export const IconLogOut = (props: IconProps) =>
  base(
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>,
    props
  );

export const IconBold = (props: IconProps) =>
  base(<path d="M7 4h6a3.5 3.5 0 0 1 0 7H7V4Zm0 7h7a3.5 3.5 0 0 1 0 7H7v-7Z" />, props);

export const IconItalic = (props: IconProps) =>
  base(<path d="M11 4h6M7 20h6M14 4 10 20" />, props);

export const IconUnderline = (props: IconProps) =>
  base(
    <>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M5 20h14" />
    </>,
    props
  );

export const IconStrikethrough = (props: IconProps) =>
  base(
    <>
      <path d="M4 12h16" />
      <path d="M7 6.5C7 5 9 4 12 4s5 1 5 2.7c0 1.4-1.1 2.2-2.6 2.6" />
      <path d="M8.6 14.7c-.4.4-.6 1-.6 1.6 0 1.7 1.8 2.7 4 2.7s4-1 4-2.9" />
    </>,
    props
  );

export const IconListOrdered = (props: IconProps) =>
  base(
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6h1v3M4 6h1M4 10h2M4.5 14c1 0 1.5.4 1.5 1s-.5 1-1.5 1c1 0 1.5.4 1.5 1s-.5 1-1.5 1H4" />
    </>,
    props
  );

export const IconListBullet = (props: IconProps) =>
  base(
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </>,
    props
  );

export const IconQuote = (props: IconProps) =>
  base(
    <>
      <path d="M7 8a3 3 0 0 0-3 3v2h4v-5Zm0 5v3H5" />
      <path d="M16 8a3 3 0 0 0-3 3v2h4v-5Zm0 5v3h-2" />
    </>,
    props
  );

export const IconUndo = (props: IconProps) => base(<path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 1 0 10h-1" />, props);

export const IconRedo = (props: IconProps) => base(<path d="m15 7 5 5-5 5M20 12H9a5 5 0 0 0 0 10h1" />, props);

export const IconUser = (props: IconProps) =>
  base(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
    </>,
    props
  );