import QuillNoSSRWrapper from "@/app/util/QuillSSR";
import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import ReactQuill from "react-quill";

export default function QuillEditor({
  html,
  handleHtmlChange,
  placeholder,
}: {
  html: string;
  handleHtmlChange?: (html: any) => void;
  placeholder?: string;
}) {
  const quillInstance = useRef<ReactQuill>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: "1" }, { header: "2" }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { align: [] }],
          ["image"],
        ],
        // handlers: { image: imageHandler },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "align",
    "image",
  ];
  return (
    <QuillNoSSRWrapper
      forwardedRef={quillInstance}
      onChange={handleHtmlChange}
      modules={modules}
      formats={formats}
      value={html}
      placeholder={placeholder ? placeholder : "내용을 입력해주세요"}
      theme="snow"
    />
  );
}
