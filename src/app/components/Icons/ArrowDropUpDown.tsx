export default function IconArrowDropDownFill(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="30px"
      width="30px"
      style={{ cursor: 'inherit', userSelect: 'none' }}
      {...props}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 14l-4-4h8z" />
    </svg>
  );
}