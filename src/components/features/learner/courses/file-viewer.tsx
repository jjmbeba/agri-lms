"use client";

import { Download, File, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { getFileTypeFromUrl } from "@/lib/content-utils";

type FileType = ReturnType<typeof getFileTypeFromUrl>;

type FileViewerProps = {
  url: string;
  fileType: FileType;
  className?: string;
};

const getFileIcon = (fileType: FileType) => {
  switch (fileType) {
    case "pdf":
      return <FileText className="h-8 w-8 text-red-600" />;
    case "docx":
    case "doc":
      return <FileText className="h-8 w-8 text-blue-600" />;
    case "xlsx":
      return <FileText className="h-8 w-8 text-green-600" />;
    case "pptx":
      return <FileText className="h-8 w-8 text-orange-600" />;
    default:
      return <File className="h-8 w-8 text-gray-600" />;
  }
};

const getFileTypeLabel = (fileType: FileType): string => {
  switch (fileType) {
    case "pdf":
      return "PDF Document";
    case "docx":
      return "Word Document";
    case "doc":
      return "Word Document";
    case "xlsx":
      return "Excel Spreadsheet";
    case "pptx":
      return "PowerPoint Presentation";
    default:
      return "File";
  }
};

const extractFileName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split("/").pop() || "document";
    // Remove query parameters if any
    return fileName.split("?")[0] || "document";
  } catch {
    // Fallback: try to extract from URL string
    const match = url.match(/\/([^/?]+)(?:\?|$)/);
    return match ? match[1] : "document";
  }
};

export function FileViewer({ url, fileType, className = "" }: FileViewerProps) {
  const [pdfError, setPdfError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!fileType || fileType === "unknown") {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
          <File className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-sm">Unknown File Type</p>
            <p className="text-muted-foreground text-xs">
              Unable to determine file type
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <a download href={url} rel="noopener noreferrer" target="_blank">
              <Download className="mr-2 size-4" />
              Download File
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // PDF viewer
  if (fileType === "pdf") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="relative w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <iframe
            className="w-full rounded-md border"
            height="600"
            onError={() => {
              setPdfError(true);
              setIsLoading(false);
            }}
            onLoad={() => setIsLoading(false)}
            src={url}
            title="PDF Viewer"
          />
          {pdfError && (
            <div className="rounded-md border bg-destructive/10 p-4 text-center">
              <p className="mb-2 font-medium text-sm text-destructive">
                Failed to load PDF
              </p>
              <Button asChild size="sm" variant="outline">
                <a download href={url} rel="noopener noreferrer" target="_blank">
                  <Download className="mr-2 size-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Download link for other file types
  const fileName = extractFileName(url);
  const fileTypeLabel = getFileTypeLabel(fileType);

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
        {getFileIcon(fileType)}
        <div className="text-center">
          <p className="font-medium text-sm">{fileTypeLabel}</p>
          <p className="text-muted-foreground text-xs">{fileName}</p>
        </div>
        <Button asChild size="sm" variant="default">
          <a download href={url} rel="noopener noreferrer" target="_blank">
            <Download className="mr-2 size-4" />
            Download File
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

