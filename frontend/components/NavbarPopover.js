export default function NavbarPopover(props) {
  const { children, id } = props;
  const positionAnchor = `--anchor-${id}`;
  return (
    <div
      className="nav-popover"
      popover="auto"
      id={id}
      style={{ positionAnchor }}
    >
      <div className="nav-popover__inner">{children}</div>
    </div>
  );
}
