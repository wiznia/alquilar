export default function NavbarPopover(props) {
  const { children, id, popoverAction = 'auto' } = props;
  const positionAnchor = `--anchor-${id}`;

  return (
    <div
      className="nav-popover"
      popover={popoverAction}
      id={id}
      style={{ positionAnchor }}
    >
      <div className="nav-popover__inner">{children}</div>
    </div>
  );
}
