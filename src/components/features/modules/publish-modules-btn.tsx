"use client";

import { IconRocket } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";

type PublishModulesBtnProps = {
  courseId: string;
  onSuccess?: () => void;
  disabled?: boolean;
};

const PublishModulesBtn = ({
  courseId,
  onSuccess,
  disabled = false,
}: PublishModulesBtnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [changeLog, setChangeLog] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const { mutate: publishModules } =
    trpc.modules.publishDraftModules.useMutation({
      onSuccess: (data) => {
        toast.success(`Successfully published version ${data.versionNumber}`);
        setIsOpen(false);
        setChangeLog("");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
        setIsPublishing(false);
      },
    });

  const handlePublish = () => {
    setIsPublishing(true);
    publishModules({
      courseId,
      changeLog: changeLog.trim() || undefined,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!(open || isPublishing)) {
      setChangeLog("");
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="sm" variant="default">
          <IconRocket className="mr-2 h-4 w-4" />
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publish Draft Modules</DialogTitle>
          <DialogDescription>
            This will create a new published version of your course with all
            current draft modules. You can add a changelog to describe what's
            new in this version.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="changelog">Changelog (optional)</Label>
            <Textarea
              id="changelog"
              onChange={(e) => setChangeLog(e.target.value)}
              placeholder="Describe what's new in this version..."
              rows={3}
              value={changeLog}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPublishing}
            onClick={() => setIsOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isPublishing} onClick={handlePublish} type="button">
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishModulesBtn;
