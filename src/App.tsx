/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTab, AppSettings, DayTrackerData } from './types';
import { 
  loadSettings, 
  saveSettings, 
  loadDayTracker, 
  saveDayTracker, 
  loadLastReadPage, 
  loadLastReadPageAsync,
  saveLastReadPage,
  loadBookmarks,
  saveBookmarks,
  onStorageChange
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { QuranView } from './components/QuranView';
import { AthkarView } from './components/AthkarView';
import { TrackerView } from './components/TrackerView';
import { ThimarView } from './components/ThimarView';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { DuasView } from './components/DuasView';
import { MishkatAlNoorView } from './components/MishkatAlNoorView';
import { QiblaCompassView } from './components/QiblaCompassView';
import { SebhaModal } from './components/SebhaModal';
import { VoicePracticeModal } from './components/VoicePracticeModal';
import { HomeButtonFloating } from './components/HomeButtonFloating';
import { GlobalAudioPlayer } from './components/GlobalAudioPlayer';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { TopNavbarWithDropdown } from './components/TopNavbarWithDropdown';
import { GlobalPrayerAlertModal } from './components/GlobalPrayerAlertModal';
import { TafseerAdawiView } from './components/TafseerAdawiView';

export default function App() {
  // Always open on the main Home View upon opening the program as requested
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [trackerData, setTrackerData] = useState<DayTrackerData>(loadDayTracker());
  const [lastReadPage, setLastReadPage] = useState<number>(loadLastReadPage());
  const [targetMushafPage, setTargetMushafPage] = useState<number | null>(null);
  const [isQuranFocusMode, setIsQuranFocusMode] = useState<boolean>(false);

  // Modals state
  const [isSebhaOpen, setIsSebhaOpen] = useState(false);
  const [voicePracticeData, setVoicePracticeData] = useState<{
    isOpen: boolean;
    ayahText: string;
    surahName: string;
  }>({
    isOpen: false,
    ayahText: '',
    surahName: ''
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Synchronize global font zoom scale across the entire application and DOM
  useEffect(() => {
    const scale = settings.appFontScale || 100;
    document.documentElement.classList.remove('font-scale-100', 'font-scale-115', 'font-scale-130', 'font-scale-145');
    document.documentElement.classList.add(`font-scale-${scale}`);
    document.documentElement.style.setProperty('--app-font-scale', String(scale / 100));
  }, [settings.appFontScale]);

  const handleUpdateFontScale = (scale: 100 | 115 | 130 | 145) => {
    const updated = { ...settings, appFontScale: scale };
    handleUpdateSettings(updated);
  };

  // Synchronize with IndexedDB recovery and cross-tab/service-worker changes
  useEffect(() => {
    // Attempt async hydration from IndexedDB for last read page if needed
    loadLastReadPageAsync().then((page) => {
      if (page > 1) {
        setLastReadPage(page);
      }
    });

    const unsub = onStorageChange((key, val) => {
      if (key === 'jannat_last_read_page_v1' && typeof val === 'number') {
        setLastReadPage(val);
      }
    });

    const handleRestored = () => {
      setSettings(loadSettings());
      setTrackerData(loadDayTracker());
      setLastReadPage(loadLastReadPage());
    };

    window.addEventListener('jannat_storage_restored', handleRestored);
    return () => {
      unsub();
      window.removeEventListener('jannat_storage_restored', handleRestored);
    };
  }, []);

  // Sync tracker changes
  const handleUpdateTracker = (updated: DayTrackerData) => {
    setTrackerData(updated);
    saveDayTracker(updated);
  };

  const handleUpdateSettings = (updated: AppSettings) => {
    setSettings(updated);
    saveSettings(updated);
  };

  const handleSaveBookmark = (page: number, surahName?: string) => {
    setLastReadPage(page);
    saveLastReadPage(page);
    const existing = loadBookmarks();
    if (!existing.some((b) => b.type !== 'ayah' && Number(b.targetId) === page)) {
      const newBm = {
        id: `bm-${Date.now()}`,
        type: 'page' as const,
        title: surahName ? `سورة ${surahName}` : `صفحة ${page}`,
        subtitle: `صفحة ${page} في المصحف`,
        targetId: page,
        createdAt: Date.now(),
        pageNumber: page
      };
      saveBookmarks([newBm, ...existing]);
    }
  };

  const handleOpenMushafPage = (page: number) => {
    setTargetMushafPage(page);
    setLastReadPage(page);
    saveLastReadPage(page);
    setCurrentTab('quran');
  };

  const handleOpenVoicePractice = (ayahText: string, surahName: string) => {
    setVoicePracticeData({
      isOpen: true,
      ayahText,
      surahName
    });
  };

  return (
    <div className="min-h-screen islamic-bg-blue text-[#071f3d] dark:text-[#EAF1FA] transition-colors duration-300 flex flex-col font-cairo">
      {/* Network Offline / Online Notification Banner */}
      <NetworkStatusBanner />

      {/* PWA Install Banner for instant offline access */}
      <InstallPwaBanner />

      {/* Top Navbar with Doors Dropdown and Global Font Zoom Control */}
      {!(currentTab === 'quran' && isQuranFocusMode) && (
        <TopNavbarWithDropdown
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setIsQuranFocusMode(false);
            setCurrentTab(tab);
          }}
          onOpenSebha={() => setIsSebhaOpen(true)}
          fontScale={settings.appFontScale || 100}
          onChangeFontScale={handleUpdateFontScale}
        />
      )}

      {/* Global Quick Home Button (available everywhere in all tabs & subviews) */}
      <HomeButtonFloating
        currentTab={currentTab}
        onGoHome={() => {
          setIsQuranFocusMode(false);
          setCurrentTab('home');
        }}
      />

      {/* Main View Area with Smooth Transitions */}
      <main className="flex-1 w-full max-w-lg mx-auto overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <HomeView
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenMushafPage={handleOpenMushafPage}
                onOpenSebha={() => setIsSebhaOpen(true)}
                trackerData={trackerData}
                lastReadPage={lastReadPage}
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}

          {currentTab === 'quran' && (
            <motion.div
              key="quran"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <QuranView
                initialPage={targetMushafPage || undefined}
                lastReadPage={lastReadPage}
                settings={settings}
                onSaveBookmark={handleSaveBookmark}
                onOpenVoicePractice={handleOpenVoicePractice}
                onToggleFocusMode={(isFocus) => setIsQuranFocusMode(isFocus)}
                onPageChange={(page) => {
                  setLastReadPage(page);
                  saveLastReadPage(page);
                  setTargetMushafPage(null);
                }}
                onUpdateSettings={handleUpdateSettings}
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}

          {currentTab === 'athkar' && (
            <motion.div
              key="athkar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <AthkarView
                onThikrCompleted={() => {
                  const updated = {
                    ...trackerData,
                    athkarCompletedCount: trackerData.athkarCompletedCount + 1,
                    habits: {
                      ...trackerData.habits,
                      morning_athkar: true
                    }
                  };
                  handleUpdateTracker(updated);
                }}
                onOpenSebha={() => setIsSebhaOpen(true)}
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}

          {currentTab === 'tracker' && (
            <motion.div
              key="tracker"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <TrackerView
                trackerData={trackerData}
                onUpdateTracker={handleUpdateTracker}
                onOpenSebha={() => setIsSebhaOpen(true)}
                onNavigateToQibla={() => setCurrentTab('qibla')}
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}

          {currentTab === 'duas' && (
            <motion.div
              key="duas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <DuasView
                onBack={() => setCurrentTab('home')}
                onOpenMushafPage={handleOpenMushafPage}
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}

          {currentTab === 'mishkat' && (
            <motion.div
              key="mishkat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <MishkatAlNoorView
                onBack={() => setCurrentTab('home')}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}

          {currentTab === 'thimar' && (
            <motion.div
              key="thimar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <ThimarView 
                onBackToHome={() => setCurrentTab('home')} 
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}

          {currentTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <SearchView
                onBack={() => setCurrentTab('home')}
                onSelectSurah={(page) => handleOpenMushafPage(page)}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
              />
            </motion.div>
          )}

          {currentTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onBack={() => setCurrentTab('home')}
              />
            </motion.div>
          )}

          {currentTab === 'qibla' && (
            <motion.div
              key="qibla"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <QiblaCompassView onBackToHome={() => setCurrentTab('home')} />
            </motion.div>
          )}

          {currentTab === 'tafseer_adawi' && (
            <motion.div
              key="tafseer_adawi"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <TafseerAdawiView
                onBack={() => setCurrentTab('home')}
                fontScale={settings.appFontScale || 100}
                onChangeFontScale={handleUpdateFontScale}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Navigation Bar (shown on core tabs when not in focus mode) */}
      {(['home', 'quran', 'athkar', 'tracker', 'duas', 'mishkat', 'thimar', 'qibla', 'tafseer_adawi'].includes(currentTab) && !(currentTab === 'quran' && isQuranFocusMode)) && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setIsQuranFocusMode(false);
            setCurrentTab(tab);
          }}
          onOpenSebha={() => setIsSebhaOpen(true)}
        />
      )}

      {/* Smart Electronic Sebha Modal */}
      <SebhaModal
        isOpen={isSebhaOpen}
        onClose={() => setIsSebhaOpen(false)}
      />

      {/* Voice Practice & Recording Modal */}
      <VoicePracticeModal
        isOpen={voicePracticeData.isOpen}
        onClose={() => setVoicePracticeData({ ...voicePracticeData, isOpen: false })}
        ayahText={voicePracticeData.ayahText}
        surahName={voicePracticeData.surahName}
      />

      {/* Global Audio Player (persists across tab changes) */}
      <GlobalAudioPlayer />

      {/* Global Prayer Time Adhan Alert Modal ("الله أكبر الله أكبر") */}
      <GlobalPrayerAlertModal />
    </div>
  );
}
