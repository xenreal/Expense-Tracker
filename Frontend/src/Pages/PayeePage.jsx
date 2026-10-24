import React, { useState, useEffect } from "react";
import { getTopPayee } from "../api/client";
import { Users, Trophy, Loader2, AlertCircle } from "lucide-react";

const PayeePage = () => {
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const loadPayees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopPayee({ period: selectedPeriod, limit: 10 });
      setPayees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayees();
  }, [selectedPeriod]);

  const maxAmount = payees[0]?.amount || 1;
  
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Top Payees
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Ranked list of merchants and people you spent the most money on.
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
          <p className="text-sm font-medium">Calculating top payees...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : payees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#111827]/40 border border-blue-900/20 text-center">
          <div className="p-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            No Payee Data
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            No debit expenses found for the selected time period.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payees.map((payee, index) => {
            const percent = (payee.amount / maxAmount) * 100;
            return (
              <div
                key={payee.person + index}
                className="p-4 rounded-xl bg-[#111827]/60 border border-blue-900/20 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/40 transition-all"
              >
                {/* Visual Relative Spending Bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-blue-600/10 group-hover:bg-blue-600/20 transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge: Gold (#1), Silver (#2), Bronze (#3), Slate (#4+) */}
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        index === 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : index === 1
                          ? "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                          : index === 2
                          ? "bg-amber-700/20 text-amber-600 border border-amber-700/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {index === 0 ? (
                        <Trophy className="w-3.5 h-3.5" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </span>
                    {/* Payee / Merchant Name */}
                    <p className="text-sm font-semibold text-white truncate">
                      {payee.person}
                    </p>
                  </div>
                  {/* Formatted Amount */}
                  <p className="text-sm font-bold text-rose-400 font-mono tabular-nums shrink-0">
                    ₹{Number(payee.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PayeePage;