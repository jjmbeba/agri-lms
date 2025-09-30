"use client";

import { IconSettings, IconShield, IconWorld } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function CourseSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSettings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Configure basic course settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-slug">Course Slug</Label>
              <Input
                defaultValue="sustainable-farming-practices"
                id="course-slug"
                placeholder="sustainable-farming-practices"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-prerequisites">Prerequisites</Label>
            <Textarea
              defaultValue="Basic understanding of agriculture and farming practices"
              id="course-prerequisites"
              placeholder="Describe any prerequisites for this course..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-certificate">Certificate Template</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue placeholder="Select certificate template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Template</SelectItem>
                <SelectItem value="professional">
                  Professional Template
                </SelectItem>
                <SelectItem value="academic">Academic Template</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWorld className="h-5 w-5" />
            Access & Visibility
          </CardTitle>
          <CardDescription>
            Control who can access and view this course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Course</Label>
              <p className="text-muted-foreground text-sm">
                Allow anyone to view and enroll in this course
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-muted-foreground text-sm">
                Manually approve student enrollments
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Guest Access</Label>
              <p className="text-muted-foreground text-sm">
                Let visitors preview course content without enrollment
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-students">Maximum Students</Label>
            <Input
              defaultValue=""
              id="max-students"
              placeholder="Unlimited"
              type="number"
            />
            <p className="text-muted-foreground text-sm">
              Leave empty for unlimited enrollments
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Configure security settings and privacy options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Content Protection</Label>
              <p className="text-muted-foreground text-sm">
                Prevent content from being downloaded or shared
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Watermark Videos</Label>
              <p className="text-muted-foreground text-sm">
                Add watermark to video content
              </p>
            </div>
            <Switch />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Track Progress</Label>
              <p className="text-muted-foreground text-sm">
                Monitor student progress and activity
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Course Status</Label>
            <div className="flex items-center gap-2">
              <Badge
                className="bg-green-100 text-green-800"
                variant="secondary"
              >
                Active
              </Badge>
              <Button size="sm" variant="outline">
                Change Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}
