// The visual track of a switch. Render it right after an `<input type="checkbox" className="peer sr-only" />`.
export default function SwitchTrack() {
  return (
    <span
      aria-hidden="true"
      className="relative h-7 w-12 shrink-0 rounded-full bg-space ring-1 ring-edge transition-colors after:absolute after:start-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[image:var(--gradient-brand)] peer-checked:ring-transparent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-electric peer-disabled:opacity-60 ltr:peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5"
    />
  );
}
