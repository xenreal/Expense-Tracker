import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadStatement } from "../api/client";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X 
} from "lucide-react";

const UploadPage = () => {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setError("Invalid format. Please select an Excel file (.xlsx or .xls)");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an Excel statement file first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await uploadStatement(file, password || null);
      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


    return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Upload Bank Statement
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Upload your Excel spreadsheet (.xlsx, .xls) to parse, clean, and track your expenses.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-2xl bg-[#111827]/60 border border-blue-900/20 backdrop-blur-md shadow-2xl space-y-6"
      >
        
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">Statement parsed successfully! Redirecting to feed...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx, .xls"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelect(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#090D16]/40 hover:bg-blue-950/10 group"
          >
            <div className="p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 w-fit mx-auto mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-slate-400">
              Supports Excel sheets (.xlsx, .xls) from SBI, HDFC, ICICI, etc.
            </p>
          </div>
        ) : (
          /* Selected File Preview Pill */
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#090D16] border border-blue-500/30">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

                {/* Optional Password Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Statement Password (Optional)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password if sheet is encrypted..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 bg-[#090D16] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Leave blank if your bank statement does not require a password to open.
          </p>
        </div>

        {/* Submit & Process Button */}
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            !file || loading
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
              <span>Decrypting & Processing Statement...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Upload & Process Statement</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}

export default UploadPage
