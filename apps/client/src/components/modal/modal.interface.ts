import type { FormItemProps } from "antd";
import type { ReactElement, ElementType } from "react";

export type FormField = {
  name: string;
  label?: ReactElement | string;
  component: ElementType;
  componentProps?: Record<string, any>;
  formItemProps?: FormItemProps;
};



export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}