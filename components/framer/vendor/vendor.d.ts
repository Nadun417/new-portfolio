declare module "*.js" {
  import type { ComponentType } from "react";
  const C: ComponentType<Record<string, unknown>>;
  export default C;
}
