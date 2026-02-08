import { useEffect, useState } from "react";
import "./App.css";

type Task = {
  label: string;
  coins: number;
};

const earnTasks: Task[] = [
  { label: "Workout", coins: 15 },
  { label: "5 min edit", coins: 3 },
  { label: "1 hour edit", coins: 20 },
  { label: "Cleaning the house", coins: 5 },
  { label: "24h fasting", coins: 20 },
  { label: "Complete to-do list", coins: 10 },
];

const spendTasks: Task[] = [
  { label: "Watch TV (1h)", coins: -20 },
  { label: "Eating out", coins: -15 },
  { label: "Delivery food", coins: -25 },
  { label: "Ice cream / snack", coins: -10 },
  { label: "Baseball", coins: -30 },
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
        
      </section>
    </div>
  );
}
