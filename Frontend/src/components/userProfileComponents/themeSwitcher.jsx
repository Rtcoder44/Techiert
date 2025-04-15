import React, { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
      root.classList.toggle("light", !prefersDark);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 font-medium">🎨 Theme</label>
      <select
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="system">System Default</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};

export default ThemeSwitcher;
