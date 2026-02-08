import { useEffect, useState } from "react";
import "./App.css";

type Task = {
  label: string;
  coins: number;
};

const earnTasks: Task[] = [
  { label: "Workout", coins: 15 },
  { label: "Short form video", coins: 20 },
  { label: "Long form video", coins: 50 },
  { label: "Cleaning the house", coins: 5 },
  { label: "24h fasting", coins: 20 },
  { label: "Complete to-do list", coins: 10 },
];

const spendTasks: Task[] = [
  { label: "Watch TV (1h)", coins: -20 },
  { label: "Eating out", coins: -15 },
  { label: "Delivery food", coins: -25 },
  { label: "Ice cream / snack", coins: -10 },
];

export default function App() {
  const [coins, setCoins] = useState<number>(() => {
    return Number(localStorage.getItem("dodoCoins")) || 0;
  });

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    localStorage.setItem("dodoCoins", coins.toString());
  }, [coins]);

  // Daily free coins (+2 once per day)
  useEffect(() => {
    const lastFree = localStorage.getItem("lastFreeDay");
    if (lastFree !== today) {
      setCoins((c) => c + 2);
      localStorage.setItem("lastFreeDay", today);
    }
  }, [today]);

  const applyTask = (amount: number) => {
    setCoins((c) => c + amount);
  };

  const endDayBonus = () => {
    const lastBonus = localStorage.getItem("lastEndBonus");
    if (lastBonus === today) {
      alert("End-of-day bonus already claimed.");
      return;
    }
    setCoins((c) => c + 10);
    localStorage.setItem("lastEndBonus", today);
  };

  return (
    <div className="container">
      <h1>🦤 Dodo Coin</h1>
      <h2>Balance: {coins}</h2>

      <section>
        <h3>Earn</h3>
        {earnTasks.map((task) => (
          <button key={task.label} onClick={() => applyTask(task.coins)}>
            {task.label} (+{task.coins})
          </button>
        ))}
      </section>

      <section>
        <h3>Spend</h3>
        {spendTasks.map((task) => (
          <button key={task.label} onClick={() => applyTask(task.coins)}>
            {task.label} ({task.coins})
          </button>
        ))}
      </section>

      <section>
        <button className="bonus" onClick={endDayBonus}>
          End of day bonus (+10)
        </button>
      </section>
    </div>
  );
}
