import { Target, Zap, Clock, Trophy, Award, Flame, CircleCheckBig, Activity, Calendar, Users, TrendingUp, ChartColumn, Star, Award as TrophyIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ThreeRoles() {
  return (
    <div className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Train Section */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-5xl font-bold mb-6">Train</h2>
              <p className="text-lg text-muted-foreground">
                Equip your team with structured, clinic-specific learning. From HIPAA and infection control to patient communication, marketing, and insurance skills—Dentaleague turns everyday staff training into engaging, trackable progress.
              </p>
            </div>

            {/* Cards */}
            <div className="relative space-y-4">
              {/* HIPAA Compliance Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-learning-quiz/10 rounded-lg">
                    <Target className="w-5 h-5 text-learning-quiz" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">HIPAA Compliance</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>75% Complete</span>
                      <span>Intermediate</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-learning-quiz/20 rounded text-xs font-medium text-learning-quiz">
                      <Zap className="w-3 h-3" />
                      ACTIVE QUIZ
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
              </Card>

              {/* Patient Communication Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Patient Communication</h3>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span>8/10</span>
                      <span className="text-muted-foreground">Pass: 80%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-learning-achievement" />
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-learning-achievement/20 rounded-full text-xs font-medium">
                        <Award className="w-4 h-4" />
                        CERTIFIED
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Infection Control Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Infection Control</h3>
                  <p className="text-sm text-muted-foreground">Dec 2024</p>
                </div>
              </Card>

              {/* Learning Streak Card */}
              <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5" />
                    <div>
                      <p className="text-sm opacity-90">Learning Streak</p>
                      <p className="text-2xl font-bold">5 Days</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold">+50</div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Track Section */}
        <section className="mb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Cards */}
            <div className="relative space-y-4">
              {/* Morning Equipment Check Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-learning-success/20 rounded-full text-xs font-medium text-learning-success mb-3">
                      <CircleCheckBig className="w-4 h-4" />
                      completed
                    </div>
                    <h3 className="font-semibold text-lg">Morning Equipment Check</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                      S
                    </div>
                    <span className="text-sm text-muted-foreground">Sarah</span>
                  </div>
                </div>
              </Card>

              {/* Team Progress Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <svg className="transform -rotate-90 w-28 h-28">
                      <circle
                        cx="56"
                        cy="56"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted/30"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.33"
                        strokeDashoffset="20.11"
                        className="text-primary transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">92%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-lg">Team Progress</h3>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Weekly Sterilization Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">Weekly Sterilization</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>8 tasks</span>
                      <span>Compliance</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary rounded-full text-xs font-medium text-white">
                      <Users className="w-4 h-4" />
                      <span>3 tasks assigned</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="text-5xl font-bold mb-6">Track</h2>
              <p className="text-lg text-muted-foreground">
                Run your clinic with precision. Use ready-to-go daily, weekly, and monthly task templates tailored to your practice—or create your own recurring workflows. Track who's done what, when, and how well, all in one clean dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Analyze Section */}
        <section>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-5xl font-bold mb-6">Analyze</h2>
              <p className="text-lg text-muted-foreground">
                See performance at a glance. Dentaleague automatically compiles team analytics, completion rates, and compliance reports so you can identify gaps, reward progress, and keep your operations running at peak efficiency.
              </p>
            </div>

            {/* Cards */}
            <div className="relative space-y-4">
              {/* Team Completion Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Team Completion</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">92%</span>
                      <TrendingUp className="w-5 h-5 text-learning-success" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Performance Trend Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <ChartColumn className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Performance Trend</h3>
                </div>
              </Card>

              {/* Top Performer Card */}
              <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-white animate-pulse" />
                    <TrophyIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm opacity-90">Top Performer</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">Hafsa</h3>
                <div className="text-4xl font-bold">98</div>
              </Card>

              {/* Live Tasks Card */}
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-primary">Live</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">15</div>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">2.3 days avg</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
