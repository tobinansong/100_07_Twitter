const PATHS = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16v-6a6 6 0 0 1 12 0v6l2 2H4l2-2Z" />
      <path d="M10 21h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </>
  ),
  follow: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 21c0-4.4 3.1-7 7-7s7 2.6 7 7" />
      <path d="M19 6v6M16 9h6" />
    </>
  ),
  heart: (
    <path d="M12 20.5 4.2 12.7a4.9 4.9 0 0 1 7-7l.8.8.8-.8a4.9 4.9 0 0 1 7 7L12 20.5Z" />
  ),
  reply: <path d="M4 5h16v11H9.5L4 20V5Z" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m6 7 1 13h10l1-13" />
    </>
  ),
  image: (
    <>
      <path d="M3 5h18v14H3z" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="m21 16-5-5-8 8" />
    </>
  ),
  logout: (
    <>
      <path d="M10 4H4v16h6" />
      <path d="m15 8 4 4-4 4" />
      <path d="M19 12H9" />
    </>
  ),
  close: <path d="m5 5 14 14M19 5 5 19" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2.3 6.3" />
      <path d="M20 5v6h-6" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  calendar: (
    <>
      <path d="M4 6h16v14H4z" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="M4 12.5 9.5 18 20 6.5" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <path d="m4 4 16 16" />
    </>
  ),
  send: (
    <>
      <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" />
      <path d="m10 13 4-4" />
    </>
  ),
  pencil: <path d="m4 20 1-4L16 5l3 3L8 19l-4 1Z" />,
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
