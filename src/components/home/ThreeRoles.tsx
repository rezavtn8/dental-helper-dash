import { Target, Zap, Clock, Trophy, Award, Flame, CircleCheckBig, Activity, Calendar, Users, TrendingUp, ChartColumn, Star, Award as TrophyIcon } from 'lucide-react';

export function ThreeRoles() {
  return (
    <div className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Train Section */}
        <section className="mb-48 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Text Content - Left */}
            <div className="lg:sticky lg:top-32">
              <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Train
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Equip your team with structured, clinic-specific learning. From HIPAA and infection control to patient communication, marketing, and insurance skills—Dentaleague turns everyday staff training into engaging, trackable progress.
              </p>
            </div>

            {/* Floating Cards - Right */}
            <div className="relative min-h-[700px]">
              {/* HIPAA Compliance Card */}
              <div className="absolute top-0 right-0 w-full max-w-md transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Target className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-3">HIPAA Compliance</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>75% Complete</span>
                        <span>Intermediate</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 rounded-lg text-xs font-semibold text-purple-600">
                        <Zap className="w-3 h-3" />
                        ACTIVE QUIZ
                      </div>
                    </div>
                    <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* Patient Communication Card */}
              <div className="absolute top-32 left-0 w-full max-w-sm transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <h3 className="font-semibold text-xl mb-3">Patient Communication</h3>
                  <div className="flex items-center gap-4 text-base mb-3">
                    <span className="font-semibold">8/10</span>
                    <span className="text-muted-foreground">Pass: 80%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 rounded-full text-sm font-semibold text-emerald-700">
                      <Award className="w-4 h-4" />
                      CERTIFIED
                    </div>
                  </div>
                </div>
              </div>

              {/* Infection Control Card */}
              <div className="absolute top-64 right-12 w-80 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <h3 className="font-semibold text-xl mb-2">Infection Control</h3>
                  <p className="text-sm text-muted-foreground">Dec 2024</p>
                </div>
              </div>

              {/* Learning Streak Card */}
              <div className="absolute top-96 left-8 w-72 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm opacity-90 font-medium">Learning Streak</p>
                        <p className="text-3xl font-bold">5 Days</p>
                      </div>
                    </div>
                    <div className="text-4xl font-bold">+50</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Track Section */}
        <section className="mb-48 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Floating Cards - Left */}
            <div className="relative min-h-[700px]">
              {/* Morning Equipment Check Card */}
              <div className="absolute top-0 left-0 w-full max-w-md transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full text-xs font-semibold text-emerald-700 mb-4">
                    <CircleCheckBig className="w-4 h-4" />
                    completed
                  </div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-xl">Morning Equipment Check</h3>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                        S
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">Sarah</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Progress Card */}
              <div className="absolute top-32 right-0 w-full max-w-sm transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="52"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          className="text-muted/20"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="52"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray="326.73"
                          strokeDashoffset="26"
                          className="text-primary transition-all duration-1000"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">92%</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-xl">Team Progress</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Sterilization Card */}
              <div className="absolute top-80 left-8 w-full max-w-md transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl mb-3">Weekly Sterilization</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>8 tasks</span>
                        <span>Compliance</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary rounded-full text-sm font-semibold text-white">
                        <Users className="w-4 h-4" />
                        <span>3 tasks assigned</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content - Right */}
            <div className="lg:sticky lg:top-32">
              <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Track
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who's done what, when, and how well, all in one clean dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Analyze Section */}
        <section className="relative">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Text Content - Left */}
            <div className="lg:sticky lg:top-32">
              <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Analyze
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.
              </p>
            </div>

            {/* Floating Cards - Right */}
            <div className="relative min-h-[700px]">
              {/* Team Completion Card */}
              <div className="absolute top-0 right-0 w-full max-w-sm transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <p className="text-sm text-muted-foreground mb-2">Team Completion</p>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-bold">92%</span>
                    <TrendingUp className="w-7 h-7 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Performance Trend Card */}
              <div className="absolute top-32 left-0 w-80 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <ChartColumn className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-xl">Performance Trend</h3>
                  </div>
                </div>
              </div>

              {/* Top Performer Card */}
              <div className="absolute top-64 right-8 w-72 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-start justify-between mb-4 text-white">
                    <div className="flex items-center gap-2">
                      <Star className="w-7 h-7 fill-white animate-pulse" />
                      <TrophyIcon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium opacity-90">Top Performer</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">Hafsa</h3>
                  <div className="text-5xl font-bold text-white">98</div>
                </div>
              </div>

              {/* Live Tasks Card */}
              <div className="absolute top-[450px] left-4 w-full max-w-sm transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className="bg-card border rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-6 h-6 text-primary animate-pulse" />
                        <span className="text-sm font-bold text-primary uppercase tracking-wide">Live</span>
                      </div>
                      <div className="text-4xl font-bold mb-2">15</div>
                      <p className="text-sm text-muted-foreground font-medium">Tasks Completed</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">2.3 days avg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
