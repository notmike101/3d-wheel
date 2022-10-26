import { HelpIcon } from '../src/Icons';
import { EditorIcon } from '../src/Icons';

interface IconInterface {
  isModalVisible: boolean;
  isIconVisible: boolean;

  toggleModalVisibility();
  toggleIconVisibility();
  setModalInnerContent(content: any);
}

interface Icons {
  help?: HelpIcon;
  editor?: EditorIcon;
}

interface IconControllerInterface {
  isVisible: boolean;
}
