// @ts-ignore
import { html as ReadmeHTML } from '@/../README.md';
import { Icon } from './Icon';

export class HelpIcon extends Icon {
  constructor(icon: HTMLElement) {
    super(icon);

    this.setModalInnerContent(ReadmeHTML);
  }
}
