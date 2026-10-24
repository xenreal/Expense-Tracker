import React from 'react'
import {Link , useLocation } from "react-router-dom";
import {Wallet , ReceiptText ,UploadCloud , PieChart , Users } from "lucide-react";

const Header = () => {

    const location = useLocation();

    const navItems = [

        {label:"Transactions" ,
         path: "/",
         icon: ReceiptText
        }, 

        {label:"Upload Statement" ,
         path: "/upload",
         icon: UploadCloud
        },

        {label:"Summary" ,
         path: "/summary",
         icon: PieChart
        },

        {label:"Top Payees" ,
         path: "/payee",
         icon: Users
        },
    ];

  return (
    <div>
      <header className='border-b border-blue-900/30 bg-[#090D16]/80 backdrop-blur-md sticky top-0 z-50'>
         <div className='max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4'>

            <Link to="/" className='group'>
            <h1 className='text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400
            bg-clip-text text-transparent group-hover:to-cyan-300 transition-all'>
              Expense Tracker
            </h1>
            </Link>
        
          <nav className='flex items-center gap-1.5 bg-[#111827] p-1.5 rounded-xl border border-blue-900/20'>
            {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = location.pathname === item.path;

             return (
                <Link
                key = {item.path} to = {item.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium 
                transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                </Link>
             );
            })}
          </nav>

         </div>
      </header>
    </div>
  )
}

export default Header
