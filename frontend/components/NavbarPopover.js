export default function NavbarPopover(props) {
  const { children, id } = props;
  const positionAnchor = `--anchor-${id}`;
  return (
    <div
      className="shadow nav-popover"
      popover="auto"
      id={id}
      style={{ positionAnchor }}
    >
      {children}
    </div>
  );
}
