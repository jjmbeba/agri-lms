import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { moduleTypes } from "./constants";
import { useModuleFormContext } from "./module-form-context";

type ReviewFormProps = {
  handleBackStep: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

const ReviewForm = ({
  handleBackStep,
  onSubmit,
  isSubmitting = false,
}: ReviewFormProps) => {
  const { formData } = useModuleFormContext();
  const CONTENT_PREVIEW_LENGTH = 200;

  const getContentTypeName = (type: string) => {
    return moduleTypes.find((t) => t.id === type)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-2xl">Review Module</h2>
        <p className="text-muted-foreground">
          Please review your module information before submitting.
        </p>
      </div>

      <ScrollArea className="h-[400px] pb-4">
        {/* Basic Information Review */}
        {formData.basicInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">
                  Title
                </h4>
                <p className="text-lg">{formData.basicInfo.title}</p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">
                  Description
                </h4>
                <p className="text-sm">{formData.basicInfo.description}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Content Items Review */}
        {formData.content.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Content Items ({formData.content.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.content.map((item, index) => (
                <div
                  className="space-y-2 rounded-lg border p-4"
                  key={`content-${index}-${item.type}`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {getContentTypeName(item.type)}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      Item {index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted-foreground text-sm">
                      Content
                    </h4>
                    <p className="whitespace-pre-wrap text-sm">
                      {item.content.length > CONTENT_PREVIEW_LENGTH
                        ? `${item.content.substring(0, CONTENT_PREVIEW_LENGTH)}...`
                        : item.content}
                    </p>
                  </div>
                  {item.file && (
                    <div>
                      <h4 className="font-medium text-muted-foreground text-sm">
                        File
                      </h4>
                      <p className="text-sm">{item.file.name}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </ScrollArea>
      {/* Navigation Buttons */}
      <div className="flex items-center gap-4">
        <Button onClick={handleBackStep} type="button" variant="outline">
          Back
        </Button>
        <Button disabled={isSubmitting} onClick={onSubmit} type="button">
          {isSubmitting ? "Creating Module..." : "Create Module"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewForm;
