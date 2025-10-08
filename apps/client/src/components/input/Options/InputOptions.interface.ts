export interface InputOptionsProps {
  value?: Record<string, number>;
  onChange?: (next: Record<string, number>) => void;
  placeholder?: string;
  className?: string;
}
