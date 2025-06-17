declare module "cleave.js/react" {
  import * as React from "react";

  interface CleaveProps extends React.InputHTMLAttributes<HTMLInputElement> {
    options?: any;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
  }

  const Cleave: React.FC<CleaveProps>;

  export default Cleave;
}
