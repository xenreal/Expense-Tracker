import React , {useState , useEffect} from 'react';
import { Link } from "react-router-dom";
import { getTransactions } from '../api/client';
import { Search , UploadCloud , ArrowDownLeft , ArrowUpRight , Loader2 , AlertCircle } from 'lucide-react';

const TransactionPage = () => {
    const [transactions , setTransactions] = useState([]);
    const [loading , setLoading ] = useState(true);
    const [error , setError ] = useState(null);

    const [searchQuery ,  setSearchQuery ] = useState("");
    const [selectedPeriod , setSelectedPeriod] = useState("");

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTransactions({
                q: searchQuery,
                period: selectedPeriod,
            });
            setTransactions(data);
        } catch(err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    };

    useEffect (()=> {
        loadTransactions();
    } , [searchQuery , selectedPeriod])

  return (
    <div className='max-w-6xl mx-auto px-6 py-8'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
         <div>
            <h1 className='text-2xl font-bold tracking-tight text-white'>
                Transaction Feed
            </h1>

            <p className="text-sm text-slate-400 mt-1">Search, Filter and track all your bank statement records.</p>
         </div>

         <Link to="/upload" className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 
         text-white text-sm font-semibold shadow-[0_0_15px_rgba(37,99,235,0.35)] transition-all duration-200 self-start sm:self-auto'>
           
           <UploadCloud className='w-4 h-4' />
           <span>Upload Statement</span>
         
         </Link>
      </div>

      <div className='flex flex-col md:flex-row items-strech md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111827]/60 
      border border-blue-900/20 backdrop-blur-md mb-8'>

        <div className='relative flex-1'>

            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' /> 

            <input type="text" placeholder='Search by Name' value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-[#090D16] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500
             focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all'/>

        </div>

        <div className='flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0'>
            {
                [
                    
                    {label: "All" , value: ""},
                    {label: "This week" , value: "week"},
                    {label: "This Month" , value: "month"},
                    {label: "This Year" , value: "year"},
                    {label: "6 Months" , value: "6 months"},
                ].map((pill =>(
                    <button key={pill.value} type='button' onClick={()=>
                        setSelectedPeriod(pill.value)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedPeriod === pill.value
                    ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                    >
                    {pill.label}
                    </button>
                )))
            }

        </div>
        </div>   

      {loading ? (

        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#111827]/40 border border-blue-900/20 text-center">
          <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            No Transactions Found
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            Upload your bank statement Excel sheet to automatically parse, track, and analyze your expenses.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-[0_0_12px_rgba(37,99,235,0.35)] transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Your First Statement</span>
          </Link>
        </div>
      ) : (
                /* Transactions Table */
        <div className="overflow-x-auto rounded-2xl border border-blue-900/20 bg-[#111827]/40 backdrop-blur-md">
          <table className="w-full text-left text-sm text-slate-300">
            
            {/* Table Headings */}
            <thead className="text-xs uppercase bg-[#090D16]/60 text-slate-400 border-b border-blue-900/20">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Payee / Description</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => {
                const isCredit = tx.transaction_type?.toLowerCase() === "credit";

                return (
                  <tr key={tx.id} className="hover:bg-blue-950/20 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium">
                      {tx.date}
                    </td>

                    {/* Payee / Person */}
                    <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                      {tx.person}
                    </td>

                    {/* Type Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isCredit
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {isCredit ? "Credit" : "Debit"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-mono font-semibold tabular-nums ${
                        isCredit ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isCredit ? "+" : "-"} ₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}

      </div>

  );
}

export default TransactionPage
 