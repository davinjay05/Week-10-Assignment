"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

type Alarm = {
  id: string;
  time: string;
  label: string;
  active: boolean;
  triggered: boolean;
};

type TZEntry = { name: string; country: string; tz: string };

const allTimeZones: TZEntry[] = [
  { name: "New York", country: "US", tz: "America/New_York" },
  { name: "Los Angeles", country: "US", tz: "America/Los_Angeles" },
  { name: "Chicago", country: "US", tz: "America/Chicago" },
  { name: "Denver", country: "US", tz: "America/Denver" },
  { name: "Phoenix", country: "US", tz: "America/Phoenix" },
  { name: "Anchorage", country: "US", tz: "America/Anchorage" },
  { name: "Honolulu", country: "US", tz: "Pacific/Honolulu" },
  { name: "Toronto", country: "CA", tz: "America/Toronto" },
  { name: "Vancouver", country: "CA", tz: "America/Vancouver" },
  { name: "Mexico City", country: "MX", tz: "America/Mexico_City" },
  { name: "São Paulo", country: "BR", tz: "America/Sao_Paulo" },
  { name: "Buenos Aires", country: "AR", tz: "America/Argentina/Buenos_Aires" },
  { name: "Santiago", country: "CL", tz: "America/Santiago" },
  { name: "Lima", country: "PE", tz: "America/Lima" },
  { name: "Bogotá", country: "CO", tz: "America/Bogota" },
  { name: "Reykjavik", country: "IS", tz: "Atlantic/Reykjavik" },
  { name: "London", country: "GB", tz: "Europe/London" },
  { name: "Paris", country: "FR", tz: "Europe/Paris" },
  { name: "Berlin", country: "DE", tz: "Europe/Berlin" },
  { name: "Rome", country: "IT", tz: "Europe/Rome" },
  { name: "Madrid", country: "ES", tz: "Europe/Madrid" },
  { name: "Amsterdam", country: "NL", tz: "Europe/Amsterdam" },
  { name: "Stockholm", country: "SE", tz: "Europe/Stockholm" },
  { name: "Oslo", country: "NO", tz: "Europe/Oslo" },
  { name: "Helsinki", country: "FI", tz: "Europe/Helsinki" },
  { name: "Warsaw", country: "PL", tz: "Europe/Warsaw" },
  { name: "Prague", country: "CZ", tz: "Europe/Prague" },
  { name: "Vienna", country: "AT", tz: "Europe/Vienna" },
  { name: "Athens", country: "GR", tz: "Europe/Athens" },
  { name: "Istanbul", country: "TR", tz: "Europe/Istanbul" },
  { name: "Moscow", country: "RU", tz: "Europe/Moscow" },
  { name: "Cairo", country: "EG", tz: "Africa/Cairo" },
  { name: "Lagos", country: "NG", tz: "Africa/Lagos" },
  { name: "Nairobi", country: "KE", tz: "Africa/Nairobi" },
  { name: "Johannesburg", country: "ZA", tz: "Africa/Johannesburg" },
  { name: "Casablanca", country: "MA", tz: "Africa/Casablanca" },
  { name: "Dubai", country: "AE", tz: "Asia/Dubai" },
  { name: "Riyadh", country: "SA", tz: "Asia/Riyadh" },
  { name: "Baghdad", country: "IQ", tz: "Asia/Baghdad" },
  { name: "Tehran", country: "IR", tz: "Asia/Tehran" },
  { name: "Karachi", country: "PK", tz: "Asia/Karachi" },
  { name: "Kolkata", country: "IN", tz: "Asia/Kolkata" },
  { name: "Dhaka", country: "BD", tz: "Asia/Dhaka" },
  { name: "Colombo", country: "LK", tz: "Asia/Colombo" },
  { name: "Bangkok", country: "TH", tz: "Asia/Bangkok" },
  { name: "Jakarta", country: "ID", tz: "Asia/Jakarta" },
  { name: "Singapore", country: "SG", tz: "Asia/Singapore" },
  { name: "Kuala Lumpur", country: "MY", tz: "Asia/Kuala_Lumpur" },
  { name: "Manila", country: "PH", tz: "Asia/Manila" },
  { name: "Hong Kong", country: "HK", tz: "Asia/Hong_Kong" },
  { name: "Taipei", country: "TW", tz: "Asia/Taipei" },
  { name: "Beijing", country: "CN", tz: "Asia/Shanghai" },
  { name: "Seoul", country: "KR", tz: "Asia/Seoul" },
  { name: "Tokyo", country: "JP", tz: "Asia/Tokyo" },
  { name: "Sydney", country: "AU", tz: "Australia/Sydney" },
  { name: "Melbourne", country: "AU", tz: "Australia/Melbourne" },
  { name: "Brisbane", country: "AU", tz: "Australia/Brisbane" },
  { name: "Perth", country: "AU", tz: "Australia/Perth" },
  { name: "Adelaide", country: "AU", tz: "Australia/Adelaide" },
  { name: "Auckland", country: "NZ", tz: "Pacific/Auckland" },
  { name: "Fiji", country: "FJ", tz: "Pacific/Fiji" },
];

