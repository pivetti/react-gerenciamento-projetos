const icons = {
  dashboard: (
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v3A1.5 1.5 0 0 1 8.5 10h-3A1.5 1.5 0 0 1 4 8.5v-3Zm10 0A1.5 1.5 0 0 1 15.5 4h3A1.5 1.5 0 0 1 20 5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 14 8.5v-3ZM4 15.5A1.5 1.5 0 0 1 5.5 14h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3Zm10 0a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3Z" />
  ),
  projects: <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm4 1.75h8M8 12h8M8 15.75h4" />,
  activities: <path d="m5 12 4 4L19 6M5 6h7M5 18h7" />,
  participants: <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4 20a4.5 4.5 0 0 1 9 0m1-1.5a3.5 3.5 0 0 1 6 1.5" />,
  resources: <path d="M12 3 4.5 7.25 12 11.5l7.5-4.25L12 3Zm-7.5 8.25L12 15.5l7.5-4.25M4.5 15.25 12 19.5l7.5-4.25" />,
  costs: <path d="M12 3v18m4-14.5H9.5a3 3 0 0 0 0 6H14a3 3 0 0 1 0 6H7.5" />,
  risks: <path d="M12 4 3.5 19h17L12 4Zm0 5.5v4m0 2.75h.01" />,
  settings: <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-5v2m0 12v2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42M4 12h2m12 0h2M5.64 18.36l1.42-1.42m9.88-9.88 1.42-1.42" />,
  help: <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-2.25-9a2.25 2.25 0 1 1 3.4 1.94c-.72.43-1.15.8-1.15 1.56m0 2h.01" />,
  search: <path d="m20 20-4.35-4.35M10.75 18a7.25 7.25 0 1 1 0-14.5 7.25 7.25 0 0 1 0 14.5Z" />,
  bell: <path d="M18 9.5a6 6 0 1 0-12 0c0 7-2 7-2 7h16s-2 0-2-7ZM10 20h4" />,
  sun: <path d="M12 4V2m0 20v-2m8-8h2M2 12h2m14.36-6.36 1.42-1.42M4.22 19.78l1.42-1.42m0-12.72L4.22 4.22m15.56 15.56-1.42-1.42M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />,
  filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
  sort: <path d="M8 4v16m0 0-3-3m3 3 3-3m8-13v16m0-16-3 3m3-3 3 3" />,
  hide: <path d="M3 12s3.5-6 9-6c2.1 0 3.9.86 5.34 1.98M21 12s-3.5 6-9 6c-2.1 0-3.9-.86-5.34-1.98M4 4l16 16" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  login: <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" />,
  logout: <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9" />,
  userPlus: <path d="M8.5 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3 21a5.5 5.5 0 0 1 11 0m4-7v6m-3-3h6" />,
  home: <path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" />,
  reports: <path d="M5 20V4h14v16H5Zm4-4h6M9 12h6M9 8h3" />,
  team: <path d="M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 20a4.5 4.5 0 0 1 9 0m-1 0a4.5 4.5 0 0 1 9 0" />,
  eye: <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  arrowLeft: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
}

export function Icon({ name, className = 'h-4 w-4' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {icons[name] || icons.dashboard}
    </svg>
  )
}
