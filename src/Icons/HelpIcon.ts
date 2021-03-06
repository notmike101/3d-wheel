// @ts-ignore
import { html as ReadmeHTML } from '@/../README.md';
import { Icon } from './Icon';

export class HelpIcon extends Icon {

  constructor(icon: HTMLDivElement) {
    super(icon);
    
    this.setModalInnerContent(ReadmeHTML);
  }
}

export default Object.freeze({
  HelpIcon,
});
