import React, {useState , useEffect} from 'react';
import { getSummary } from '../api/client';
import { TrendingDown , TrendingUp , Scale , Loader2 , AlertCircle } from 'lucide-react';

const SummaryPage = () => {

  const [summary , setSummary] = useState(null);
  const [loading , setLoading] = useState(true);
  const [error , setError] = useState(null);
  const [selectedPeriod , setSelectedPeriod] = useState("");

   const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSummary({ period: selectedPeriod });
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSummary();
  }, [selectedPeriod]);

    return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Financial Summary
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Total income, expenses, and net cash flow at a glance.
        </p>
      </div>

      {/* Period Filter Pills */}
      <div className="flex items-center justify-center gap-1.5 mb-8">
        {[
          { label: "All Time", value: "" },
          { label: "This Week", value: "week" },
          { label: "This Month", value: "month" },
          { label: "This Year", value: "year" },
          { label: "6 Months", value: "6 months" },
        ].map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => setSelectedPeriod(pill.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              selectedPeriod === pill.value
                ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Conditional Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading financial summary...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Expenses (Debited) */}
          <div className="p-6 rounded-2xl bg-[#111827]/60 border border-rose-900/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-sm font-medium text-slate-400">Total Expenses</p>
            </div>
            <p className="text-3xl font-bold text-rose-400 font-mono tabular-nums">
              ₹{Number(summary.total_debited).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          {/* Card 2: Total Income (Credited) */}
          <div className="p-6 rounded-2xl bg-[#111827]/60 border border-emerald-900/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-slate-400">Total Income</p>
            </div>
            <p className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              ₹{Number(summary.total_credited).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          {/* Card 3: Net Balance */}
          <div className={`p-6 rounded-2xl backdrop-blur-md border ${
            summary.net_balance >= 0
              ? "bg-[#111827]/60 border-blue-900/20"
              : "bg-[#111827]/60 border-rose-900/20"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${
                summary.net_balance >= 0
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : "bg-rose-500/10 border border-rose-500/20"
              }`}>
                <Scale className={`w-5 h-5 ${
                  summary.net_balance >= 0 ? "text-blue-400" : "text-rose-400"
                }`} />
              </div>
              <p className="text-sm font-medium text-slate-400">Net Balance</p>
            </div>
            <p className={`text-3xl font-bold font-mono tabular-nums ${
              summary.net_balance >= 0 ? "text-blue-400" : "text-rose-400"
            }`}>
              {summary.net_balance >= 0 ? "+" : "-"} ₹{Math.abs(summary.net_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      ) : null}

    </div>
  );
}

export default SummaryPage
