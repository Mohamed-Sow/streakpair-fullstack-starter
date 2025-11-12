'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Calendar, TrendingUp, Award, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakExportProps {
  streakId: string;
  streakTitle: string;
  timezone: string;
  className?: string;
}

export function StreakExport({
  streakId,
  streakTitle,
  timezone,
  className
}: StreakExportProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/streaks/${streakId}/export?format=${exportFormat}&range=${dateRange}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from response headers or generate one
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `streak-${streakTitle.toLowerCase().replace(/\s+/g, '-')}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        filename += `.${exportFormat}`;
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      // In a real app, you'd show a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      // Generate shareable summary (in a real app, this might create a public link)
      const shareData = {
        title: `My ${streakTitle} Streak Progress`,
        text: `Check out my progress on ${streakTitle}! I've been building habits with accountability.`,
        url: window.location.href,
      };

      if (navigator.share && window.location.protocol === 'https:') {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        // In a real app, you'd show a success toast here
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7days':
        return 'Last 7 days';
      case '30days':
        return 'Last 30 days';
      case '90days':
        return 'Last 90 days';
      case 'all':
        return 'All time';
      default:
        return range;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'csv':
        return 'CSV (Excel)';
      case 'json':
        return 'JSON (Data)';
      case 'pdf':
        return 'PDF (Report)';
      default:
        return format;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Share
        </CardTitle>
        <CardDescription>
          Download your streak data or share your progress with others
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Export Options */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="json">JSON (Data)</SelectItem>
                  <SelectItem value="pdf">PDF (Report)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {getFormatLabel(exportFormat)} ({getDateRangeLabel(dateRange)})
              </>
            )}
          </Button>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Your Progress
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleShare} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Progress
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  // In a real app, you'd show a success toast here
                }}
                className="w-full"
              >
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="space-y-3">
          <h4 className="font-medium">What's Included:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Daily check-in history and dates</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Completion rates and streak analytics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Team participation and collaboration data</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Achievements and milestones reached</span>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Privacy:</strong> Only your own check-in data is included in exports.
            Team member information is anonymized to protect privacy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}