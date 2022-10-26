import { HelpIcon } from '../src/Icons';
import { EditorIcon } from '../src/Icons';

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
