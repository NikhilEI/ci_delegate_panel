// Wraps the theme's own .avatar > .avatar-initial pattern (the same
// structure used for the navbar's user avatar) - .avatar-initial centers its
// content via `position:absolute; inset:0; display:flex;` relative to the
// sized .avatar parent, which is what actually keeps the icon glyph
// centered inside the circle. Flattening the two classes onto one element
// (as earlier versions of PageHeader/StatCard did) breaks that centering.
export default function IconBadge({ icon, tint = "primary", size = 44, iconSize }) {
  return (
    <div className="avatar" style={{ width: size, height: size, flexShrink: 0 }}>
      <span className={`avatar-initial rounded-circle bg-label-${tint}`}>
        <i className={`bx ${icon}`} style={{ fontSize: iconSize || Math.round(size * 0.48) }}></i>
      </span>
    </div>
  );
}
