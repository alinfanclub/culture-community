import { useMemo, useRef } from "react";
import ReactQuill from "react-quill";

export default function QuillViewer({ html }: { html: string }) {
  return (
    <ReactQuill
      value={html}
      theme="snow"
      className="custom-quill"
      tabIndex={100}
      readOnly={false}
    />
  );
}
