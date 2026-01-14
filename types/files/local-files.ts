export type ProjectFileNode = {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: ProjectFileNode[];
};