const defaultZones = allTimeZones.filter((z) =>
  ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney", "Asia/Dubai", "America/Sao_Paulo"].includes(z.tz)
);

const tabs = ["World Clock", "Timer", "Alarm", "Calculator", "Stopwatch"] as const;

type Tab = (typeof tabs)[number];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatClock = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", options).format(date);

const playTone = () => {
  if (typeof window === "undefined") return;
  const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
  if (!AudioContext) return;

  try {
    const context = new AudioContext();
    const now = context.currentTime;
    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    masterGain.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(440, now + 1.0);
    oscillator.connect(masterGain);

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.1, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i += 1) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    noiseSource.connect(noiseGain);
    noiseGain.connect(masterGain);

    oscillator.start(now);
    noiseSource.start(now);
    oscillator.stop(now + 1.2);
    noiseSource.stop(now + 0.12);
    oscillator.onended = () => context.close();
  } catch {
    // silent fallback
  }
};

function getGreeting(hour: number, name: string): string {
  if (hour >= 5 && hour < 12) return `Good Morning, ${name}!`
  if (hour >= 12 && hour < 17) return `Good Afternoon, ${name}!`
  if (hour >= 17 && hour < 21) return `Good Evening, ${name}!`
  return `Good Night, ${name}!`
}

export default function ClockApp({ userName }: { userName: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("World Clock");
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [now, setNow] = useState(() => new Date());

  const [selectedZones, setSelectedZones] = useState<TZEntry[]>(() => {
    if (typeof window === "undefined") return defaultZones;
    try {
      const saved = localStorage.getItem("worldClockZones");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return defaultZones;
  });
  const [tzSearch, setTzSearch] = useState("");
  const [tzDropdownOpen, setTzDropdownOpen] = useState(false);

  const filteredZones = allTimeZones.filter(
    (z) =>
      !selectedZones.some((s) => s.tz === z.tz) &&
      (z.name.toLowerCase().includes(tzSearch.toLowerCase()) ||
        z.country.toLowerCase().includes(tzSearch.toLowerCase()))
  );

  const addZone = (zone: TZEntry) => {
    setSelectedZones((prev) => [...prev, zone]);
    setTzSearch("");
    setTzDropdownOpen(false);
  };

  const removeZone = (tz: string) => {
    setSelectedZones((prev) => prev.filter((z) => z.tz !== tz));
  };

  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerInput, setTimerInput] = useState({ minutes: "5", seconds: "00" });
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  const evaluateExpression = (expression: string) => {
    const sanitized = expression.replace(/×/g, "*").replace(/÷/g, "/").replace(/[^0-9+\-*/(). ]/g, "");
    if (/([+\-*/.]{2,}|\(\)|\..\.)/.test(sanitized)) return "Error";
    try {
      const result = new Function(`"use strict"; return (${sanitized})`)();
      if (typeof result !== "number" || !Number.isFinite(result)) return "Error";
      return String(result);
    } catch {
      return "Error";
    }
  };

  const handleCalcButton = (value: string) => {
    if (value === "C") {
      setCalcDisplay("0");
      return;
    }
    if (value === "⌫") {
      setCalcDisplay((current) => {
        const next = current.slice(0, -1);
        return next.length ? next : "0";
      });
      return;
    }
    if (value === "=") {
      const result = evaluateExpression(calcDisplay);
      if (result !== "Error") {
        setCalcHistory((prev) => [`${calcDisplay} = ${result}`, ...prev].slice(0, 8));
      }
      setCalcDisplay(result);
      return;
    }
    if (value === "()") {
      setCalcDisplay((current) => {
        const openCount = (current.match(/\(/g) || []).length;
        const closeCount = (current.match(/\)/g) || []).length;
        return current + (openCount === closeCount ? "(" : ")");
      });
      return;
    }

    setCalcDisplay((current) => {
      if (current === "0" && value !== ".") return value;
      return current + value;
    });
  };

  const formatLocalDatetime = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const [alarmTime, setAlarmTime] = useState(() => formatLocalDatetime(new Date(Date.now() + 60_000)));
  const [alarmLabel, setAlarmLabel] = useState("Wake up");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const alarmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("worldClockZones", JSON.stringify(selectedZones));
  }, [selectedZones, isMounted]);

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const id = setTimeout(() => {
      setTimerSeconds((current) => Math.max(current - 1, 0));
      if (timerSeconds <= 1) {
        setTimerRunning(false);
        setTimerFinished(true);
        playTone();
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [timerRunning, timerSeconds]);

  useEffect(() => {
    if (!isMounted) return;
    const currentTime = formatClock(now, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    alarms.forEach((alarm) => {
      if (!alarm.active || alarm.triggered) return;
      if (alarm.time.endsWith(currentTime)) {
        setAlarms((prev) => prev.map((item) => (item.id === alarm.id ? { ...item, triggered: true } : item)));
        playTone();
        if (alarmTimeout.current) {
          clearTimeout(alarmTimeout.current);
        }
        alarmTimeout.current = setTimeout(() => {
          setAlarms((prev) => prev.map((item) => (item.id === alarm.id ? { ...item, triggered: false } : item)));
        }, 10000);
      }
    });
    return () => {
      if (alarmTimeout.current) {
        clearTimeout(alarmTimeout.current);
      }
    };
  }, [now, alarms, isMounted]);

  const timerProgress = useMemo(() => {
    const total = Number(timerInput.minutes) * 60 + Number(timerInput.seconds);
    if (!total) return 0;
    return 1 - timerSeconds / total;
  }, [timerSeconds, timerInput]);

  useEffect(() => {
    fetch("/api/alarms")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.alarms)) {
          setAlarms(data.alarms.map((a: Omit<Alarm, "triggered">) => ({ ...a, triggered: false })));
        }
      })
      .catch(() => {});
  }, []);

  const addAlarm = async () => {
    if (!alarmTime) return;
    try {
      const res = await fetch("/api/alarms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: alarmTime, label: alarmLabel || "Alarm" }),
      });
      if (res.ok) {
        const { alarm } = await res.json();
        setAlarms((prev) => [{ ...alarm, triggered: false }, ...prev]);
        setAlarmLabel("Wake up");
      }
    } catch (err) {
      console.error("addAlarm failed:", err);
    }
  };

  const deleteAlarm = async (id: string) => {
    try {
      await fetch("/api/alarms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    } catch (err) {
      console.error("deleteAlarm failed:", err);
    }
  };

  const toggleAlarm = async (id: string) => {
    try {
      await fetch("/api/alarms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, active: !alarm.active } : alarm)));
    } catch (err) {
      console.error("toggleAlarm failed:", err);
    }
  };

  const onTimerInputChange = (field: "minutes" | "seconds", value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, 2);
    const nextInput = { ...timerInput, [field]: sanitized };
    setTimerInput(nextInput);
    const minutes = field === "minutes" ? sanitized : nextInput.minutes;
    const seconds = field === "seconds" ? sanitized : nextInput.seconds;
    const parsedMinutes = Number(minutes || "0");
    const parsedSeconds = Number(seconds || "0");
    setTimerSeconds(parsedMinutes * 60 + Math.min(parsedSeconds, 59));
    setTimerFinished(false);
  };

  const resetTimer = () => {
    const minutes = Number(timerInput.minutes || "0");
    const seconds = Number(timerInput.seconds || "0");
    setTimerSeconds(minutes * 60 + seconds);
    setTimerRunning(false);
    setTimerFinished(false);
  };

  const startStopwatch = () => {
    setStopwatchRunning(true);
  };

  const stopStopwatch = () => {
    setStopwatchRunning(false);
  };

  const resetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const recordLap = () => {
    setLaps((prev) => [stopwatchTime, ...prev]);
  };

  useEffect(() => {
    if (!stopwatchRunning) return;
    const id = setInterval(() => setStopwatchTime((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [stopwatchRunning]);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">World Clock Suite</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">Clock App</h1>
              <p className="mt-2 text-lg font-medium text-cyan-200">
                {isMounted ? getGreeting(now.getHours(), userName) : `Welcome, ${userName}!`}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                View world times, run a countdown timer, set alarms, and control a stopwatch.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button
                onClick={handleLogout}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
              >
                Log out
              </button>
              <div className="rounded-3xl bg-zinc-800/80 px-5 py-4 text-right shadow-inner shadow-black/20 ring-1 ring-white/10">
                <p className="text-sm text-zinc-400">Local time</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {isMounted ? formatClock(now, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--"}
                </p>
                <p className="text-sm text-zinc-500">
                  {isMounted ? formatClock(now, { weekday: "long", month: "short", day: "numeric" }) : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </header>

        <nav className="grid gap-2 sm:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded-3xl border px-4 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                  : "border-white/5 bg-white/5 text-zinc-300 hover:border-white/10 hover:bg-white/10"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            {activeTab === "World Clock" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">World Clock</h2>
                  <span className="text-sm text-zinc-400">{selectedZones.length} clocks</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={tzSearch}
                    onChange={(e) => { setTzSearch(e.target.value); setTzDropdownOpen(true); }}
                    onFocus={() => setTzDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setTzDropdownOpen(false), 150)}
                    placeholder="Search city or country to add..."
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/90 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-1 ring-transparent transition focus:border-cyan-400/40 focus:ring-cyan-500/30"
                  />
                  {tzDropdownOpen && filteredZones.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl">
                      {filteredZones.slice(0, 8).map((zone) => (
                        <button
                          key={zone.tz}
                          onMouseDown={() => addZone(zone)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-200 transition hover:bg-white/10"
                        >
                          <span>{zone.name}</span>
                          <span className="text-xs text-zinc-500">{zone.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedZones.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
                    Search above to add a city.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedZones.map((city) => {
                      const date = new Date(now.toLocaleString("en-US", { timeZone: city.tz }));
                      return (
                        <div key={city.tz} className="group relative rounded-3xl border border-white/10 bg-white/5 p-5">
                          <button
                            onClick={() => removeZone(city.tz)}
                            className="absolute right-3 top-3 rounded-full p-1 text-zinc-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                            aria-label={`Remove ${city.name}`}
                          >
                            ✕
                          </button>
                          <p className="text-sm text-cyan-200/80">{city.name} <span className="text-zinc-500">· {city.country}</span></p>
                          <p className="mt-2 text-3xl font-semibold text-white">
                            {isMounted ? formatClock(date, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--"}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {isMounted ? formatClock(date, { weekday: "short", month: "short", day: "numeric" }) : "---"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Timer" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Countdown Timer</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      Set a duration, then start the countdown. The timer will play a short tone when it ends.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-zinc-800/80 px-5 py-4 text-right ring-1 ring-white/10">
                    <p className="text-sm text-zinc-400">Remaining</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatTime(timerSeconds)}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 text-sm text-zinc-300">
                        Minutes
                        <input
                          type="text"
                          inputMode="numeric"
                          value={timerInput.minutes}
                          onChange={(event) => onTimerInputChange("minutes", event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-zinc-950/90 px-4 py-3 text-lg text-white outline-none ring-1 ring-transparent transition focus:border-cyan-400/40 focus:ring-cyan-500/30"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-zinc-300">
                        Seconds
                        <input
                          type="text"
                          inputMode="numeric"
                          value={timerInput.seconds}
                          onChange={(event) => onTimerInputChange("seconds", event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-zinc-950/90 px-4 py-3 text-lg text-white outline-none ring-1 ring-transparent transition focus:border-cyan-400/40 focus:ring-cyan-500/30"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="space-y-4">
                      <div className="h-3 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${timerProgress * 100}%` }} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                          onClick={() => {
                            setTimerRunning((current) => !current);
                            setTimerFinished(false);
                          }}
                        >
                          {timerRunning ? "Pause" : "Start"}
                        </button>
                        <button
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-cyan-400/40 hover:bg-white/10"
                          onClick={resetTimer}
                        >
                          Reset
                        </button>
                      </div>
                      {timerFinished && <p className="text-sm text-cyan-300">Timer complete! Tap reset to restart.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Alarm" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Alarms</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      Save multiple alarms and keep them active. The app checks alarms every second.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-zinc-800/80 px-5 py-4 text-right ring-1 ring-white/10">
                    <p className="text-sm text-zinc-400">Current time</p>
                    <p className="mt-2 text-3xl font-semibold text-white">
                      {isMounted ? formatClock(now, { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1.3fr]">
                    <label className="space-y-2 text-sm text-zinc-300">
                      Time
                      <input
                        type="datetime-local"
                        value={alarmTime}
                        onChange={(event) => setAlarmTime(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-zinc-950/90 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-cyan-400/40 focus:ring-cyan-500/30"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-zinc-300">
                      Label
                      <input
                        type="text"
                        value={alarmLabel}
                        onChange={(event) => setAlarmLabel(event.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-zinc-950/90 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-cyan-400/40 focus:ring-cyan-500/30"
                      />
                    </label>
                  </div>
                  <button
                    className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                    onClick={addAlarm}
                  >
                    Add Alarm
                  </button>
                </div>

                <div className="space-y-3">
                  {alarms.length ? (
                    alarms.map((alarm) => {
                      const triggered = alarm.triggered && alarm.active;
                      return (
                        <div key={alarm.id} className="rounded-3xl border border-white/10 bg-zinc-900/90 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xl font-semibold text-white">{alarm.label}</p>
                              <p className="mt-1 text-sm text-zinc-400">{alarm.time.replace("T", " ")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                                  alarm.active ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400" : "bg-white/5 text-zinc-300 hover:bg-white/10"
                                }`}
                                onClick={() => toggleAlarm(alarm.id)}
                              >
                                {alarm.active ? "Active" : "Paused"}
                              </button>
                              <button
                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-cyan-400/40 hover:bg-white/10"
                                onClick={() => deleteAlarm(alarm.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {triggered && <p className="mt-3 rounded-2xl bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">Alarm ringing!</p>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
                      No alarms set yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Calculator" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Calculator</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      Basic arithmetic with a compact calculator and history.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-zinc-800/80 px-5 py-4 text-right ring-1 ring-white/10">
                    <p className="text-sm text-zinc-400">Display</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{calcDisplay}</p>
                  </div>
                </div>

                <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4 text-right text-3xl font-semibold text-white">
                    {calcDisplay}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    {["C", "⌫", "()", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "=", ""].map((label) => {
                      if (!label) return <div key="empty" />;
                      return (
                        <button
                          key={label}
                          className={`rounded-2xl px-4 py-4 text-lg font-semibold transition ${
                            label === "="
                              ? "bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
                              : /[×÷\-+]/.test(label)
                              ? "bg-white/5 text-zinc-100 hover:bg-white/10"
                              : "bg-zinc-900 text-white hover:bg-zinc-800"
                          }`}
                          onClick={() => handleCalcButton(label)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2 rounded-3xl border border-white/10 bg-zinc-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">History</p>
                    {calcHistory.length ? (
                      <div className="space-y-2 text-sm text-zinc-200">
                        {calcHistory.map((entry, index) => (
                          <div key={`${entry}-${index}`} className="rounded-2xl bg-white/5 px-3 py-2">
                            {entry}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">No calculations yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Stopwatch" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Stopwatch</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                      Track elapsed time with lap support.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-zinc-800/80 px-5 py-4 text-right ring-1 ring-white/10">
                    <p className="text-sm text-zinc-400">Elapsed</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{formatTime(stopwatchTime)}</p>
                  </div>
                </div>

                <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                      onClick={stopwatchRunning ? stopStopwatch : startStopwatch}
                    >
                      {stopwatchRunning ? "Stop" : "Start"}
                    </button>
                    <button
                      className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                      onClick={recordLap}
                      disabled={!stopwatchRunning}
                    >
                      Lap
                    </button>
                    <button
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:border-cyan-400/40 hover:bg-white/10"
                      onClick={resetStopwatch}
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-3">
                    {laps.length ? (
                      laps.map((lap, index) => (
                        <div key={`${lap}-${index}`} className="rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-200">
                          <div className="flex items-center justify-between gap-4">
                            <span>Lap {laps.length - index}</span>
                            <span className="font-semibold text-white">{formatTime(lap)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-400">No laps recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6 rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Quick reference</p>
              <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 px-4 py-3">
                  <span>Local date</span>
                  <span>{isMounted ? formatClock(now, { month: "long", day: "numeric", year: "numeric" }) : "Loading..."}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 px-4 py-3">
                  <span>Time zone</span>
                  <span>{isMounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Loading..."}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 px-4 py-3">
                  <span>Timer</span>
                  <span>{timerRunning ? "Running" : timerFinished ? "Complete" : "Ready"}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-zinc-950/80 px-4 py-3">
                  <span>Stopwatch</span>
                  <span>{stopwatchRunning ? "Active" : "Paused"}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white">Tips</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                <li>Tap tabs to switch between world clock, timer, alarm, and stopwatch.</li>
                <li>Use the timer inputs to set minutes and seconds.</li>
                <li>Add alarms with a label to stay on schedule.</li>
                <li>Press Lap while the stopwatch is running to save split times.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
