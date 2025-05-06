declare module 'react-joyride' {
  import { ReactNode } from 'react';

  export interface Step {
    target: string | HTMLElement | (() => HTMLElement);
    content: ReactNode;
    placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
    title?: string;
    disableBeacon?: boolean;
    event?: string;
    isFixed?: boolean;
    offset?: number;
    styles?: object;
  }

  export interface Props {
    steps: Step[];
    run?: boolean;
    continuous?: boolean;
    showProgress?: boolean;
    showSkipButton?: boolean;
    showCloseButton?: boolean;
    callback?: (data: any) => void;
    styles?: object;
    disableOverlayClose?: boolean;
    disableScrolling?: boolean;
    floaterProps?: object;
    hideBackButton?: boolean;
    spotlightPadding?: number;
    spotlightClicks?: boolean;
  }

  export default class ReactJoyride extends React.Component<Props> {}
} 