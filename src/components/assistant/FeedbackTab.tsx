import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Award, MessageSquare, Calendar, Trophy, Star, Target, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserInitials } from '@/lib/taskUtils';

interface Feedback {
  id: string;
  title: string;
  message: string;
  feedback_type: string;
  created_at: string;
  owner: {
    name: string;
  } | null;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  badge_type: string;
  badge_color: string;
  achieved_at: string;
}

const badgeIcons = {
  patients_100: Trophy,
  streak_30: Zap,
  certification_complete: Award,
  feedback_positive: Star,
  tasks_completed: Target,
  default: Award
};

const badgeColors = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
};

export default function FeedbackTab() {
  const { user, userProfile } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbackAndMilestones = async () => {
    if (!user?.id || !userProfile?.clinic_id) return;

    try {
      // Fetch feedback - simplified for now
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('id, title, message, feedback_type, created_at')
        .eq('assistant_id', user.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      // Add mock owner data for now
      const feedbackWithOwner = (feedbackData || []).map(item => ({
        ...item,
        owner: { name: 'Owner' }
      }));

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false });

      if (milestonesError) throw milestonesError;

      setFeedback(feedbackWithOwner);
      setMilestones(milestonesData || []);
    } catch (error) {
      console.error('Error fetching feedback and milestones:', error);
      toast.error('Failed to load feedback and milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackAndMilestones();
  }, [user, userProfile]);

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'praise':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'improvement':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'milestone':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-900 mb-2">
              Feedback & Growth
            </h1>
            <p className="text-green-700">
              Track your professional development and achievements.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Growing
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{feedback.length}</p>
                <p className="text-sm text-blue-600">Total Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{milestones.length}</p>
                <p className="text-sm text-purple-600">Milestones Achieved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {feedback.filter(f => f.feedback_type === 'praise').length}
                </p>
                <p className="text-sm text-green-600">Positive Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones & Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>Your Achievements</span>
            </CardTitle>
            <CardDescription>
              Badges and milestones you've earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="text-slate-500">No milestones achieved yet</p>
                <p className="text-sm text-slate-400 mt-1">Keep working to earn your first badge!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone) => {
                  const IconComponent = badgeIcons[milestone.badge_type as keyof typeof badgeIcons] || badgeIcons.default;
                  const colorClass = badgeColors[milestone.badge_color as keyof typeof badgeColors] || badgeColors.blue;
                  
                  return (
                    <div key={milestone.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className={`p-3 rounded-xl ${colorClass}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {milestone.badge_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(milestone.achieved_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Recent Feedback</span>
            </CardTitle>
            <CardDescription>
              Latest feedback from your clinic owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p className="text-slate-500">No feedback yet</p>
                <p className="text-sm text-slate-400 mt-1">Feedback will appear here when available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.slice(0, 5).map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          {getUserInitials(item.owner?.name || 'Owner')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-900">{item.title}</h4>
                          <Badge className={`text-xs ${getFeedbackTypeColor(item.feedback_type)}`}>
                            {item.feedback_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.message}</p>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>by {item.owner?.name || 'Owner'}</span>
                        </div>
                      </div>
                    </div>
                    {index < feedback.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Growth Timeline</span>
          </CardTitle>
          <CardDescription>
            Your professional development journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 && milestones.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Your Journey Starts Here</h3>
              <p className="text-slate-500">
                As you work and grow, your feedback and achievements will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {[...feedback, ...milestones]
                .sort((a, b) => {
                  const dateA = 'created_at' in a ? a.created_at : a.achieved_at;
                  const dateB = 'created_at' in b ? b.created_at : b.achieved_at;
                  return new Date(dateB).getTime() - new Date(dateA).getTime();
                })
                .slice(0, 10)
                .map((item, index) => {
                  const isFeedback = 'feedback_type' in item;
                  const date = isFeedback ? item.created_at : item.achieved_at;
                  
                  return (
                    <div key={`${isFeedback ? 'feedback' : 'milestone'}-${item.id}`} className="flex items-start space-x-4">
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${
                          isFeedback ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        {index < 9 && (
                          <div className="absolute top-3 left-1/2 w-px h-8 bg-slate-200 transform -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-slate-900">
                            {isFeedback ? item.title : item.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {isFeedback ? 'Feedback' : 'Milestone'}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {isFeedback ? item.message : item.description}
                        </p>
                        <span className="text-xs text-slate-500">
                          {new Date(date).toLocaleDateString()}
                          {isFeedback && item.owner?.name && ` • by ${item.owner.name}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}