import { HelpIcon } from '@/Icons';
import { EditorIcon } from '@/Icons';

export interface IconInterface {
  isModalVisible: boolean;
  isIconVisible: boolean;

  toggleModalVisibility(): void;
  toggleIconVisibility(): void;
  setModalInnerContent(content: any): void;
}

export interface Icons {
  help?: HelpIcon;
  editor?: EditorIcon;
}

export interface IconControllerInterface {
  isVisible: boolean;
}
