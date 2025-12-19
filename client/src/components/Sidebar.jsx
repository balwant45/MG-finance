import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/mgFinanceLogo.svg";
// Assuming the external background color is a light beige (e.g., #FFFDE7)
const MAIN_CONTENT_BG = "#FFFDE7";
const SIDEBAR_COLOR = "#4e6739";
const ACTIVE_COLOR = "#4A7A48"; // Lighter green for active background

// Component for the user profile section (Unchanged for this fix)
const UserProfile = () => (
  <div className="absolute bottom-0 w-full px-4 py-6">
    <div className="flex items-center space-x-3 text-white">
      {/* ... Profile Details JSX ... */}
    </div>
  </div>
);

function Sidebar() {
  const location = useLocation();

  // Stricter matching for the root dashboard path
  const isDashboardRoot =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  const navLinks = [
    {
      path: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.48 7.81987C17.4796 7.81946 17.4792 7.81904 17.4788 7.81863L10.1507 0.485021C9.83838 0.172281 9.4231 0 8.98136 0C8.53963 0 8.12434 0.172144 7.81185 0.484884L0.487667 7.81479C0.4852 7.81726 0.482733 7.81987 0.480266 7.82234C-0.161161 8.46798 -0.160064 9.51552 0.483418 10.1595C0.777406 10.4539 1.16569 10.6244 1.58083 10.6422C1.59769 10.6439 1.61469 10.6447 1.63182 10.6447H1.92389V16.0418C1.92389 17.1097 2.79214 17.9787 3.85954 17.9787H6.7265C7.01706 17.9787 7.2528 17.7429 7.2528 17.452V13.2207C7.2528 12.7333 7.64889 12.3369 8.13586 12.3369H9.82687C10.3138 12.3369 10.7099 12.7333 10.7099 13.2207V17.452C10.7099 17.7429 10.9455 17.9787 11.2362 17.9787H14.1032C15.1706 17.9787 16.0388 17.1097 16.0388 16.0418V10.6447H16.3097C16.7513 10.6447 17.1665 10.4725 17.4792 10.1598C18.1233 9.5147 18.1236 8.46537 17.48 7.81987Z"
            fill="white"
          />
        </svg>
      ),
      isRoot: true, // Flag the dashboard link
    },
    {
      path: "customers",
      label: "Customer Details",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.87259 8.67065C10.0638 8.67065 11.0953 8.24342 11.938 7.4005C12.7808 6.55771 13.2081 5.52651 13.2081 4.33519C13.2081 3.14427 12.7808 2.11294 11.9379 1.26988C11.095 0.427229 10.0636 0 8.87259 0C7.68126 0 6.65005 0.427229 5.80727 1.27001C4.96448 2.1128 4.53711 3.14414 4.53711 4.33519C4.53711 5.52651 4.96448 6.55785 5.8074 7.40064C6.65033 8.24328 7.68167 8.67065 8.87259 8.67065Z"
            fill="white"
          />
          <path
            d="M16.4577 13.8407C16.4333 13.49 16.3842 13.1074 16.3118 12.7034C16.2388 12.2963 16.1447 11.9115 16.0321 11.5598C15.9158 11.1963 15.7576 10.8373 15.562 10.4933C15.359 10.1363 15.1206 9.82537 14.8531 9.56953C14.5734 9.30188 14.2309 9.08668 13.8348 8.92972C13.4401 8.77357 13.0027 8.69447 12.5349 8.69447C12.3511 8.69447 12.1734 8.76987 11.8302 8.9933C11.619 9.13104 11.3719 9.29034 11.0962 9.46653C10.8604 9.61677 10.541 9.75753 10.1464 9.88497C9.76149 10.0095 9.37065 10.0727 8.98489 10.0727C8.59914 10.0727 8.20844 10.0095 7.82309 9.88497C7.42896 9.75767 7.10953 9.61691 6.87401 9.46667C6.60086 9.29213 6.35367 9.13283 6.1393 8.99316C5.79652 8.76973 5.61868 8.69434 5.43494 8.69434C4.96692 8.69434 4.52966 8.77357 4.13512 8.92985C3.73933 9.08655 3.3967 9.30174 3.11668 9.56967C2.8493 9.82565 2.61076 10.1364 2.40807 10.4933C2.21265 10.8373 2.05444 11.1962 1.93799 11.56C1.82552 11.9117 1.73145 12.2963 1.65839 12.7034C1.58601 13.1068 1.53685 13.4896 1.51254 13.8411C1.48865 14.1856 1.47656 14.543 1.47656 14.9041C1.47656 15.8437 1.77525 16.6043 2.36426 17.1653C2.94598 17.7189 3.71571 17.9997 4.65175 17.9997H13.3189C14.2549 17.9997 15.0244 17.719 15.6062 17.1653C16.1954 16.6047 16.494 15.8439 16.494 14.9039C16.4939 14.5412 16.4817 14.1835 16.4577 13.8407Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      path: "dailycollection",
      label: "Daily Collection",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_72_1286)">
            <path
              d="M3.75 16.5C3.75047 16.8977 3.90865 17.2789 4.18984 17.5601C4.47103 17.8413 4.85226 17.9995 5.24992 18H12.7495C13.1472 17.9995 13.5284 17.8413 13.8096 17.5601C14.0908 17.2789 14.249 16.8977 14.2495 16.5V15.8438H3.75V16.5Z"
              fill="white"
            />
            <path
              d="M14.2495 1.5C14.249 1.10232 14.0908 0.721063 13.8096 0.439861C13.5284 0.158658 13.1472 0.000471406 12.7495 0L5.24992 0C4.85226 0.000471406 4.47103 0.158658 4.18984 0.439861C3.90865 0.721063 3.75047 1.10232 3.75 1.5V2.25H14.2495V1.5Z"
              fill="white"
            />
            <path
              d="M17.7909 4.82422L15.541 2.48047L14.459 3.51922L15.4003 4.49984H14.25V5.99985H15.4812L14.4811 6.95834L15.5188 8.04135L17.7687 5.8851C17.8399 5.81691 17.8969 5.73538 17.9365 5.64515C17.9761 5.55492 17.9976 5.45777 17.9996 5.35924C18.0017 5.26072 17.9843 5.16276 17.9485 5.07095C17.9127 4.97915 17.8591 4.89531 17.7909 4.82422Z"
              fill="white"
            />
            <path
              d="M11.9996 4.5H14.2495V3H3.75V12H5.99989V13.5H3.75V15H14.2495V6H11.9996V4.5ZM11.2496 7.5H8.62475C8.5253 7.5 8.42992 7.53951 8.3596 7.60984C8.28928 7.68016 8.24977 7.77554 8.24977 7.875C8.24977 7.97446 8.28928 8.06984 8.3596 8.14017C8.42992 8.21049 8.5253 8.25 8.62475 8.25H9.37471C9.83967 8.24953 10.2882 8.42186 10.6333 8.73352C10.9783 9.04518 11.1953 9.47394 11.242 9.93656C11.2887 10.3992 11.1619 10.8627 10.8861 11.2371C10.6104 11.6114 10.2054 11.87 9.7497 11.9625V12.75H8.24977V12H6.74985V10.5H9.37471C9.47417 10.5 9.56954 10.4605 9.63987 10.3902C9.71019 10.3198 9.7497 10.2245 9.7497 10.125C9.7497 10.0255 9.71019 9.93016 9.63987 9.85984C9.56954 9.78951 9.47417 9.75 9.37471 9.75H8.62475C8.15979 9.75047 7.71125 9.57815 7.36619 9.26649C7.02113 8.95483 6.80418 8.52607 6.75746 8.06344C6.71073 7.60081 6.83756 7.13732 7.11332 6.76295C7.38909 6.38858 7.79411 6.13003 8.24977 6.0375V5.25H9.7497V6H11.2496V7.5Z"
              fill="white"
            />
            <path
              d="M2.51863 12.0005L3.5187 11.042L2.48094 9.95898L0.231059 12.1152C0.159915 12.1834 0.102904 12.265 0.0632856 12.3552C0.0236672 12.4454 0.00221769 12.5426 0.000163055 12.6411C-0.00189158 12.7396 0.0154889 12.8376 0.0513112 12.9294C0.0871334 13.0212 0.140695 13.105 0.208935 13.1761L2.45882 15.5199L3.54083 14.4811L2.59953 13.5005H3.74979V12.0005H2.51863Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_72_1286">
              <rect width="18" height="18" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      path: "createloan",
      label: "New Loan",
      icon: (
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_72_1304)">
            <path
              d="M13.8073 14.2698C17.6126 14.2698 20.7084 11.5176 20.7084 8.1349C20.7084 4.75215 17.6126 2 13.8073 2C10.0021 2 6.90625 4.75211 6.90625 8.13486C6.90625 11.5176 10.0021 14.2698 13.8073 14.2698ZM11.5898 10.0493C11.7905 9.77864 12.2021 9.70267 12.5089 9.8798C12.9561 10.1377 13.1247 10.1615 13.7148 10.1579C14.2907 10.1545 14.6248 9.77595 14.6916 9.42561C14.7241 9.25521 14.7365 8.83909 14.1517 8.65677C13.4658 8.44292 12.7639 8.19849 12.2755 7.86069C11.7872 7.52288 11.5636 6.93971 11.692 6.33886C11.8312 5.68749 12.3464 5.16897 13.0366 4.98564C13.0428 4.984 13.049 4.98268 13.0552 4.98104V4.75906C13.0552 4.43566 13.3525 4.17347 13.7192 4.17347C14.0859 4.17347 14.3832 4.43566 14.3832 4.75906V4.94414C14.8341 5.03909 15.1491 5.22105 15.277 5.30533C15.5707 5.49901 15.6308 5.86594 15.4112 6.125C15.1917 6.38407 14.7756 6.43708 14.4819 6.24337C14.3458 6.15366 13.9698 5.9608 13.4196 6.10701C13.0982 6.19242 13.0148 6.4721 12.9969 6.55576C12.9618 6.72015 13.0012 6.87424 13.0951 6.93913C13.4336 7.17328 14.0429 7.38062 14.5943 7.55251C15.6111 7.86947 16.1764 8.70022 16.0012 9.61975C15.9152 10.0709 15.6578 10.4895 15.2764 10.7985C15.0167 11.009 14.7144 11.1591 14.3832 11.2448V11.5107C14.3832 11.8341 14.0859 12.0962 13.7192 12.0962C13.3525 12.0962 13.0552 11.8341 13.0552 11.5107V11.3032C12.6259 11.2573 12.2655 11.1388 11.7819 10.8599C11.4751 10.6828 11.389 10.3199 11.5898 10.0493Z"
              fill="white"
            />
            <path
              d="M3.17796 16.2373H1.66399C1.29729 16.2373 1 16.4995 1 16.8229V21.4135C1 21.7369 1.29729 21.9991 1.66399 21.9991H3.178V16.2373H3.17796Z"
              fill="white"
            />
            <path
              d="M22.8053 16.196C21.5608 15.0985 19.5358 15.0984 18.2913 16.196L16.3023 17.9502L15.4871 18.6692C15.1576 18.9598 14.7107 19.123 14.2448 19.123H10.2806C9.92256 19.123 9.61448 18.8803 9.59761 18.5649C9.57964 18.2282 9.88388 17.9502 10.2618 17.9502H14.2911C15.1013 17.9502 15.8039 17.4415 15.9432 16.7377C15.9752 16.5761 15.9919 16.4099 15.9919 16.2403C15.9919 15.9163 15.6943 15.6534 15.327 15.6534H13.1191C12.3976 15.6534 11.7047 15.3647 10.9711 15.0591C10.2016 14.7385 9.40598 14.407 8.47565 14.3525C7.66196 14.3046 6.84641 14.3832 6.05153 14.5856C5.20043 14.8024 4.58864 15.4693 4.51445 16.2392C4.51161 16.239 4.50874 16.2389 4.50586 16.2388V21.9967L15.9453 21.9995C16.7318 21.9995 17.4713 21.7294 18.0276 21.2388L22.8052 17.0253C23.065 16.7964 23.065 16.425 22.8053 16.196Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_72_1304">
              <rect width="25" height="25" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
    },
  ];

  // --- Determine Active Link Path (Helper function) ---
  const getActivePath = (linkPath, isRoot) => {
    if (isRoot) {
      // 🎯 LOGIC FIX 2: Only match if it's the exact root path
      return isDashboardRoot;
    }
    // 🎯 LOGIC FIX 3: Use strict startswith matching for sub-routes
    // We look for /dashboard/customers, /dashboard/dailycollection, etc.
    return location.pathname.startsWith(`/dashboard/${linkPath}`);
  };

  return (
    // 🎨 STYLING FIX 1: Apply rounded corners to the ASIDE element
    // The sidebar touches the left, so we don't need a left margin.
    <aside className="w-64 bg-[#3B4F2A] text-white h-screen relative rounded-tr-3xl rounded-br-3xl overflow-hidden shadow-lg">
      {/* Logo and Title */}
      <div className="p-4 pt-8 pb-4 text-center">
        <img src={logo} alt="MG Finance Logo" className="mx-auto "/>
       
      </div>

      {/* Navigation Menu */}
      {/* 🎨 STYLING FIX 2: Use a negative horizontal margin to make the links appear wider than the menu width */}
      <ul className="menu text-lg space-y-0 mt-8 mx-0 px-0">
        {navLinks.map((link) => {
          const isActive = getActivePath(link.path, link.isRoot);
          const linkToPath = link.isRoot
            ? "/dashboard"
            : `/dashboard/${link.path}`;

          // 🎨 STYLING FIX 3: Link Padding, Background, and Text Color
          const baseLinkClass = `flex items-center space-x-3 py-3 pl-8 pr-10 transition-all duration-200 relative`;

          const activeBg = isActive
            ? `bg-[${MAIN_CONTENT_BG}] -mr-4` // Uses the light background of the main content & negative margin
            : `hover:bg-[${ACTIVE_COLOR}]`;

          const activeTextColor = isActive
            ? `text-[${SIDEBAR_COLOR}]`
            : "text-white";
          const activeIconColor = isActive ? "fill-black" : "fill-white"; // Separate icon color class

          return (
            <li key={link.path} className="relative">
              <Link
                to={linkToPath}
                className={`${baseLinkClass} ${activeBg} ${activeTextColor} w-[calc(100%+16px)]`}
                // The w-[calc(100%+16px)] class pushes the link container 16px past the sidebar border (w-4 = 16px)
              >
                {/* Icon container needs the fill color */}
                <span className={`w-6 h-6 fill-emerald-600 ${activeIconColor}`}>
                  {link.icon}
                </span>
                <span>{link.label}</span>

                {isActive && (
                  <>
                    <div
                      className="absolute -top-10 right-0 w-4 h-4"
                      style={{ backgroundColor: MAIN_CONTENT_BG }}
                    >
                      <div
                        className="w-4 h-4 rounded-br-[16px]"
                        style={{ backgroundColor: SIDEBAR_COLOR }}
                      ></div>
                    </div>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User Profile Section (Bottom) */}
      <UserProfile />
    </aside>
  );
}

export default Sidebar;
