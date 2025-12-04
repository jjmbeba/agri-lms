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
import { useEffect } from "react";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { normalizeContentForTiptap } from "@/lib/content-utils";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

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

type CompactNotesEditorProps = {
  content: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
  placeholder?: string;
};

const ToolbarContent = () => (
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
      />
      <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
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
      <ColorHighlightPopover />
      <LinkPopover />
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

export function CompactNotesEditor({
  content,
  onChange,
  onBlur,
  placeholder = "Start writing your notes...",
}: CompactNotesEditorProps) {
  const normalizedContent = normalizeContentForTiptap(content);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": placeholder,
        class:
          "compact-notes-editor prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
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
        onError: () => {
          // Error handling done by the component
        },
      }),
    ],
    content: normalizedContent,
    onUpdate: ({ editor: editorInstance }) => {
      const html = editorInstance.getHTML();
      onChange(html);
    },
    onBlur: () => {
      if (onBlur) {
        onBlur();
      }
    },
  });

  // Update editor content when prop changes (but prevent loops)
  useEffect(() => {
    const currentContent = editor?.getHTML() ?? "";
    const newContent = normalizeContentForTiptap(content);

    // Only update if content actually changed
    if (currentContent !== newContent) {
      editor?.commands.setContent(newContent);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rounded-md border bg-muted/50 p-4">
        <div className="text-muted-foreground text-sm">Loading editor...</div>
      </div>
    );
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="compact-notes-editor-wrapper rounded-md border">
        <Toolbar className="border-b">
          <ToolbarContent />
        </Toolbar>

        <EditorContent
          className="compact-notes-editor-content"
          editor={editor}
          role="presentation"
        />
      </div>
    </EditorContext.Provider>
  );
}
