import { JSX } from 'react';

export type PreviewSearchIconProps = {
  onClick?: (keyphrase: string) => void;
  className?: string;
  keyphrase: string;
};

const PreviewSearchIcon = ({
  onClick,
  className,
  keyphrase,
}: PreviewSearchIconProps): JSX.Element => {
  return (
    <span
      className={`preview-search-content-icon fa fa-search ${className || ''}`}
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onClick && onClick(keyphrase);
      }}
    />
  );
};

export default PreviewSearchIcon;
