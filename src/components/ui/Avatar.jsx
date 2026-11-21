import SmartImage from './SmartImage.jsx';

// A round profile picture; the first letter of `name` is shown when there is no photo or it fails to load.
export default function Avatar({ photoURL, name = '', className = 'size-8 text-sm' }) {
  const fallback = <span aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>;

  return (
    <span className={`bg-brand grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white ${className}`}>
      {photoURL ? (
        <SmartImage
          key={photoURL}
          src={photoURL}
          alt=""
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          fallback={fallback}
        />
      ) : (
        fallback
      )}
    </span>
  );
}
