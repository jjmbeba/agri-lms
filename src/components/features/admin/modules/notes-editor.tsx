"use client";

import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Selection } from "@tiptap/extensions";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@/components/tiptap-ui/color-highlight-popover";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/components/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { Button as UIButton } from "@/components/ui/button";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { useWindowSize } from "@/hooks/use-window-size";
import { normalizeContentForTiptap } from "@/lib/content-utils";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import FileHandler from '@tiptap/extension-file-handler'

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";

const HEADING_LEVEL_ONE = 1;
const HEADING_LEVEL_TWO = 2;
const HEADING_LEVEL_THREE = 3;
const HEADING_LEVEL_FOUR = 4;

type NotesEditorProps = {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
};

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => (
  <>
    <Spacer />

    <ToolbarGroup>
      <UndoRedoButton action="undo" />
      <UndoRedoButton action="redo" />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <HeadingDropdownMenu
        levels={[
          HEADING_LEVEL_ONE,
          HEADING_LEVEL_TWO,
          HEADING_LEVEL_THREE,
          HEADING_LEVEL_FOUR,
        ]}
        portal={isMobile}
      />
      <ListDropdownMenu
        portal={isMobile}
        types={["bulletList", "orderedList", "taskList"]}
      />
      <BlockquoteButton />
      <CodeBlockButton />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <MarkButton type="bold" />
      <MarkButton type="italic" />
      <MarkButton type="strike" />
      <MarkButton type="code" />
      <MarkButton type="underline" />
      {isMobile ? (
        <ColorHighlightPopoverButton onClick={onHighlighterClick} />
      ) : (
        <ColorHighlightPopover />
      )}
      {isMobile ? <LinkButton onClick={onLinkClick} /> : <LinkPopover />}
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <MarkButton type="superscript" />
      <MarkButton type="subscript" />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <TextAlignButton align="left" />
      <TextAlignButton align="center" />
      <TextAlignButton align="right" />
      <TextAlignButton align="justify" />
    </ToolbarGroup>

    <ToolbarSeparator />

    <ToolbarGroup>
      <ImageUploadButton text="Add" />
    </ToolbarGroup>

    <Spacer />
  </>
);

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function NotesEditor({
  initialContent,
  onSave,
  onCancel,
  isSaving = false,
}: NotesEditorProps) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  );
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  const normalizedContent = normalizeContentForTiptap(initialContent);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Notes editor, start typing to enter content.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => {
          alert(error?.message ?? "Image upload failed");
        },
      }),
      FileHandler.configure({
        onPaste: async (editor, files) => {
          for (const file of files) {
            if (!file.type.startsWith("image/")) {
              continue;
            }

            if (file.size > MAX_FILE_SIZE) {
              alert(
                `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
              );
              continue;
            }

            try {
              const abortController = new AbortController();
              const url = await handleImageUpload(
                file,
                undefined,
                abortController.signal
              );

              const alt = file.name.replace(/\.[^/.]+$/, "") || "image";

              editor
                .chain()
                .focus()
                .setImage({
                  src: url,
                  alt,
                  title: alt,
                })
                .run();
            } catch (error) {
              alert(
                error instanceof Error ? error.message : "Image upload failed"
              );
            }
          }
        },
      }),
    ],
    content: normalizedContent,
    onUpdate: () => {
      setHasChanges(true);
    },
  });

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    const content = normalizeContentForTiptap(initialContent);
    editor?.commands.setContent(content);
    setHasChanges(false);
  }, [initialContent, editor]);

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  useEffect(() => {
    const toolbarElement = toolbarRef.current;
    if (!toolbarElement) {
      setToolbarHeight(0);
      return;
    }

    const updateHeight = () => {
      setToolbarHeight(toolbarElement.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(toolbarElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobile]);

  const handleSave = () => {
    const html = editor?.getHTML() ?? "";
    onSave(html);
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmCancel) {
        return;
      }
    }
    onCancel();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="simple-editor-wrapper flex-1 !h-auto !w-full overflow-auto">
        <EditorContext.Provider value={{ editor }}>
          <Toolbar
            ref={toolbarRef}
            className="sticky top-0 z-10"
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                isMobile={isMobile}
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
              />
            ) : (
              <MobileToolbarContent
                onBack={() => setMobileView("main")}
                type={mobileView === "highlighter" ? "highlighter" : "link"}
              />
            )}
          </Toolbar>

          <EditorContent
            className="simple-editor-content"
            editor={editor}
            style={{ paddingTop: isMobile ? toolbarHeight : 0 }}
            role="presentation"
          />
        </EditorContext.Provider>
      </div>

      <div className="flex items-center justify-end gap-2 border-t bg-background p-4">
        <UIButton
          disabled={isSaving}
          onClick={handleCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </UIButton>
        <UIButton
          disabled={isSaving || !hasChanges}
          onClick={handleSave}
          type="button"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </UIButton>
      </div>
    </div>
  );
}
