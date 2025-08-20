"use client";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function LunchCalculator() {
  function formatCurrency(value: number) {
    return `RM${value.toFixed(2)}`;
  }
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [input, setInput] = useState("");
  const [items, setItems] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sstEnabled, setSstEnabled] = useState(false);
  const [serviceEnabled, setServiceEnabled] = useState(false);
  const [sst, setSst] = useState(8);
  const [service, setService] = useState(10);
  const [dark, setDark] = useState(false);
  const [mealLog, setMealLog] = useState<Array<any>>([]);
  const [logCollapsed, setLogCollapsed] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lunch-calc-state");
      if (saved) {
        const state = JSON.parse(saved);
        setItems(state.items || []);
        setSstEnabled(state.sstEnabled || false);
        setServiceEnabled(state.serviceEnabled || false);
        setSst(state.sst ?? 8);
        setService(state.service ?? 10);
        setDark(state.dark || false);
        setMealLog(state.mealLog || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "lunch-calc-state",
      JSON.stringify({
        items,
        sstEnabled,
        serviceEnabled,
        sst,
        service,
        dark,
        mealLog,
      })
    );
  }, [items, sstEnabled, serviceEnabled, sst, service, dark, mealLog]);

  const handleAdd = () => {
    const val = parseFloat(input);
    if (!isNaN(val) && val > 0) {
      setItems([...items, val]);
      setInput("");
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    setInput("");
    setItems([]);
    setSstEnabled(false);
    setServiceEnabled(false);
    setSst(8);
    setService(10);
    setDark(false);
  };

  const handleNewMeal = () => {
    if (items.length > 0) {
      const subtotal = items.reduce((a, b) => a + b, 0);
      const sstAmount = sstEnabled ? subtotal * (sst / 100) : 0;
      const serviceAmount = serviceEnabled ? subtotal * (service / 100) : 0;
      const total = subtotal + sstAmount + serviceAmount;
      setMealLog([
        {
          date: new Date().toLocaleString(),
          items: [...items],
          sstEnabled,
          serviceEnabled,
          sst,
          service,
          subtotal,
          sstAmount,
          serviceAmount,
          total,
        },
        ...mealLog,
      ]);
    }
    setInput("");
    setItems([]);
    setSstEnabled(false);
    setServiceEnabled(false);
    setSst(8);
    setService(10);
  };

  const subtotal = items.reduce((a, b) => a + b, 0);
  const sstAmount = sstEnabled ? subtotal * (sst / 100) : 0;
  const serviceAmount = serviceEnabled ? subtotal * (service / 100) : 0;
  const total = subtotal + sstAmount + serviceAmount;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-background transition-colors duration-300 ${
        dark ? "dark" : ""
      }`}
    >
      <Card className="w-full max-w-md p-6 shadow-lg rounded-xl bg-card">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            🍽️ Lunch Costing Calculator
          </h1>
          <Button
            variant="outline"
            onClick={() => setDark((d) => !d)}
            title="Toggle dark mode"
          >
            {dark ? "🌙" : "☀️"}
          </Button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">
            {date.toLocaleString()}
          </span>
        </div>
        <div className="mb-6 border-b pb-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                checked={sstEnabled}
                onCheckedChange={setSstEnabled}
                id="sst-switch"
              />
              <label htmlFor="sst-switch" className="text-sm font-medium">
                SST
              </label>
              <span
                className="text-xs text-muted-foreground"
                title="Sales & Service Tax"
              >
                ?
              </span>
              {sstEnabled && (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={sst}
                  onChange={(e) => setSst(Number(e.target.value))}
                  className="w-16"
                />
              )}
              {sstEnabled && <span className="text-xs">%</span>}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={serviceEnabled}
                onCheckedChange={setServiceEnabled}
                id="service-switch"
              />
              <label htmlFor="service-switch" className="text-sm font-medium">
                Service Tax
              </label>
              <span
                className="text-xs text-muted-foreground"
                title="Service charge at restaurant"
              >
                ?
              </span>
              {serviceEnabled && (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={service}
                  onChange={(e) => setService(Number(e.target.value))}
                  className="w-16"
                />
              )}
              {serviceEnabled && <span className="text-xs">%</span>}
            </div>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex gap-2 items-center mb-2">
            <Input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              placeholder="Enter item price (e.g. 7.50)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              className="flex-1 text-lg px-4 py-2 border-2 border-accent rounded focus:border-primary"
            />
            <Button onClick={handleAdd} variant="default" title="Add item">
              ＋
            </Button>
          </div>
          <div className="flex gap-2 items-center justify-between">
            <Button
              onClick={handleNewMeal}
              variant="secondary"
              title="Log meal & start new"
            >
              📝 New Meal
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <div className="text-base font-semibold mb-2">Current Meal</div>
          <Card className="bg-muted p-3 mb-2">
            <ul className="list-disc pl-5 text-sm">
              {items.length === 0 && (
                <li className="text-muted-foreground">No items yet.</li>
              )}
              {items.map((item, idx) => (
                <li key={idx} className="animate-pulse text-primary">
                  {formatCurrency(item)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="mb-6">
          <div className="text-base font-semibold mb-2">Summary</div>
          <Card className="bg-muted p-3">
            <div className="space-y-1 text-right">
              <div>
                Subtotal:{" "}
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {sstEnabled && (
                <div>
                  SST ({sst}%):{" "}
                  <span className="font-mono">{formatCurrency(sstAmount)}</span>
                </div>
              )}
              {serviceEnabled && (
                <div>
                  Service Tax ({service}%):{" "}
                  <span className="font-mono">
                    {formatCurrency(serviceAmount)}
                  </span>
                </div>
              )}
              <div className="text-lg font-bold">
                Total:{" "}
                <span className="font-mono text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </Card>
        </div>
        {/* Collapsible Meal Log */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Meal Log</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogCollapsed((c: boolean) => !c)}
            >
              {logCollapsed ? "Show" : "Hide"}
            </Button>
          </div>
          {!logCollapsed && mealLog.length > 0 && (
            <ul className="space-y-2">
              {mealLog.map((meal, idx) => (
                <li key={idx} className="border rounded p-2 text-xs bg-muted">
                  <div className="mb-1 font-bold">{meal.date}</div>
                  <div>
                    Items:{" "}
                    {meal.items
                      .map((v: number) => formatCurrency(v))
                      .join(", ")}
                  </div>
                  <div>Subtotal: {formatCurrency(meal.subtotal)}</div>
                  {meal.sstEnabled && (
                    <div>
                      SST ({meal.sst}%): {formatCurrency(meal.sstAmount)}
                    </div>
                  )}
                  {meal.serviceEnabled && (
                    <div>
                      Service Tax ({meal.service}%):{" "}
                      {formatCurrency(meal.serviceAmount)}
                    </div>
                  )}
                  <div>
                    Total:{" "}
                    <span className="font-bold">
                      {formatCurrency(meal.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {mealLog.length === 0 && !logCollapsed && (
            <div className="text-muted-foreground text-xs">
              No meals logged yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
