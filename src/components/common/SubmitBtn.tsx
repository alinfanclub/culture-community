export default function SubmitBtn({
  text,
  style,
}: {
  text: string;
  style: string;
}) {
  return (
    <button
      type="submit"
      className={`${style} w-20 h-10 border border-white rounded-lg hover:bg-white hover:text-black transition-all`}
    >
      {text}
    </button>
  );
}
