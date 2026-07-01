import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Upload,
  FileText,
  X,
  Zap,
  Users,
  BarChart3,
  Award,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
  Loader2,
} from 'lucide-react'
import axios from 'axios'
import { PixelCanvas } from '../components/ui/pixel-canvas'

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
})

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showSplash])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith('.docx')) {
      setFile(dropped)
      setError(null)
    } else {
      setError('Please upload a .docx file only')
    }
  }, [])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.name.endsWith('.docx')) {
      setFile(selected)
      setError(null)
    } else {
      setError('Please upload a .docx file only')
    }
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setProgress(0)
    setResults(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p
        return p + Math.random() * 15
      })
    }, 400)

    try {
      const { data } = await axios.post('http://127.0.0.1:8000/rank', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      })
      clearInterval(progressInterval)
      setProgress(100)
      setTimeout(() => {
        setResults(data)
        setLoading(false)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      setLoading(false)
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to rank candidates. Please ensure the backend is running.'
      )
    }
  }

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 bg-[#0b0c15] z-[9999] flex flex-col items-center justify-center p-4 overflow-hidden"
          >
            {/* Background glowing gradients */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
              <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px] animate-pulse" />
            </div>

            {/* Premium Logo / Canvas Box */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
              className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-[32px] border border-border-glass bg-[#101221]/40 backdrop-blur-xl p-1 flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.15)] overflow-hidden group"
            >
              <PixelCanvas
                gap={8}
                speed={25}
                colors={["#22d3ee", "#818cf8", "#34d399"]}
                variant="icon"
                autoPlay
              />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    filter: [
                      "drop-shadow(0 0 10px rgba(34,211,238,0.3))",
                      "drop-shadow(0 0 20px rgba(34,211,238,0.6))",
                      "drop-shadow(0 0 10px rgba(34,211,238,0.3))"
                    ]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#101221]/80 border border-primary/20 flex items-center justify-center"
                >
                  <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </motion.div>
              </div>
            </motion.div>

            {/* Branding Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-primary via-white to-accent bg-clip-text text-transparent">
                AI Recruiter
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-2 tracking-widest uppercase">
                Matching talent with intelligence
              </p>
            </motion.div>

            {/* Subtle Progress Loading Indicator */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.7, duration: 2.0 }}
              className="w-48 h-1 rounded-full bg-gradient-to-r from-primary via-accent to-success mt-10 origin-left"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ delay: 0.8, duration: 2, repeat: Infinity }}
              className="text-[10px] text-text-dim mt-2 tracking-wider"
            >
              Initializing analysis engines...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[140px] animate-blob animation-delay-4000" />
        <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-success/5 blur-[80px] animate-blob" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-glass bg-bg/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
                <PixelCanvas
                  gap={5}
                  speed={15}
                  colors={["#22d3ee", "#818cf8"]}
                  variant="icon"
                />
                <Brain className="w-5 h-5 text-primary relative z-10 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight group-hover:text-primary transition-colors duration-300">AI Recruiter</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-glass bg-bg-glass">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-text-muted">System Online</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeIn(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-glass bg-bg-glass">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-muted">AI-Powered Candidate Ranking</span>
            </motion.div>

            <motion.h1
              variants={fadeIn(0.1)}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="text-white">Find the </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Perfect Hire</span>
              <span className="text-white"> in Seconds</span>
            </motion.h1>

            <motion.p
              variants={fadeIn(0.2)}
              className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed"
            >
              Upload a job description and let our AI engine instantly rank candidates
              by semantic relevance, skill alignment, and experience fit.
            </motion.p>

            <motion.div variants={fadeIn(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={scrollToUpload}
                className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary/90 to-primary/70 text-bg font-semibold text-sm transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center gap-2">
                  Start Ranking
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { icon: Zap, label: 'Average Processing', value: '< 2 min', colors: ["#22d3ee", "#818cf8"] },
              { icon: Shield, label: 'AI Powered', value: 'GPT-4o', colors: ["#818cf8", "#34d399"] },
              { icon: TrendingUp, label: 'Accuracy', value: '96.8%', colors: ["#34d399", "#22d3ee"] },
              { icon: Users, label: 'Candidates', value: 'Unlimited', colors: ["#22d3ee", "#818cf8", "#34d399"] },
            ].map((stat, i) => (
              <div
                key={i}
                className="group relative p-4 rounded-xl border border-border-glass bg-bg-glass/50 backdrop-blur-sm hover:border-primary/30 hover:bg-primary-dim/10 transition-all duration-300 overflow-hidden"
              >
                <PixelCanvas
                  gap={6}
                  speed={20}
                  colors={stat.colors}
                  variant="icon"
                />
                <div className="relative z-10">
                  <stat.icon className="w-5 h-5 text-primary mb-2 mx-auto transition-transform duration-300 group-hover:scale-110" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-text-dim mt-0.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border-glass bg-bg-card/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Upload Job Description</h2>
                <p className="text-sm text-text-dim">Drop a .docx file to begin ranking</p>
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                dragActive
                  ? 'border-primary bg-primary-dim/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                  : 'border-border-glass bg-bg-glass/30 hover:border-primary/40 hover:bg-primary-dim/10'
              }`}
            >
              <PixelCanvas
                gap={15}
                speed={20}
                colors={["#22d3ee", "#818cf8", "#34d399"]}
                variant="default"
              />
              <input
                ref={inputRef}
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-center gap-4 relative z-10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                        {file.name}
                      </div>
                      <div className="text-xs text-text-dim">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearFile()
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-danger-dim flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-text-dim hover:text-danger" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative z-10"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-7 h-7 text-primary/60" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">
                      Drag & drop your .docx file here
                    </p>
                    <p className="text-xs text-text-dim">or click to browse</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-4 p-3 rounded-lg border border-danger/30 bg-danger-dim flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
                    <X className="w-3 h-3 text-danger" />
                  </div>
                  <p className="text-sm text-danger">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  !file || loading
                    ? 'bg-bg-glass text-text-dim cursor-not-allowed border border-border-glass'
                    : 'bg-gradient-to-r from-primary/90 to-primary/70 text-bg hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Candidates...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Rank Candidates
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-dim">Processing</span>
                    <span className="text-xs font-medium text-primary">{Math.min(100, Math.round(progress))}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-glass overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, progress)}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-text-dim">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="animate-shimmer inline-block">Running semantic analysis on candidate profiles...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative pb-24 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-5xl mx-auto">
              {/* Statistics Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
              >
                {[
                  {
                    icon: Users,
                    label: 'Total Candidates',
                    value: results.total?.toString() || '0',
                    color: 'primary',
                  },
                  {
                    icon: Award,
                    label: 'Top Score',
                    value: results.results?.[0]?.score
                      ? `${(results.results[0].score * 100).toFixed(0)}%`
                      : '0%',
                    color: 'success',
                  },
                  {
                    icon: BarChart3,
                    label: 'Avg Score',
                    value: results.results?.length
                      ? `${(
                          (results.results.reduce((s, r) => s + r.score, 0) / results.results.length) *
                          100
                        ).toFixed(0)}%`
                      : '0%',
                    color: 'warning',
                  },
                  {
                    icon: CheckCircle2,
                    label: 'Ranked',
                    value: results.results?.length?.toString() || '0',
                    color: 'accent',
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="p-5 rounded-xl border border-border-glass bg-bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-${stat.color}/10`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-text-dim mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-white">Candidate Rankings</h2>
                <div className="ml-auto text-xs text-text-dim">
                  Sorted by AI Score
                </div>
              </div>

              {/* Candidate Cards */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {results.results?.map((candidate, index) => (
                  <CandidateCard
                    key={candidate.candidate_id}
                    candidate={candidate}
                    rank={index + 1}
                    total={results.results.length}
                    index={index}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative border-t border-border-glass py-8 px-4 text-center">
        <p className="text-sm text-text-dim">
          AI Recruiter — Powered by intelligent semantic matching
        </p>
      </footer>
    </div>
  )
}

function CandidateCard({ candidate, rank, total, index }) {
  const score = candidate.score * 100
  const isTop = rank === 1
  const isTop3 = rank <= 3

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl border p-5 sm:p-6 transition-all duration-300 hover:shadow-lg ${
        isTop
          ? 'border-primary/40 bg-primary-dim/10 shadow-[0_0_20px_rgba(34,211,238,0.08)]'
          : 'border-border-glass bg-bg-card/50 backdrop-blur-sm hover:border-primary/20'
      }`}
    >
      {/* Top Badge */}
      {isTop && (
        <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-bg text-xs font-bold flex items-center gap-1">
          <Award className="w-3 h-3" />
          Top Match
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Rank */}
        <div className="flex items-center gap-3 sm:w-20 shrink-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isTop
                ? 'bg-primary text-bg'
                : isTop3
                ? 'bg-primary/15 text-primary'
                : 'bg-bg-glass text-text-dim'
            }`}
          >
            {rank}
          </div>
          <div className="sm:hidden text-sm text-text-dim">of {total}</div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-white truncate">
              {candidate.candidate_id}
            </h3>
            {isTop && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Best Fit
              </span>
            )}
          </div>
          <p className="text-sm text-text-dim mb-3">
            Candidate #{index + 1}
          </p>

          {/* Reasons */}
          <div className="flex flex-wrap gap-2">
            {candidate.reasons?.map((reason, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-success/20 bg-success-dim text-success"
              >
                <CheckCircle2 className="w-3 h-3" />
                {reason}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="sm:w-40 shrink-0 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-dim">AI Score</span>
            <span className="text-sm font-bold text-white">{score.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-bg-glass overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                score >= 80
                  ? 'bg-gradient-to-r from-success to-primary'
                  : score >= 60
                  ? 'bg-gradient-to-r from-warning to-primary'
                  : 'bg-gradient-to-r from-danger to-warning'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-1.5 text-right text-xs text-text-dim">
            {score >= 90 ? 'Excellent' : score >= 75 ? 'Strong' : score >= 60 ? 'Good' : 'Fair'} match
          </div>
        </div>
      </div>
    </motion.div>
  )
}
