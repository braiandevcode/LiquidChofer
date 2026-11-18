import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { ICommonProps } from '../interfaces/props/ICommonProps';

const ModalPortal = ({ children }: ICommonProps): ReactNode => {
  return createPortal(children, document.body)
}

export default ModalPortal;
