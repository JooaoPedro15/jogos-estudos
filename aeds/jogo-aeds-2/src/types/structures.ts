export type TreeNodeView = {
  id: string;
  label: string;
  color?: 'black' | 'white';
  left?: TreeNodeView;
  right?: TreeNodeView;
};

export type HashSlotView = {
  index: number;
  value?: string;
  status?: 'empty' | 'occupied' | 'collision' | 'reserved';
};

export type TrieNodeView = {
  id: string;
  char: string;
  folha?: boolean;
  children?: TrieNodeView[];
};

export type TreeVisualState = {
  id: string;
  kind: 'tree';
  root?: TreeNodeView;
};

export type HashVisualState = {
  id: string;
  kind: 'hash';
  slots: HashSlotView[];
};

export type TrieVisualState = {
  id: string;
  kind: 'trie';
  root: TrieNodeView;
};

export type HybridLayerView = {
  id: string;
  label: string;
  items: string[];
};

export type HybridVisualState = {
  id: string;
  kind: 'hybrid';
  layers: HybridLayerView[];
};

export type VisualState =
  | TreeVisualState
  | HashVisualState
  | TrieVisualState
  | HybridVisualState;
