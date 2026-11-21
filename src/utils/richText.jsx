// Turns "plain **highlighted** plain" copy into React nodes.
export function renderRichText(text) {
  return text.split('**').map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="rounded-md bg-bow/15 box-decoration-clone px-1.5 py-0.5 font-bold text-white">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
