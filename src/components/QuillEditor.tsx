import { useMemo, useRef } from "react";
import ReactQuill from "react-quill";

export default function QuillEditor({
  html,
  handleHtmlChange,
}: {
  html: string;
  handleHtmlChange: (html: string) => void;
}) {
  const quillRef = useRef(null);

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
    <ReactQuill
      ref={quillRef}
      onChange={handleHtmlChange}
      modules={modules}
      formats={formats}
      value={html}
      placeholder={"내용을 입력해주세요"}
      theme="snow"
    />
  );
}
