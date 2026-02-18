import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Task = {
  label: string;
  coins: number;
};

type Transaction = {
  label: string;
  amount: number;
  date: string;
};

const earnTasks: Task[] = [
  { label: "Workout", coins: 15 },
  { label: "5 min edit", coins: 3 },
  { label: "1 hour edit", coins: 20 },
  { label: "Cleaning the house", coins: 2 },
  { label: "24h fasting", coins: 20 },
  { label: "Complete to-do list", coins: 10 },
];

const spendTasks: Task[] = [
  { label: "Watch TV (1h)", coins: -20 },
  { label: "Eating out", coins: -15 },
  { label: "Delivery food", coins: -25 },
  { label: "Ice cream / snack", coins: -10 },
  { label: "Baseball", coins: -30 },
  { label: "늦잠", coins: -25 },
];

export default function App() {
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem("dodoCoins");
    return saved !== null ? Number(saved) : 0;
  });

  const [displayCoins, setDisplayCoins] = useState(coins);
  const prevCoins = useRef(coins);

  const [history, setHistory] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("dodoHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const today = new Date().toISOString().slice(0, 10);

  // Persist
  useEffect(() => {
    localStorage.setItem("dodoCoins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("dodoHistory", JSON.stringify(history));
  }, [history]);

  // Animated balance
  useEffect(() => {
    const start = prevCoins.current;
    const end = coins;
    const duration = 400;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const value = Math.round(start + (end - start) * progress);
      setDisplayCoins(value);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    prevCoins.current = coins;
  }, [coins]);

  // Daily +2 bonus
  useEffect(() => {
    const lastFree = localStorage.getItem("lastFreeDay");
    if (lastFree !== today) {
      setCoins((c) => c + 2);
      setHistory((h) => [
        {
          label: "Daily Bonus",
          amount: 2,
          date: new Date().toISOString(),
        },
        ...h,
      ]);
      localStorage.setItem("lastFreeDay", today);
    }
  }, [today]);

  const applyTask = (task: Task) => {
    setCoins((c) => {
      if (c + task.coins < 0) {
        alert("Not enough coins.");
        return c;
      }

      setHistory((h) => [
        {
          label: task.label,
          amount: task.coins,
          date: new Date().toISOString(),
        },
        ...h,
      ]);

      return c + task.coins;
    });
  };

  const resetCoins = () => {
    if (!confirm("Reset coins to 0?")) return;
    setCoins(0);
    localStorage.setItem("dodoCoins", "0");
    localStorage.removeItem("lastFreeDay");
  };

  const clearHistory = () => {
    if (!confirm("Clear all history?")) return;
    setHistory([]);
    localStorage.removeItem("dodoHistory");
  };

  // Weekly summary
  const weeklySummary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    let earned = 0;
    let spent = 0;

    history.forEach((t) => {
      const d = new Date(t.date);
      if (d >= weekAgo) {
        if (t.amount > 0) earned += t.amount;
        else spent += t.amount;
      }
    });

    return {
      earned,
      spent,
      net: earned + spent,
      avgPerDay: (earned + spent) / 7,
    };
  }, [history]);

  // Graph
  const balancePoints = useMemo(() => {
    const sorted = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let running = 0;
    const points: number[] = [];

    sorted.forEach((t) => {
      running += t.amount;
      points.push(running);
    });

    return points;
  }, [history]);

  const maxBalance = Math.max(...balancePoints, 10);
  const graphWidth = 300;
  const graphHeight = 120;

  const graphPath =
    balancePoints.length > 1
      ? balancePoints
          .map((value, i) => {
            const x = (i / (balancePoints.length - 1)) * graphWidth;
            const y = graphHeight - (value / maxBalance) * graphHeight;
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  // Format date as YYYY.MM.DD
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  };

  return (
    <div className="container">
      <h1>🦤 Dodo Coin</h1>
      <h2 className="balance">Balance: {displayCoins}</h2>

      <section>
        <h3>Earn</h3>
        {earnTasks.map((task) => (
          <button key={task.label} onClick={() => applyTask(task)}>
            {task.label} (+{task.coins})
          </button>
        ))}
      </section>

      <section>
        <h3>Spend</h3>
        {spendTasks.map((task) => (
          <button key={task.label} onClick={() => applyTask(task)}>
            {task.label} ({task.coins})
          </button>
        ))}
      </section>

      <section>
        <button onClick={resetCoins}>Reset Coins</button>
        <button onClick={clearHistory}>Clear History</button>
      </section>

      <section>
        <h3>Weekly Summary</h3>
        <p>Earned: +{weeklySummary.earned}</p>
        <p>Spent: {weeklySummary.spent}</p>
        <p>Net: {weeklySummary.net}</p>
        <p>Average / Day: {weeklySummary.avgPerDay.toFixed(1)}</p>
      </section>

      <section>
        <h3>Balance Over Time</h3>
        <svg width={graphWidth} height={graphHeight}>
          <path
            d={graphPath}
            fill="none"
            stroke="#6be7a4"
            strokeWidth="2"
            style={{ transition: "all 0.4s ease" }}
          />
        </svg>
      </section>

      <section>
        <h3>History</h3>
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {history.map((t, i) => (
            <div key={i}>
              {formatDate(t.date)} &nbsp;
              {t.amount > 0 ? "+" : ""}
              {t.amount} &nbsp;
              {t.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
