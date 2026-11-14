import React, { useState, useEffect } from 'react';
import { Navbar } from './components/navbar';
import { Hero } from './components/hero';
import { PlaygroundShell } from './components/playground-shell';
import { QuickstartSection } from './components/quickstart-section';
import { FeaturesSection } from './components/features-section';
import { DeveloperGuide } from './components/developer-guide';
import { Footer } from './components/footer';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const stored = window.localStorage.getItem('zettly-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [githubStars, setGithubStars] = useState<number | null>(null);

  // Sync theme with document element and localStorage
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    window.localStorage.setItem('zettly-theme', theme);
  }, [theme]);

  // Fetch GitHub stars asynchronously
  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    let active = true;
    const controller = new AbortController();

    const fetchStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/programinglive/zettly-editor', {
          signal: controller.signal,
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { stargazers_count?: number };
        if (active && typeof data.stargazers_count === 'number') {
          setGithubStars(data.stargazers_count);
        }
      } catch {
        // Fall back gracefully on network or rate limit errors
      }
    };

    fetchStars();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased selection:bg-indigo-500 selection:text-white dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200 font-sans">
      {/* 1. Global Navigation Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        githubStars={githubStars}
      />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Interactive Playground Shell (Centerpiece) */}
      <PlaygroundShell />

      {/* 4. Quickstart / Installation Guide */}
      <QuickstartSection />

      {/* 5. Feature Architecture Highlights */}
      <FeaturesSection />

      {/* 6. Comprehensive Developer Guide & API Reference */}
      <DeveloperGuide />

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}

export default App;
