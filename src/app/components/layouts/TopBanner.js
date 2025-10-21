// "use client";

// import React, { useState } from "react";
// import { useTranslations } from "@/app/hooks/useTranslations";

// export default function TopBanner() {
//   const t = useTranslations();
//   const [isVisible, setIsVisible] = useState(true);

//   if (!isVisible) return null;

//   return (
//     <div className="bg-gradient-to-r fixed from-gold to-yellow-500 text-offwhite text-center py-2 text-sm font-medium font-text">
//       ⭐⭐⭐ {t("freeShipping")} ⭐⭐⭐
//       <button
//         className="ml-4 text-offwhite hover:text-yellow-200"
//         onClick={() => setIsVisible(false)}
//         aria-label={t("closeBanner")}
//       >
//         ×
//       </button>
//     </div>
//   );
// }
